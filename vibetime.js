// vibetime — passive AI time tracking, as a SQLite-backed Durable Object.
// A Cloudflare-native port of the Go server (github.com/IzieStratt/vibetime); the Go CLI
// agent talks to this over /vibetime/app/*. Phase 1: accounts + Hack Club login + sync +
// live profile. Phase 2 (submissions + fraud audit) lives in the Go server for now.
import { DurableObject } from 'cloudflare:workers'
import { STREAK_MIN, CAPS, clamp, streaks, dayParts, validTZ, esc } from './vibetime-core.js'

const SYNC_WINDOW_MIN = 15 // minutes may only be reported while this fresh (anti-backfill)

const json = (v, status = 200, headers = {}) =>
  new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json', ...headers } })
const fail = (status, error) => json({ error }, status)

async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
}
function token() {
  const b = new Uint8Array(24)
  crypto.getRandomValues(b)
  return 'vt_' + [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}
const HANDLE = /^[a-z0-9][a-z0-9_-]{1,31}$/
const DEVICE = /^[A-Za-z0-9_-]{8,64}$/

export class Vibetime extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, handle TEXT UNIQUE NOT NULL,
        token_sha TEXT UNIQUE NOT NULL, reviewer INTEGER NOT NULL DEFAULT 0, public INTEGER NOT NULL DEFAULT 1,
        created INTEGER NOT NULL, oauth_sub TEXT UNIQUE, email TEXT, slack_id TEXT, verification_status TEXT, ysws_eligible INTEGER);
      CREATE TABLE IF NOT EXISTS commitments (user_id INTEGER NOT NULL, device TEXT NOT NULL, head TEXT NOT NULL,
        count INTEGER NOT NULL, received_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS commitments_dev ON commitments(user_id, device, received_at);
      CREATE TABLE IF NOT EXISTS minutes (user_id INTEGER NOT NULL, device TEXT NOT NULL, project TEXT NOT NULL,
        minute INTEGER NOT NULL, seconds INTEGER NOT NULL, prompts INTEGER NOT NULL DEFAULT 0, ai_lines INTEGER NOT NULL DEFAULT 0,
        human_edits INTEGER NOT NULL DEFAULT 0, hands_on INTEGER NOT NULL DEFAULT 0, steering INTEGER NOT NULL DEFAULT 0,
        watching INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, device, project, minute));
      CREATE INDEX IF NOT EXISTS minutes_user ON minutes(user_id, minute);
      CREATE TABLE IF NOT EXISTS imported (user_id INTEGER NOT NULL, source TEXT NOT NULL, date TEXT NOT NULL,
        project TEXT NOT NULL, seconds INTEGER NOT NULL, PRIMARY KEY (user_id, source, date, project));
    `)
    this.sockets = new Map() // user_id -> Set<WebSocket>
  }

  now() {
    return this.env.VIBETIME_NOW ? new Date(this.env.VIBETIME_NOW) : new Date()
  }

  // ---- accounts
  async userByToken(req) {
    const auth = req.headers.get('Authorization') || ''
    const tok = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!tok) return null
    const row = this.sql.exec('SELECT * FROM users WHERE token_sha = ?', await sha256hex(tok)).toArray()[0]
    return row || null
  }
  userByHandle(handle) {
    return this.sql.exec('SELECT * FROM users WHERE handle = ?', handle).toArray()[0] || null
  }

  async freshHandle(name) {
    let h = (name || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^[-_]+|[-_]+$/g, '').slice(0, 24)
    if (h.length < 2) h = 'user'
    for (let i = 0; ; i++) {
      const c = i === 0 ? h : `${h}-${i + 1}`
      if (!this.userByHandle(c)) return c
    }
  }

  async makeUser(handle, { reviewer = 0, sub = null, email = null, slack = null, verification = null, eligible = null } = {}) {
    const tok = token()
    this.sql.exec(
      'INSERT INTO users(handle, token_sha, reviewer, created, oauth_sub, email, slack_id, verification_status, ysws_eligible) VALUES(?,?,?,?,?,?,?,?,?)',
      handle, await sha256hex(tok), reviewer, Math.floor(this.now() / 1000), sub, email, slack, verification,
      eligible === null ? null : eligible ? 1 : 0,
    )
    return tok
  }

  // ---- sync (live commitments + minute aggregates)
  async sync(user, body) {
    if (!DEVICE.test(body.device || '') || (body.head || '').length !== 64) return fail(400, 'bad device or head')
    const now = this.now()
    const nowS = Math.floor(now / 1000)
    this.sql.exec('INSERT INTO commitments(user_id, device, head, count, received_at) VALUES(?,?,?,?,?)',
      user.id, body.device, body.head, body.count | 0, now.getTime())
    const oldest = Math.floor((nowS - SYNC_WINDOW_MIN * 60) / 60) * 60
    let accepted = 0, rejected = 0
    for (const m of body.minutes || []) {
      if (m.minute % 60 !== 0 || m.minute < oldest || m.minute > nowS || !m.project || m.project.length > 200) {
        rejected++
        continue
      }
      this.sql.exec(
        `INSERT INTO minutes(user_id, device, project, minute, seconds, prompts, ai_lines, human_edits, hands_on, steering, watching)
         VALUES(?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(user_id, device, project, minute) DO UPDATE SET seconds=excluded.seconds, prompts=excluded.prompts,
           ai_lines=excluded.ai_lines, human_edits=excluded.human_edits, hands_on=excluded.hands_on,
           steering=excluded.steering, watching=excluded.watching`,
        user.id, body.device, m.project, m.minute, clamp(m.seconds, 0, 60), clamp(m.prompts || 0, 0, CAPS.prompts),
        clamp(m.ai_lines || 0, 0, 10000), clamp(m.human_edits || 0, 0, 10000),
        clamp(m.hands_on || 0, 0, 60), clamp(m.steering || 0, 0, 60), clamp(m.watching || 0, 0, 60))
      accepted++
    }
    this.notify(user.id)
    return json({ accepted, rejected })
  }

  // ---- stats / insights (cross-device merge, at most 60s per minute)
  insights(user, loc) {
    const now = this.now()
    const parts = dayParts(now, loc)
    const today = parts.start // ms at local midnight today
    const start = today - 29 * 86400000
    const rows = this.sql.exec(
      'SELECT project, minute, seconds, prompts, ai_lines, human_edits, hands_on, steering, watching FROM minutes WHERE user_id = ? AND minute >= ?',
      user.id, Math.floor((start - 86400000) / 1000),
    ).toArray()
    const perMin = new Map() // minute -> [{project,sec,modes}]
    let prompts = 0, aiLines = 0, humanEdits = 0
    const countPerMin = new Map()
    for (const r of rows) {
      if (r.minute * 1000 < start) continue
      if (!perMin.has(r.minute)) perMin.set(r.minute, [])
      perMin.get(r.minute).push({ project: r.project, sec: r.seconds, modes: [r.hands_on, r.steering, r.watching] })
      const c = countPerMin.get(r.minute) || [0, 0, 0]
      countPerMin.set(r.minute, [c[0] + r.prompts, c[1] + r.ai_lines, c[2] + r.human_edits])
    }
    for (const c of countPerMin.values()) {
      prompts += Math.min(c[0], CAPS.prompts)
      aiLines += Math.min(c[1], CAPS.ai_lines)
      humanEdits += Math.min(c[2], CAPS.human_edits)
    }
    const byDay = new Map(), frac = new Map()
    let total = 0, todaySec = 0, week = 0, prevWeek = 0
    let hands = 0, steer = 0, watch = 0
    const weekStart = Math.floor((today - 6 * 86400000) / 1000), prevStart = Math.floor((today - 13 * 86400000) / 1000)
    for (const [minute, list] of perMin) {
      let sum = 0
      for (const x of list) sum += x.sec
      const capped = Math.min(sum, 60)
      const dayKey = dayParts(new Date(minute * 1000), loc).key
      byDay.set(dayKey, (byDay.get(dayKey) || 0) + capped)
      total += capped
      if (minute >= weekStart) week += capped
      else if (minute >= prevStart) prevWeek += capped
      const scale = sum > 0 ? capped / sum : 0
      for (const x of list) {
        if (sum > 0) frac.set(x.project, (frac.get(x.project) || 0) + x.sec * capped / sum)
        hands += Math.round(x.modes[0] * scale)
        steer += Math.round(x.modes[1] * scale)
        watch += Math.round(x.modes[2] * scale)
      }
    }
    const days = []
    let best = { date: '', seconds: 0 }
    for (let d = new Date(start); +dayParts(d, loc).start <= +today; d = new Date(+d + 86400000)) {
      const key = dayParts(d, loc).key
      const day = { date: key, seconds: byDay.get(key) || 0 }
      days.push(day)
      if (day.seconds > best.seconds) best = day
    }
    const [current, longest] = streaks(days)
    const projects = {}
    for (const [p, f] of frac) projects[p] = Math.round(f)
    const imp = this.importedTotals(user.id)
    return {
      handle: user.handle, days, current_streak: current, longest_streak: longest, projects,
      prompts, ai_lines: aiLines, human_edits: humanEdits,
      prompts_per_hour: total > 0 ? prompts / (total / 3600) : 0, best_day: best,
      week_seconds: week, prev_week_seconds: prevWeek,
      hands_on_seconds: hands, steering_seconds: steer, watching_seconds: watch,
      imported: imp.byProject, imported_seconds: imp.total,
    }
  }

  importedTotals(uid) {
    const rows = this.sql.exec('SELECT project, SUM(seconds) s FROM imported WHERE user_id = ? GROUP BY project', uid).toArray()
    const byProject = {}
    let total = 0
    for (const r of rows) { byProject[r.project] = r.s; total += r.s }
    return { byProject, total }
  }

  async importHistory(user, body) {
    if (!/^[a-z0-9_-]{2,32}$/.test(body.source || '')) return fail(400, 'bad source')
    let ok = 0, bad = 0
    for (const d of body.days || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date || '') || !d.project || d.project.length > 200 || !(d.seconds > 0)) { bad++; continue }
      this.sql.exec('INSERT INTO imported(user_id, source, date, project, seconds) VALUES(?,?,?,?,?) ON CONFLICT(user_id, source, date, project) DO UPDATE SET seconds = excluded.seconds',
        user.id, body.source, d.date, d.project, Math.min(d.seconds | 0, 86400))
      ok++
    }
    this.notify(user.id)
    return json({ imported: ok, rejected: bad })
  }

  // ---- live updates over WebSocket
  notify(uid) {
    const set = this.sockets.get(uid)
    if (!set) return
    const msg = JSON.stringify(this.insights(this.userById(uid), 'UTC'))
    for (const ws of set) { try { ws.send(msg) } catch {} }
  }
  userById(id) {
    return this.sql.exec('SELECT * FROM users WHERE id = ?', id).toArray()[0] || null
  }

  // ---- HTTP entry (prefix already stripped by the worker: paths start at /)
  async fetch(request) {
    const url = new URL(request.url)
    const p = url.pathname
    const method = request.method
    try {
      if (p === '/healthz') return new Response('ok')
      if (p === '/auth/login' && method === 'GET') return this.oauthStart(url)
      if (p === '/auth/callback' && method === 'GET') return this.oauthCallback(request, url)

      let m
      if ((m = p.match(/^\/api\/v1\/users\/([^/]+)\/(stats|insights|live)$/))) {
        const user = this.userByHandle(decodeURIComponent(m[1]))
        if (!user || !user.public) return fail(404, 'no such public user')
        const loc = url.searchParams.get('tz') || 'UTC'
        if (!validTZ(loc)) return fail(400, 'unknown time zone')
        if (m[2] === 'live') return this.live(request, user)
        const ins = this.insights(user, loc)
        return m[2] === 'stats'
          ? json({ handle: user.handle, today_seconds: ins.days.at(-1)?.seconds || 0, week_seconds: ins.week_seconds, projects: ins.projects })
          : json(ins)
      }
      if ((m = p.match(/^\/u\/([^/]+)$/))) {
        const user = this.userByHandle(decodeURIComponent(m[1]))
        if (!user || !user.public) return new Response('not found', { status: 404 })
        return this.profilePage(user)
      }

      // authed
      const user = await this.userByToken(request)
      if (p === '/api/v1/sync' && method === 'POST') {
        if (!user) return fail(401, 'bad token')
        return this.sync(user, await request.json())
      }
      if (p === '/api/v1/import' && method === 'POST') {
        if (!user) return fail(401, 'bad token')
        return this.importHistory(user, await request.json())
      }
      if (p === '/api/v1/me' && method === 'POST') {
        if (!user) return fail(401, 'bad token')
        const b = await request.json()
        if (typeof b.public === 'boolean') this.sql.exec('UPDATE users SET public = ? WHERE id = ?', b.public ? 1 : 0, user.id)
        return json({ ok: true })
      }
      // dev-only signup, gated by a secret var (production uses /auth/login)
      if (p === '/api/v1/signup' && method === 'POST') {
        if (this.env.VIBETIME_OPEN_SIGNUP !== 'true') return fail(403, 'signup is via Hack Club login')
        const b = await request.json()
        try {
          const tok = await this.makeUser(b.handle, {})
          return json({ handle: b.handle, token: tok }, 201)
        } catch (e) {
          return fail(400, e.message || 'bad handle')
        }
      }
      return fail(404, 'not found')
    } catch (e) {
      return fail(500, String(e && e.message || e))
    }
  }

  // ---- OAuth (Hack Club Auth / OIDC)
  oauthStart(url) {
    const o = this.oauthCfg()
    if (!o) return fail(404, 'login not configured')
    const state = token().slice(3)
    const q = new URLSearchParams({
      response_type: 'code', client_id: o.clientId, redirect_uri: o.redirect,
      scope: 'openid profile email slack_id verification_status', state,
    })
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${o.authorize}?${q}`,
        'Set-Cookie': `vt_state=${state}; Path=/vibetime/app/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      },
    })
  }

  async oauthCallback(request, url) {
    const o = this.oauthCfg()
    if (!o) return fail(404, 'login not configured')
    const cookie = (request.headers.get('Cookie') || '').match(/vt_state=([^;]+)/)
    if (!cookie || cookie[1] !== url.searchParams.get('state')) return fail(400, 'bad state')
    const code = url.searchParams.get('code')
    if (!code) return fail(400, 'missing code')
    const tr = await fetch(o.token, {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: o.redirect, client_id: o.clientId, client_secret: o.clientSecret }),
    })
    if (!tr.ok) return fail(502, 'token exchange failed')
    const tok = await tr.json()
    if (!tok.access_token) return fail(502, 'token exchange failed')
    const ur = await fetch(o.userinfo, { headers: { Authorization: `Bearer ${tok.access_token}` } })
    if (!ur.ok) return fail(502, 'userinfo failed')
    const info = await ur.json()
    if (!info.sub) return fail(502, 'userinfo failed')
    const apiTok = token()
    const existing = this.sql.exec('SELECT handle FROM users WHERE oauth_sub = ?', info.sub).toArray()[0]
    let handle
    if (existing) {
      handle = existing.handle
      this.sql.exec('UPDATE users SET token_sha = ?, email = ?, slack_id = ?, verification_status = ?, ysws_eligible = ? WHERE oauth_sub = ?',
        await sha256hex(apiTok), info.email || null, info.slack_id || null, info.verification_status || null,
        info.ysws_eligible == null ? null : info.ysws_eligible ? 1 : 0, info.sub)
    } else {
      handle = await this.freshHandle(info.preferred_username || info.nickname || info.name)
      this.sql.exec('INSERT INTO users(handle, token_sha, created, oauth_sub, email, slack_id, verification_status, ysws_eligible) VALUES(?,?,?,?,?,?,?,?)',
        handle, await sha256hex(apiTok), Math.floor(this.now() / 1000), info.sub, info.email || null, info.slack_id || null,
        info.verification_status || null, info.ysws_eligible == null ? null : info.ysws_eligible ? 1 : 0)
    }
    return new Response(tokenPage(handle, o.base, apiTok), {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
        'Set-Cookie': 'vt_state=; Path=/vibetime/app/auth; Max-Age=0' },
    })
  }

  oauthCfg() {
    const { VIBETIME_OAUTH_CLIENT_ID, VIBETIME_OAUTH_CLIENT_SECRET, VIBETIME_PUBLIC_URL,
      VIBETIME_OAUTH_BASE = 'https://auth.hackclub.com' } = this.env
    if (!VIBETIME_OAUTH_CLIENT_ID || !VIBETIME_PUBLIC_URL) return null
    return {
      clientId: VIBETIME_OAUTH_CLIENT_ID, clientSecret: VIBETIME_OAUTH_CLIENT_SECRET, base: VIBETIME_PUBLIC_URL,
      redirect: `${VIBETIME_PUBLIC_URL}/auth/callback`,
      authorize: `${VIBETIME_OAUTH_BASE}/oauth/authorize`, token: `${VIBETIME_OAUTH_BASE}/oauth/token`,
      userinfo: `${VIBETIME_OAUTH_BASE}/oauth/userinfo`,
    }
  }

  live(request, user) {
    if (request.headers.get('Upgrade') !== 'websocket') return fail(426, 'expected websocket')
    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]
    server.accept()
    if (!this.sockets.has(user.id)) this.sockets.set(user.id, new Set())
    this.sockets.get(user.id).add(server)
    server.send(JSON.stringify(this.insights(user, 'UTC')))
    const drop = () => this.sockets.get(user.id)?.delete(server)
    server.addEventListener('close', drop)
    server.addEventListener('error', drop)
    return new Response(null, { status: 101, webSocket: client })
  }

  profilePage(user) {
    return new Response(profileHTML(user.handle), { headers: { 'content-type': 'text/html; charset=utf-8' } })
  }
}

// ---- helpers (pure) live in vibetime-core.js
function tokenPage(handle, base, tok) {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>vibetime login</title><script src="/cdn/theme.js"></script><style>
:root{color-scheme:light;--bg:#fbfaf7;--fg:#1d1b18;--line:#8884}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#151412;--fg:#ece8e1;--line:#ffffff30}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#151412;--fg:#ece8e1;--line:#ffffff30}
body{font:16px/1.5 system-ui;max-width:600px;margin:40px auto;padding:0 16px;background:var(--bg);color:var(--fg)}
a{color:inherit}</style>
<h1>Signed in as ${esc(handle)}</h1><p>Run this on each computer you build on:</p>
<code style="display:block;padding:12px;border:1px solid var(--line);border-radius:8px;word-break:break-all">vibetime login -server ${esc(base)} -token ${esc(tok)}</code>
<p>Keep this token private. Signing in again issues a new token.</p><p><a href="${esc(base)}/u/${esc(handle)}">Your public profile</a></p>`
}
function profileHTML(handle) {
  const h = JSON.stringify(handle)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(handle)} on vibetime</title><script src="/cdn/theme.js"></script><style>
