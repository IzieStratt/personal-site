// status.izie.top: what's up, what isn't, and a year of history.
// - a cron trigger (every 5 min, see wrangler.jsonc) runs every check below and stores the result in D1 (binding COMMENTS, tables made on first use)
// - "web" checks fetch a public URL; "github" checks read the latest run of a GitHub Actions workflow;
//   "beat" checks are for things that can't be reached from outside (the Nest bots): they POST /api/heartbeat/<id> every few minutes
//   with `Authorization: Bearer $STATUS_HEARTBEAT_TOKEN` (secret) and count as up while the last beat is fresh
// - GET /api/status returns the current state plus per-day history for the graph

export const GROUPS = [
  {
    id: 'nest',
    name: 'Nest Instance',
    items: [
      { id: 'pet', name: "Izie's Pet", kind: 'beat', maxAgeMin: 15 },
      { id: 'mrox', name: 'Mrox', kind: 'beat', maxAgeMin: 15 },
    ],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    items: [
      { id: 'site', name: 'Main site', kind: 'web', url: 'https://izie.top/' },
      { id: 'auth', name: 'Auth', kind: 'probe', probe: 'auth' },
      { id: 'blog', name: 'Blog', kind: 'probe', probe: 'blog' },
      { id: 'redoc-docs', name: 'Redoc docs', kind: 'probe', probe: 'redoc' },
      { id: 'sdmp-feed', name: 'SDMP feed', kind: 'probe', probe: 'sdmp' },
      { id: 'vibetime', name: 'Vibetime server', kind: 'web', url: 'https://vs.izie.top/vibetime/app/healthz' },
      { id: 'lostfm', name: 'Lost.fm', kind: 'probe', probe: 'lostfm' },
      { id: 'shiritori', name: 'Shiritori', kind: 'web', url: 'https://vs.izie.top/shatori/' },
    ],
  },
  {
    id: 'email',
    name: 'Email',
    items: [
      { id: 'email-routing', name: 'Cloudflare Email Routing', kind: 'email' },
      { id: 'resend', name: 'Resend', kind: 'resend' },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    items: [
      // GitHub delays scheduled runs by hours, so the age limits are generous. maxAgeMin is how stale the newest finished run may be before it counts as stalled (schedule period plus slack)
      { id: 'sdmp-miner', name: 'SDMP miner', kind: 'github', repo: 'IzieStratt/slack-datamine-plus', workflow: 'mine.yml', maxAgeMin: 12 * 60 },
      { id: 'sdmp-platforms', name: 'SDMP native clients', kind: 'github', repo: 'IzieStratt/slack-datamine-plus', workflow: 'platforms.yml', maxAgeMin: 12 * 60 },
      // feed.yml is what pushes the Slack API catalog (ReDocumented) and the SDMP feed into this repo, once a day
      { id: 'redoc-sync', name: 'Redoc sync (daily push)', kind: 'github', repo: 'IzieStratt/slack-datamine-plus', workflow: 'feed.yml', maxAgeMin: 30 * 60 },
      { id: 'redoc-check', name: 'Redoc catalog check', kind: 'github', repo: 'IzieStratt/personal-site', workflow: 'redocumented-check.yml' },
      { id: 'blog-build', name: 'Blog build', kind: 'github', repo: 'IzieStratt/personal-site', workflow: 'blog-build.yml' },
    ],
  },
]

const ITEMS = GROUPS.flatMap((g) => g.items)
export const ITEM_IDS = new Set(ITEMS.map((i) => i.id))
const BEAT_IDS = new Set(ITEMS.filter((i) => i.kind === 'beat').map((i) => i.id))
// Our own hostnames (account., blog., vs., sdmp.izie.top) are routes on this Worker, and a Worker's subrequest to its own routes may bypass the Worker.
// So checks of those call the Worker's own fetch handler directly (this tests the app, not DNS or the edge). runChecks gets that handler from worker.js.
let SELF = null
const ownHost = (url) => /(^|\.)izie\.top$/.test(new URL(url).hostname)
const doFetch = (url, init = {}) => (SELF && ownHost(url) ? SELF(new Request(url, init)) : fetch(url, init))

// first `n` bytes of a (possibly huge) response as text, without downloading or parsing the rest
async function head(url, n = 4096) {
  const res = await doFetch(url, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'izie-status/1' } })
  if (!res.ok) throw new Fail(`${new URL(url).pathname} returned HTTP ${res.status}`)
  const reader = res.body.getReader()
  const chunks = []
  let got = 0
  while (got < n) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    got += value.length
  }
  await reader.cancel().catch(() => {})
  return new TextDecoder().decode(chunks.length === 1 ? chunks[0] : Uint8Array.from(chunks.flatMap((c) => [...c])))
}

