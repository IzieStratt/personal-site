// lostfm (vs.izie.top/lostfm): listening stats + a ListenBrainz-compatible scrobble inbox.
//
//   GET  /lostfm/api/stats            izie's public stats snapshot
//   POST /lostfm/api/stats            music-stalker pushes it (Bearer LOSTFM_TOKEN)
//   POST /lostfm/api/token            make a scrobble token (shown once; we only keep its hash)
//   GET  /lostfm/api/inbox?after=N    pull listens sent with your token (Authorization: Token …)
//   GET  /lostfm/api/artist-image?name=X   artist photo via Spotify search, cached (so Apple Music and import-only users get pictures)
//   GET  /lostfm/api/info?type=artist|track&artist=X[&name=Y]   Last.fm page info + Spotify / Apple Music listen links, cached
//   GET  /lostfm/1/validate-token     ListenBrainz-compatible, so scrobbler apps that accept a custom
//   POST /lostfm/1/submit-listens     ListenBrainz URL (Web Scrobbler, Pano Scrobbler, …) can send plays here
//
// Everything lives in one SQLite-backed Durable Object: the free plan caps KV at 1,000 writes a day,
// which a 2-minute stats push alone would nearly use up.
import { DurableObject } from 'cloudflare:workers'
import { parseSubmission } from './lostfm-core.js'

const MAX_STATS_BYTES = 2_000_000
const MAX_SUBMIT_BYTES = 1_000_000
const MAX_LISTENS_PER_TOKEN = 200_000
const TOKENS_PER_HOUR = 30 // across everyone, to stop someone filling storage with tokens
const NOW_PLAYING_TTL = 15 * 60
const ARTIST_LOOKUPS_PER_HOUR = 600 // across everyone; cached answers don't count
const ARTIST_RETRY = 7 * 86400
const ARTIST_FAIL_RETRY = 3600 // a failed lookup is retried after an hour, not on every visit
const SPOTIFY_IMAGE = /^https:\/\/i\.scdn\.co\/image\/[a-f0-9]+$/

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra },
  })
// ListenBrainz clients expect {code, error} bodies on failure
const lbError = (status, error) => json({ code: status, error }, status)

export async function handleLostfm(request, env, url) {
  const path = url.pathname.replace(/^\/lostfm/, '')
  const stub = env.LOSTFM_STORE.get(env.LOSTFM_STORE.idFromName('main'))

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (path === '/api/stats') {
    if (request.method === 'GET') {
      const body = await stub.getStats()
      return new Response(body || '{}', {
        status: body ? 200 : 404,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
      })
    }
    if (request.method === 'POST') {
      if (!env.LOSTFM_TOKEN || !(await sameText(request.headers.get('authorization') || '', `Bearer ${env.LOSTFM_TOKEN}`))) {
        return new Response('unauthorized', { status: 401 })
      }
      const text = await readCapped(request, MAX_STATS_BYTES)
      if (text === null) return new Response('too large', { status: 413 })
      try {
        const data = JSON.parse(text)
        if (typeof data !== 'object' || data === null || typeof data.total !== 'number') throw new Error('shape')
      } catch {
        return new Response('bad json', { status: 400 })
      }
      await stub.putStats(text)
      return new Response('ok')
    }
    return methodNotAllowed('GET, POST')
  }

  if (path === '/api/token') {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    // only from our own page: a cross-site form can't read the token, but it shouldn't burn the hourly budget either
    if (request.headers.get('origin') !== url.origin) return json({ error: 'forbidden' }, 403)
    const token = `lfm_${b64url(crypto.getRandomValues(new Uint8Array(24)))}`
    const ok = await stub.createToken(await sha256(token))
    if (!ok) return json({ error: 'too many new tokens right now, try again in an hour' }, 429)
    return json({ token })
  }

  if (path === '/api/artist-image') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    const name = (url.searchParams.get('name') || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 200)
    if (!name) return json({ error: 'name is required' }, 400)
    const image = await stub.artistImage(name, Math.floor(Date.now() / 1000))
    return json({ image: image || '' }, 200, { 'cache-control': image ? 'public, max-age=86400' : 'public, max-age=3600' })
  }

  if (path === '/api/info') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    const clean = (k) => (url.searchParams.get(k) || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 200)
    const type = url.searchParams.get('type') === 'track' ? 'track' : 'artist'
    const artist = clean('artist'), name = clean('name')
    if (!artist || (type === 'track' && !name)) return json({ error: 'artist (and name for tracks) are required' }, 400)
    const info = await stub.info(type, artist, name, Math.floor(Date.now() / 1000))
    return json(info, 200, { 'cache-control': 'public, max-age=3600' })
  }

  const token = readToken(request, url)

  if (path === '/1/validate-token') {
    if (!token) return json({ code: 200, message: 'Token invalid.', valid: false })
    const valid = await stub.tokenExists(await sha256(token))
    return json(valid ? { code: 200, message: 'Token valid.', valid: true, user_name: 'lostfm' } : { code: 200, message: 'Token invalid.', valid: false })
  }

  if (path === '/1/submit-listens') {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    if (!token) return lbError(401, 'You need to provide an Authorization header.')
    const text = await readCapped(request, MAX_SUBMIT_BYTES)
    if (text === null) return lbError(413, 'Payload too large.')
    let parsed
    try {
      parsed = parseSubmission(JSON.parse(text))
    } catch (e) {
      return lbError(400, e.message || 'Invalid JSON.')
    }
    const res = await stub.submit(await sha256(token), parsed, Math.floor(Date.now() / 1000))
    if (res === 'bad-token') return lbError(401, 'Invalid authorization token.')
    if (res === 'full') return lbError(429, 'This token has stored too many listens.')
    return json({ status: 'ok' }, 200, corsHeaders())
  }

  if (path === '/api/inbox') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    if (!token) return json({ error: 'missing token' }, 401)
    const after = Math.max(0, Number.parseInt(url.searchParams.get('after') || '0', 10) || 0)
    const res = await stub.inbox(await sha256(token), after, Math.floor(Date.now() / 1000))
    if (!res) return json({ error: 'invalid token' }, 401)
    return json(res)
  }

  if (path === '/api/token/delete') {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    if (!token) return json({ error: 'missing token' }, 401)
    await stub.deleteToken(await sha256(token))
    return json({ status: 'ok' })
  }

  return json({ error: 'not found' }, 404)
}