:root{color-scheme:light;--bg:#fbfaf7;--fg:#1d1b18;--muted:#6d665c;--line:#e6e1d8;--bar:#c2410c;--bar-dim:#f1dccf;--card:#fff;--m0:#c2410c;--m1:#2563eb;--m2:#a8a29e}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#151412;--fg:#ece8e1;--muted:#a39b8f;--line:#2d2a26;--bar:#fb923c;--bar-dim:#3a2a20;--card:#1d1c19;--m0:#fb923c;--m1:#60a5fa;--m2:#78716c}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#151412;--fg:#ece8e1;--muted:#a39b8f;--line:#2d2a26;--bar:#fb923c;--bar-dim:#3a2a20;--card:#1d1c19;--m0:#fb923c;--m1:#60a5fa;--m2:#78716c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:720px;margin:0 auto;padding:32px 16px}h1{margin:0 0 4px}h2{font-size:15px;color:var(--muted);margin:28px 0 8px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.tile b{display:block;font-size:24px;font-variant-numeric:tabular-nums}.tile span{color:var(--muted);font-size:13px}
.chart{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}svg{display:block;width:100%;height:auto}
table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px solid var(--line)}td:last-child{text-align:right;color:var(--muted);font-variant-numeric:tabular-nums}
.split{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--line)}.split i{display:block;height:100%}
.legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:8px;font-size:13px;color:var(--muted)}.legend s{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px;text-decoration:none}
.live{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--bar);margin-right:6px}
</style></head><body><main>
<h1 id="h"></h1><p style="color:var(--muted)"><span class="live"></span>Attended time building with AI. Updates live.</p>
<div class="tiles"><div class="tile"><b id="today">–</b><span>today</span></div><div class="tile"><b id="week">–</b><span id="weekd">last 7 days</span></div>
<div class="tile"><b id="streak">–</b><span id="streakd">day streak</span></div><div class="tile"><b id="best">–</b><span id="bestd">best day</span></div></div>
<h2>Where your attention went</h2><div class="chart"><div class="split" id="split"></div><div class="legend" id="splitl"></div></div>
<h2>Last 30 days</h2><div class="chart"><svg id="bars" viewBox="0 0 300 80" role="img" aria-label="Attended time per day"></svg></div>
<h2>Projects</h2><table id="projects"></table>
<div id="imp" hidden><h2>Imported history (unverified)</h2><table id="imported"></table></div>
</main><script>
const handle=${h},tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC",NS="http://www.w3.org/2000/svg";
const fmt=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+"h "+m+"m":m+"m"};
const set=(id,v)=>document.getElementById(id).textContent=v;
function bars(days){const svg=document.getElementById("bars");svg.replaceChildren();const max=Math.max(3600,...days.map(d=>d.seconds)),w=300/days.length;
 days.forEach((d,i)=>{const h=Math.max(d.seconds?2:0,d.seconds/max*76),r=document.createElementNS(NS,"rect");
 r.setAttribute("x",w*i+1);r.setAttribute("width",w-2);r.setAttribute("y",80-h);r.setAttribute("height",h);r.setAttribute("rx",1.5);
 r.setAttribute("fill",d.seconds>=900?"var(--bar)":"var(--bar-dim)");const t=document.createElementNS(NS,"title");t.textContent=d.date+": "+fmt(d.seconds);r.append(t);svg.append(r)})}