const HISTORY_DAYS = 371 // 53 weeks, the width of the graph

let schemaReady = false
async function ensureSchema(db) {
  if (schemaReady) return
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS status_now (id TEXT PRIMARY KEY, state TEXT NOT NULL, ms INTEGER, detail TEXT, checked_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS status_daily (day TEXT NOT NULL, id TEXT NOT NULL, ok INTEGER NOT NULL, total INTEGER NOT NULL, PRIMARY KEY (day, id))'),
    db.prepare('CREATE TABLE IF NOT EXISTS status_beat (id TEXT PRIMARY KEY, at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS status_kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)'),
  ])
  schemaReady = true
}

const dayOf = (ms) => new Date(ms).toISOString().slice(0, 10)

async function checkWeb(item) {
  const start = Date.now()
  try {
    const res = await doFetch(item.url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { 'user-agent': 'izie-status/1', 'cache-control': 'no-cache' },
    })
    const ms = Date.now() - start
    // 2xx is up; a redirect is up only if it stays on our own domains (not to an error page elsewhere); 4xx on a page that should exist and 5xx are not
    const dest = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null
    const staysHome = dest && ownHost(new URL(dest, item.url).href)
    if ((res.status >= 200 && res.status < 300) || staysHome) return { state: ms > 4000 ? 'degraded' : 'up', ms, detail: `HTTP ${res.status}` }
    return { state: 'down', ms, detail: `HTTP ${res.status}` }
  } catch (e) {
    return { state: 'down', ms: Date.now() - start, detail: e?.name === 'TimeoutError' ? 'timed out' : 'unreachable' }
  }
}

// ---- functional probes: not "does the page load" but "does the thing it's for work"
class Fail extends Error {}
class Slow extends Error {} // works, but off (stale data, slow)

async function get(url, init = {}) {
  const res = await doFetch(url, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'izie-status/1', 'cache-control': 'no-cache' }, ...init })
  if (!res.ok) throw new Fail(`${new URL(url).pathname} returned HTTP ${res.status}`)
  return res
}
async function getJson(url, init) {
  const res = await get(url, init)
  try { return await res.json() } catch { throw new Fail(`${new URL(url).pathname} isn't valid JSON`) }
}
const daysOld = (iso) => (Date.now() - Date.parse(iso)) / 86400000