export class LostfmStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS tokens (hash TEXT PRIMARY KEY, created INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 0,
        now_playing TEXT, now_playing_at INTEGER);
      CREATE TABLE IF NOT EXISTS listens (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT NOT NULL, listened_at INTEGER NOT NULL,
        artist TEXT NOT NULL, track TEXT NOT NULL, album TEXT, url TEXT, player TEXT, UNIQUE(token, listened_at, track));
      CREATE INDEX IF NOT EXISTS listens_token_id ON listens(token, id);
      CREATE TABLE IF NOT EXISTS artists (name TEXT PRIMARY KEY, image TEXT, fetched_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS info (key TEXT PRIMARY KEY, data TEXT NOT NULL, fetched_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS lookups (at INTEGER NOT NULL);
    `)
  }

  async artistImage(name, now) {
    const key = name.toLowerCase()
    const cached = this.sql.exec('SELECT image, fetched_at FROM artists WHERE name = ?', key).toArray()[0]
    if (cached && (cached.image || now - cached.fetched_at < ARTIST_RETRY)) return cached.image
    if (!this.env.SPOTIFY_CLIENT_ID || !this.env.SPOTIFY_CLIENT_SECRET) return ''
    this.sql.exec('DELETE FROM lookups WHERE at < ?', now - 3600)
    if (this.sql.exec('SELECT COUNT(*) c FROM lookups').one().c >= ARTIST_LOOKUPS_PER_HOUR) return ''
    this.sql.exec('INSERT INTO lookups (at) VALUES (?)', now)
    const lead = name.split(', ')[0]
    let image = ''
    try {
      const token = await this.appToken(now)
      const r = await fetch(`https://api.spotify.com/v1/search?${new URLSearchParams({ q: lead, type: 'artist', limit: '5' })}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (!r.ok) { this.rememberFailure(key, now); return '' }
      const items = (await r.json())?.artists?.items || []
      const match = items.find((a) => (a?.name || '').toLowerCase() === lead.toLowerCase())
      const imgs = (match?.images || []).filter((i) => SPOTIFY_IMAGE.test(i?.url || ''))
      const big = imgs.filter((i) => (i.width || 0) >= 300)
      image = (big.length ? big.at(-1) : imgs[0])?.url || ''
    } catch {
      this.rememberFailure(key, now)
      return ''
    }
    this.sql.exec('INSERT INTO artists (name, image, fetched_at) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET image = excluded.image, fetched_at = excluded.fetched_at', key, image, now)
    return image
  }

  // artist/track page data: Last.fm's public page (bio, tags, picture) plus where to listen (Spotify, Apple Music)
  async info(type, artist, name, now) {
    const key = `${type}\u0000${artist.toLowerCase()}\u0000${name.toLowerCase()}`
    const cached = this.sql.exec('SELECT data, fetched_at FROM info WHERE key = ?', key).toArray()[0]
    if (cached) {
      const d = JSON.parse(cached.data)
      if (now - cached.fetched_at < (d.partial ? ARTIST_FAIL_RETRY : ARTIST_RETRY)) return d
    }
    this.sql.exec('DELETE FROM lookups WHERE at < ?', now - 3600)
    if (this.sql.exec('SELECT COUNT(*) c FROM lookups').one().c >= ARTIST_LOOKUPS_PER_HOUR) return cached ? JSON.parse(cached.data) : { type, artist, name, partial: true }
    this.sql.exec('INSERT INTO lookups (at) VALUES (?)', now)
    const lead = artist.split(', ')[0]
    const [lf, sp, am] = await Promise.all([
      lastfmPage(type, lead, name).catch(() => null),
      this.spotifyLink(type, lead, name, now).catch(() => null),
      appleLink(type, lead, name).catch(() => null),
    ])
    const data = {
      type, artist, name,
      lastfm: lf?.url || '', summary: lf?.summary || '', tags: lf?.tags || [], image: lf?.image || sp?.image || am?.image || '',
      spotify: sp?.url || '', apple: am?.url || '',
      partial: !lf && !sp && !am,
    }
    this.sql.exec('INSERT INTO info (key, data, fetched_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at', key, JSON.stringify(data), now)
    return data
  }

  async spotifyLink(type, lead, name, now) {
    if (!this.env.SPOTIFY_CLIENT_ID || !this.env.SPOTIFY_CLIENT_SECRET) return null
    const token = await this.appToken(now)
    const q = type === 'track' ? `track:${name} artist:${lead}` : lead
    const r = await fetch(`https://api.spotify.com/v1/search?${new URLSearchParams({ q, type, limit: '5' })}`, { headers: { authorization: `Bearer ${token}` } })
    if (!r.ok) return null
    const items = (await r.json())?.[`${type}s`]?.items || []
    const want = (type === 'track' ? name : lead).toLowerCase()
    const m = items.find((i) => (i?.name || '').toLowerCase() === want) || items[0]
    const url = m?.external_urls?.spotify
    if (!url || !/^https:\/\/open\.spotify\.com\//.test(url)) return null
    const imgs = ((type === 'track' ? m.album?.images : m.images) || []).filter((i) => SPOTIFY_IMAGE.test(i?.url || ''))
    return { url, image: (imgs.find((i) => (i.width || 0) <= 640 && (i.width || 0) >= 300) || imgs[0])?.url || '' }
  }

  rememberFailure(key, now) {
    // stored as an old "no image" answer, so the normal retry window comes round in ARTIST_FAIL_RETRY
    this.sql.exec('INSERT INTO artists (name, image, fetched_at) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET fetched_at = excluded.fetched_at WHERE artists.image = \'\'', key, '', now - ARTIST_RETRY + ARTIST_FAIL_RETRY)
  }

  async appToken(now) {
    const row = this.sql.exec('SELECT v FROM kv WHERE k = ?', 'spotify_app_token').toArray()[0]
    if (row) {
      const t = JSON.parse(row.v)
      if (t.expires > now + 60) return t.token
    }
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { authorization: `Basic ${btoa(`${this.env.SPOTIFY_CLIENT_ID}:${this.env.SPOTIFY_CLIENT_SECRET}`)}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    if (!r.ok) throw new Error(`spotify token ${r.status}`)
    const body = await r.json()
    this.sql.exec('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', 'spotify_app_token', JSON.stringify({ token: body.access_token, expires: now + (body.expires_in || 3600) }))
    return body.access_token
  }

  getStats() {
    return this.sql.exec('SELECT v FROM kv WHERE k = ?', 'stats').toArray()[0]?.v ?? null
  }

  putStats(text) {
    this.sql.exec('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', 'stats', text)
  }

  createToken(hash) {
    const now = Math.floor(Date.now() / 1000)
    const recent = this.sql.exec('SELECT COUNT(*) c FROM tokens WHERE created > ?', now - 3600).one().c
    if (recent >= TOKENS_PER_HOUR) return false
    this.sql.exec('INSERT INTO tokens (hash, created) VALUES (?, ?)', hash, now)
    return true
  }

  tokenExists(hash) {
    return this.sql.exec('SELECT 1 FROM tokens WHERE hash = ?', hash).toArray().length > 0
  }

  deleteToken(hash) {
    this.sql.exec('DELETE FROM listens WHERE token = ?', hash)
    this.sql.exec('DELETE FROM tokens WHERE hash = ?', hash)
  }

  submit(hash, { type, listens }, now) {
    const row = this.sql.exec('SELECT count FROM tokens WHERE hash = ?', hash).toArray()[0]
    if (!row) return 'bad-token'
    if (type === 'playing_now') {
      this.sql.exec('UPDATE tokens SET now_playing = ?, now_playing_at = ? WHERE hash = ?', JSON.stringify(listens[0]), now, hash)
      return 'ok'
    }
    if (row.count + listens.length > MAX_LISTENS_PER_TOKEN) return 'full'
    let added = 0
    for (const l of listens) {
      added += this.sql.exec(
        'INSERT OR IGNORE INTO listens (token, listened_at, artist, track, album, url, player) VALUES (?,?,?,?,?,?,?)',
        hash, l.listened_at, l.artist, l.track, l.album, l.url, l.player,
      ).rowsWritten
    }
    // a finished play ends whatever was "now playing"
    this.sql.exec('UPDATE tokens SET count = count + ?, now_playing = NULL WHERE hash = ?', added, hash)
    return 'ok'
  }

  inbox(hash, after, now) {
    const tok = this.sql.exec('SELECT now_playing, now_playing_at FROM tokens WHERE hash = ?', hash).toArray()[0]
    if (!tok) return null
    const listens = this.sql.exec(
      'SELECT id, listened_at, artist, track, album, url, player FROM listens WHERE token = ? AND id > ? ORDER BY id LIMIT 1000',
      hash, after,
    ).toArray()
    const np = tok.now_playing && now - tok.now_playing_at < NOW_PLAYING_TTL ? JSON.parse(tok.now_playing) : null
    return { listens, next: listens.length ? listens.at(-1).id : after, more: listens.length === 1000, now_playing: np }
  }
}

function readToken(request, url) {
  const auth = request.headers.get('authorization') || ''
  const m = auth.match(/^(?:Token|Bearer)\s+(\S{10,200})$/i)
  if (m) return m[1]
  return null
}

async function readCapped(request, max) {
  const len = Number(request.headers.get('content-length') || 0)
  if (len > max) return null
  const text = await request.text()
  return text.length > max ? null : text
}

function methodNotAllowed(allow) {
  return new Response('method not allowed', { status: 405, headers: { allow } })
}

function corsHeaders() {
  // scrobbler extensions post from their own origin; the token is the only credential, no cookies
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '86400',
  }
}

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

async function sha256(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// constant-time compare via hashing both sides
async function sameText(a, b) {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))))
  const x = new Uint8Array(ha), y = new Uint8Array(hb)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

const decodeEntities = (t) => t.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|#39);/gi, (m, e) => {
  if (e[0] === '#') { const c = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : '' }
  return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[e.toLowerCase()] || m
})
const lfSeg = (s) => encodeURIComponent(s).replace(/%20/g, '+')

// Last.fm's public artist/track page: its og: tags and tag links (no API key needed)
async function lastfmPage(type, artist, name) {
  const url = `https://www.last.fm/music/${lfSeg(artist)}${type === 'track' ? `/_/${lfSeg(name)}` : ''}`
  const r = await fetch(url, { headers: { 'user-agent': 'lostfm (+https://vs.izie.top/lostfm/)', accept: 'text/html' }, redirect: 'follow' })
  if (!r.ok) return null
  const html = (await r.text()).slice(0, 600_000)
  const meta = (prop) => decodeEntities(html.match(new RegExp(`<meta[^>]+property="og:${prop}"[^>]+content="([^"]*)"`, 'i'))?.[1] || '')
  let summary = meta('description').replace(/\s+/g, ' ').trim()
  if (/^(listen to|discover|stream)\b/i.test(summary) || /\blast\.fm\b.*\bfree\b/i.test(summary)) summary = ''
  const image = meta('image')
  const tags = [...html.matchAll(/<a href="\/tag\/[^"]+"[^>]*>([^<]{1,40})<\/a>/g)].map((m) => decodeEntities(m[1]).trim()).filter((t, i, a) => t && a.indexOf(t) === i).slice(0, 6)
  return {
    url,
    summary: summary.slice(0, 600),
    tags,
    image: /^https:\/\/lastfm\.freetls\.fastly\.net\//.test(image) && !image.includes('2a96cbd8b46e442fc41c2b86b821562f') ? image : '',
  }
}

async function appleLink(type, artist, name) {
  const term = type === 'track' ? `${artist} ${name}` : artist
  const entity = type === 'track' ? 'song' : 'musicArtist'
  const r = await fetch(`https://itunes.apple.com/search?${new URLSearchParams({ term, entity, limit: '5' })}`)
  if (!r.ok) return null
  const results = (await r.json())?.results || []
  const m = type === 'track'
    ? results.find((x) => (x.trackName || '').toLowerCase() === name.toLowerCase() && (x.artistName || '').toLowerCase().includes(artist.toLowerCase())) || results[0]
    : results.find((x) => (x.artistName || '').toLowerCase() === artist.toLowerCase()) || results[0]
  const url = type === 'track' ? m?.trackViewUrl : m?.artistLinkUrl
  if (!url || !/^https:\/\/music\.apple\.com\//.test(url)) return null
  const art = (m.artworkUrl100 || '').replace(/100x100/, '600x600')
  return { url, image: /^https:\/\/[^/]*mzstatic\.com\//.test(art) ? art : '' }
}