function render(s){document.title=handle+" on vibetime";set("h",handle);const today=s.days[s.days.length-1];
 set("today",fmt(today.seconds));set("week",fmt(s.week_seconds));const diff=s.week_seconds-s.prev_week_seconds;
 set("weekd",s.prev_week_seconds?(diff>=0?"▲ ":"▼ ")+fmt(Math.abs(diff))+" vs week before":"last 7 days");
 set("streak",s.current_streak);set("streakd","day streak · best "+s.longest_streak);
 set("best",fmt(s.best_day.seconds));set("bestd",s.best_day.seconds?"best day · "+s.best_day.date.slice(5):"best day");
 const modes=[["hands-on",s.hands_on_seconds,"--m0"],["steering the AI",s.steering_seconds,"--m1"],["watching the agent",s.watching_seconds,"--m2"]];
 const mt=modes.reduce((a,m)=>a+m[1],0),sp=document.getElementById("split"),sl=document.getElementById("splitl");sp.replaceChildren();sl.replaceChildren();
 modes.forEach(([name,sec,v])=>{const pct=mt?Math.round(sec/mt*100):0,seg=document.createElement("i");seg.style.width=pct+"%";seg.style.background="var("+v+")";seg.title=name+": "+fmt(sec);sp.append(seg);
 const l=document.createElement("span"),sw=document.createElement("s"),b=document.createElement("b");sw.style.background="var("+v+")";b.textContent=pct+"%";l.append(sw,b," "+name);sl.append(l)});
 bars(s.days);const t=document.getElementById("projects");t.replaceChildren();
 Object.entries(s.projects).sort((a,b)=>b[1]-a[1]).forEach(([p,sec])=>{const r=t.insertRow();r.insertCell().textContent=p;r.insertCell().textContent=fmt(sec)});
 const imp=Object.entries(s.imported||{});document.getElementById("imp").hidden=!imp.length;const it=document.getElementById("imported");it.replaceChildren();
 imp.sort((a,b)=>b[1]-a[1]).forEach(([p,sec])=>{const r=it.insertRow();r.insertCell().textContent=p;r.insertCell().textContent=fmt(sec)})}
async function poll(){try{const r=await fetch("/vibetime/app/api/v1/users/"+encodeURIComponent(handle)+"/insights?tz="+encodeURIComponent(tz));if(r.ok)render(await r.json())}catch{}}
poll();
try{const ws=new WebSocket((location.protocol==="https:"?"wss":"ws")+"://"+location.host+"/vibetime/app/api/v1/users/"+encodeURIComponent(handle)+"/live");ws.onmessage=e=>render(JSON.parse(e.data));ws.onclose=()=>setInterval(poll,15000)}catch{setInterval(poll,15000)}
</script></body></html>`
}