const PROBES = {
  // the sign-in page loads, and the API can mint a passkey challenge (that touches D1 and the crypto the whole login depends on)
  async auth() {
    const page = await (await get('https://account.izie.top/')).text()
    if (!page.includes('izie account')) throw new Fail('sign-in page is missing its content')
    const res = await doFetch('https://account.izie.top/api/login/options', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: { origin: 'https://account.izie.top', 'x-izie': '1', 'content-type': 'application/json', 'user-agent': 'izie-status/1' },
      body: '{}',
    })
    if (res.status === 429) throw new Slow('login api rate limited the check, so it was not verified')
    const body = await res.json().catch(() => null)
    if (!res.ok || !body?.challengeId || !body?.options?.challenge) throw new Fail(`login challenge failed (HTTP ${res.status})`)
    return 'page ok, login challenge issued'
  },
  // home page lists posts, the feed has entries, and comments load from D1
  async blog() {
    const home = await (await get('https://blog.izie.top/')).text()
    if (!/href="[^"]*\/post\//.test(home)) throw new Fail('home page lists no posts')
    const feed = await (await get('https://blog.izie.top/feed.xml')).text()
    if (!feed.includes('<entry>')) throw new Fail('feed has no entries')
    const comments = await getJson('https://blog.izie.top/api/comments?post=meow')
    if (!Array.isArray(comments.comments)) throw new Fail('comments api returned no list')
    return 'posts, feed and comments ok'
  },
  // the docs app loads and the catalog it serves is whole and current
  async redoc() {
    const page = await (await get('https://vs.izie.top/redocumented/')).text()
    if (!page.includes('<script')) throw new Fail('docs page is empty')
    // the index is ~800 KB; its first bytes hold the build date and counts
    const top = await head('https://vs.izie.top/redocumented/api/index.json')
    const generated = top.match(/"generated":\s*"([\d-]+)"/)?.[1]
    const total = Number(top.match(/"total":\s*(\d+)/)?.[1] || 0)
    if (!(total > 1000)) throw new Fail(`catalog looks truncated (${total} methods)`)
    if (generated && daysOld(generated) > 4) throw new Slow(`catalog is ${Math.floor(daysOld(generated))}d old`)
    return `${total} methods, built ${generated}`
  },
  // the page loads, the stats are served from the durable object and aren't stale, and the scrobble API answers token checks
  async lostfm() {
    const page = await (await get('https://vs.izie.top/lostfm/')).text()
    if (!page.includes('<script')) throw new Fail('page is empty')
    const top = await head('https://vs.izie.top/lostfm/api/stats', 512)
    const stats = { generated_at: Number(top.match(/"generated_at":\s*(\d+)/)?.[1] || 0), total: Number(top.match(/"total":\s*(\d+)/)?.[1] || 0) }
    if (!(stats.total > 0)) throw new Fail('stats are empty')
    const check = await getJson('https://vs.izie.top/lostfm/1/validate-token', { headers: { authorization: 'Token status-check' } })
    if (check.valid !== false) throw new Fail('scrobble api answered a fake token wrongly')
    const hours = (Date.now() / 1000 - stats.generated_at) / 3600
    if (hours > 48) throw new Slow(`stats are ${Math.floor(hours / 24)}d old`)
    return `${stats.total} scrobbles, scrobble api ok`
  },
  // the feed is valid and has today's-ish data (it's pushed once a day)
  async sdmp() {
    // items.json is ~11 MB, so only its first bytes are read: it must be a JSON array whose first (newest) entry has a date
    const top = await head('https://sdmp.izie.top/items.json')
    const newest = top.trimStart().startsWith('[') ? top.match(/"date":\s*"([\d-]+)"/)?.[1] : null
    if (!newest) throw new Fail('feed has no days')
    const rss = await head('https://sdmp.izie.top/feed.xml', 16384)
    if (!rss.includes('<item>')) throw new Fail('rss feed has no items')
    if (daysOld(newest) > 3) throw new Slow(`newest day is ${newest}`)
    return `newest day ${newest}, rss ok`
  },
}

async function checkProbe(item) {
  const start = Date.now()
  try {
    const detail = await PROBES[item.probe]()
    const ms = Date.now() - start
    return { state: ms > 8000 ? 'degraded' : 'up', ms, detail }
  } catch (e) {
    const ms = Date.now() - start
    if (e instanceof Slow) return { state: 'degraded', ms, detail: e.message }
    return { state: 'down', ms, detail: e instanceof Fail ? e.message : e?.name === 'TimeoutError' ? 'timed out' : 'unreachable' }
  }
}

// ---- email: Email Routing and Resend are checked together by a canary.
// Every few hours Resend sends a mail to a routed address whose Worker stores it (the private inbox in ../resend/worker); later ticks look for it there.
//   resend:        the API accepted the mail
//   email routing: MX records point at Cloudflare on both domains, and the canary actually arrived
// Needs secrets STATUS_RESEND_KEY (a send-only key is enough), INBOX_API_URL, INBOX_API_TOKEN. Without them, routing is checked by DNS alone.
const MAIL_DOMAINS = ['izie.top', 'stalks.you']
const CANARY_EVERY_MS = 3 * 3600000
const CANARY_LATE_MS = 20 * 60000

async function kvGet(db, k) {
  const row = await db.prepare('SELECT v FROM status_kv WHERE k = ?').bind(k).first()
  return row ? JSON.parse(row.v) : null
}
const kvSet = (db, k, v) => db.prepare('INSERT INTO status_kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').bind(k, JSON.stringify(v)).run()

async function mxOk(domain) {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('dns lookup failed')
  const answers = (await res.json()).Answer || []
  return answers.some((a) => /mx\.cloudflare\.net\.?$/i.test(a.data || ''))
}

async function runCanary(env) {
  if (!env.STATUS_RESEND_KEY || !env.INBOX_API_URL || !env.INBOX_API_TOKEN) return null
  const db = env.COMMENTS
  const now = Date.now()
  let c = await kvGet(db, 'canary')
  if (c && c.resendOk && !c.receivedAt) {
    try {
      const res = await fetch(`${env.INBOX_API_URL.replace(/\/$/, '')}/api/messages?limit=30`, { headers: { authorization: `Bearer ${env.INBOX_API_TOKEN}` }, signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        delete c.inboxError
        if ((await res.json()).data?.some((m) => m.subject?.includes(c.tag))) c.receivedAt = now
      } else c.inboxError = `inbox api HTTP ${res.status}`
    } catch { c.inboxError = 'inbox api unreachable' }
    await kvSet(db, 'canary', c)
  }
  // send again on schedule, or after 15 minutes if the last send failed (so one network blip doesn't mean hours of red)
  if (!c || now - c.sentAt > (c.resendOk ? CANARY_EVERY_MS : 15 * 60000)) {
    const tag = `status-canary-${now.toString(36)}`
    c = { tag, sentAt: now }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: { authorization: `Bearer ${env.STATUS_RESEND_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: 'status <status@izie.top>', to: ['inbox-test@stalks.you'], subject: tag, text: 'automated check from status.izie.top, safe to ignore' }),
      })
      c.resendOk = res.ok
      if (!res.ok) c.resendError = `Resend returned HTTP ${res.status}`
    } catch { c.resendOk = false; c.resendError = 'Resend unreachable' }
    await kvSet(db, 'canary', c)
  }
  return c
}

async function checkEmail(env, canary) {
  const start = Date.now()
  const bad = []
  for (const d of MAIL_DOMAINS) {
    try { if (!(await mxOk(d))) bad.push(d) } catch { return { state: 'unknown', ms: null, detail: 'dns lookup failed' } }
  }
  if (bad.length) return { state: 'down', ms: Date.now() - start, detail: `${bad.join(', ')} no longer points at Cloudflare` }
  if (!canary) return { state: 'up', ms: Date.now() - start, detail: 'MX records ok (set the canary secrets for an end-to-end test)' }
  if (canary.receivedAt) return { state: 'up', ms: Date.now() - start, detail: `test mail arrived in ${Math.max(1, Math.round((canary.receivedAt - canary.sentAt) / 1000))}s` }
  if (!canary.resendOk) return { state: 'unknown', ms: null, detail: 'last test mail was never sent' }
  if (canary.inboxError) return { state: 'unknown', ms: null, detail: canary.inboxError }
  if (Date.now() - canary.sentAt > CANARY_LATE_MS) return { state: 'down', ms: null, detail: 'test mail was sent but never arrived' }
  return { state: 'up', ms: null, detail: 'MX ok, test mail in flight' }
}

function checkResend(env, canary) {
  if (!canary) return { state: 'unknown', ms: null, detail: env.STATUS_RESEND_KEY ? 'waiting for the first test mail' : 'set STATUS_RESEND_KEY to test sending' }
  if (!canary.resendOk) return { state: 'down', ms: null, detail: canary.resendError || 'send failed' }
  return { state: 'up', ms: null, detail: `test mail accepted ${ago((Date.now() - canary.sentAt) / 60000)} ago` }
}

async function checkGithub(item, env) {
  const start = Date.now()
  try {
    const headers = { 'user-agent': 'izie-status/1', accept: 'application/vnd.github+json' }
    if (env.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`
    const res = await fetch(
      `https://api.github.com/repos/${item.repo}/actions/workflows/${item.workflow}/runs?per_page=5&status=completed`,
      { headers, signal: AbortSignal.timeout(10000) },
    )
    const ms = Date.now() - start
    // the GitHub API itself failing says nothing about the workflow; don't record a false outage
    if (!res.ok) return { state: 'unknown', ms, detail: `GitHub API ${res.status}` }
    const runs = (await res.json()).workflow_runs?.filter((r) => r.conclusion !== 'cancelled' && r.conclusion !== 'skipped') || []
    if (!runs.length) return { state: 'unknown', ms, detail: 'no runs yet' }
    const last = runs[0]
    const ageMin = (Date.now() - Date.parse(last.updated_at)) / 60000
    if (last.conclusion !== 'success') return { state: 'down', ms, detail: `last run ${last.conclusion}` }
    if (item.maxAgeMin && ageMin > item.maxAgeMin) return { state: 'degraded', ms, detail: `no run for ${Math.round(ageMin / 60)}h` }
    return { state: 'up', ms, detail: `last run ${ago(ageMin)} ago` }
  } catch {
    return { state: 'unknown', ms: Date.now() - start, detail: 'GitHub API unreachable' }
  }
}

function ago(min) {
  if (min < 90) return `${Math.max(1, Math.round(min))}m`
  if (min < 48 * 60) return `${Math.round(min / 60)}h`
  return `${Math.round(min / 1440)}d`
}

async function checkBeat(item, env) {
  if (await kvGet(env.COMMENTS, 'beats_off')) return { state: 'unknown', ms: null, detail: 'heartbeats paused on purpose' }
  if (await kvGet(env.COMMENTS, 'beats_off')) return { state: 'unknown', ms: null, detail: 'heartbeats paused' }
  const row = await env.COMMENTS.prepare('SELECT at FROM status_beat WHERE id = ?').bind(item.id).first()
  if (!row) return { state: 'unknown', ms: null, detail: 'no heartbeat received yet' }
  const ageMin = (Date.now() - row.at) / 60000
  if (ageMin > item.maxAgeMin) return { state: 'down', ms: null, detail: `last heartbeat ${ago(ageMin)} ago` }
  return { state: 'up', ms: null, detail: `heartbeat ${ago(ageMin)} ago` }
}

// the newest commit on main of this repo (what Workers Builds deploys), shown in the page footer. Kept in D1 so the page never waits on GitHub.
async function refreshCommit(env) {
  try {
    const headers = { 'user-agent': 'izie-status/1', accept: 'application/vnd.github+json' }
    if (env.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`
    const res = await fetch('https://api.github.com/repos/IzieStratt/personal-site/commits/main', { headers, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return
    const c = await res.json()
    await kvSet(env.COMMENTS, 'commit', { sha: c.sha, message: String(c.commit?.message || '').split('\n')[0].slice(0, 200), date: c.commit?.committer?.date, url: c.html_url })
  } catch {}
}

// run every check, store the results. Called from the scheduled handler.
export async function runChecks(env, selfFetch) {
  SELF = selfFetch || null
  const db = env.COMMENTS
  await ensureSchema(db)
  const now = Date.now()
  const day = dayOf(now)
  await refreshCommit(env)
  const canary = await runCanary(env).catch(() => null)
  const results = await Promise.all(
    ITEMS.map(async (item) => {
      const r = await (async () =>
        item.kind === 'web' ? await checkWeb(item)
        : item.kind === 'probe' ? await checkProbe(item)
        : item.kind === 'github' ? await checkGithub(item, env)
        : item.kind === 'email' ? await checkEmail(env, canary)
        : item.kind === 'resend' ? checkResend(env, canary)
        : await checkBeat(item, env))().catch(() => ({ state: 'unknown', ms: null, detail: 'check crashed' }))
      return { id: item.id, ...r }
    }),
  )
  const stmts = []
  for (const r of results) {
    stmts.push(
      db
        .prepare('INSERT INTO status_now (id, state, ms, detail, checked_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET state = excluded.state, ms = excluded.ms, detail = excluded.detail, checked_at = excluded.checked_at')
        .bind(r.id, r.state, r.ms, r.detail, now),
    )
    // unknown (no data, or the thing being asked is itself down) doesn't count either way
    if (r.state === 'unknown') continue
    const ok = r.state === 'down' ? 0 : 1
    stmts.push(
      db
        .prepare('INSERT INTO status_daily (day, id, ok, total) VALUES (?, ?, ?, 1) ON CONFLICT(day, id) DO UPDATE SET ok = ok + excluded.ok, total = total + 1')
        .bind(day, r.id, ok),
    )
  }
  stmts.push(db.prepare('DELETE FROM status_daily WHERE day < ?').bind(dayOf(now - 400 * 86400000)))
  await db.batch(stmts)
  return results
}

function safeEqual(a, b) {
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  return x.length === y.length && crypto.subtle.timingSafeEqual(x, y)
}

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', ...extra } })

export async function handleStatus(request, env, url) {
  const db = env.COMMENTS
  if (!db) return json({ error: 'database not configured' }, 503)
  await ensureSchema(db)

  // remote on/off for the heartbeat timer on Nest (it reads this before every beat). Off shows the bots as "paused", not down.
  //   curl -X POST -H "Authorization: Bearer $TOKEN" 'https://status.izie.top/api/beat-switch?on=0'   (on=1 to resume)
  if (url.pathname === '/api/beat-switch') {
    if (request.method === 'POST') {
      const given = (request.headers.get('authorization') || '').replace(/^Bearer /i, '')
      if (!env.STATUS_HEARTBEAT_TOKEN || !safeEqual(given, env.STATUS_HEARTBEAT_TOKEN)) return json({ error: 'unauthorized' }, 401)
      const on = url.searchParams.get('on')
      if (on !== '0' && on !== '1') return json({ error: 'use ?on=0 or ?on=1' }, 400)
      await kvSet(db, 'beats_off', on === '0')
      return json({ on: on === '1' })
    }
    return json({ on: !(await kvGet(db, 'beats_off')) }, 200, { 'cache-control': 'no-store' })
  }

  // pause/resume the Nest heartbeats on purpose (the status-beat-switch script on Nest calls this). Paused bots show as "paused", not down,
  // and don't count against uptime. Anyone can read it; changing it needs the heartbeat token.
  if (url.pathname === '/api/beat-switch') {
    if (request.method === 'POST') {
      const given = (request.headers.get('authorization') || '').replace(/^Bearer /i, '')
      if (!env.STATUS_HEARTBEAT_TOKEN || !safeEqual(given, env.STATUS_HEARTBEAT_TOKEN)) return json({ error: 'unauthorized' }, 401)
      const on = url.searchParams.get('on')
      if (on !== '0' && on !== '1') return json({ error: 'use ?on=0 or ?on=1' }, 400)
      await kvSet(db, 'beats_off', on === '0')
      return json({ on: on === '1' })
    }
    return json({ on: !(await kvGet(db, 'beats_off')) }, 200, { 'cache-control': 'no-store' })
  }

  const beat = url.pathname.match(/^\/api\/heartbeat\/([a-z0-9-]+)$/)
  if (beat) {
    if (request.method !== 'POST' && request.method !== 'GET') return json({ error: 'use POST' }, 405)
    const token = env.STATUS_HEARTBEAT_TOKEN
    const given = (request.headers.get('authorization') || '').replace(/^Bearer /i, '')
    if (!token || !safeEqual(given, token)) return json({ error: 'unauthorized' }, 401)
    if (!BEAT_IDS.has(beat[1])) return json({ error: 'unknown heartbeat id' }, 404)
    await db.prepare('INSERT INTO status_beat (id, at) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET at = excluded.at').bind(beat[1], Date.now()).run()
    return json({ ok: true })
  }

  if (url.pathname === '/api/status' && request.method === 'GET') {
    const since = dayOf(Date.now() - (HISTORY_DAYS - 1) * 86400000)
    const [now, daily, commit] = await Promise.all([
      db.prepare('SELECT id, state, ms, detail, checked_at FROM status_now').all(),
      db.prepare('SELECT day, id, ok, total FROM status_daily WHERE day >= ?').bind(since).all(),
      kvGet(db, 'commit'),
    ])
    const byId = Object.fromEntries(now.results.map((r) => [r.id, r]))
    const history = {}
    for (const r of daily.results) (history[r.id] ||= {})[r.day] = [r.ok, r.total]
    const groups = GROUPS.map((g) => ({
      id: g.id,
      name: g.name,
      items: g.items.map((i) => ({
        id: i.id,
        name: i.name,
        state: byId[i.id]?.state || 'unknown',
        ms: byId[i.id]?.ms ?? null,
        detail: byId[i.id]?.detail || 'not checked yet',
        checkedAt: byId[i.id]?.checked_at || null,
      })),
    }))
    return json({ groups, history, commit, days: HISTORY_DAYS, generatedAt: Date.now() }, 200, { 'cache-control': 'public, max-age=30' })
  }

  return json({ error: 'not found' }, 404)
}
