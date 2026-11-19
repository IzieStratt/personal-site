// End-to-end + security probes for lostfm against a running worker.
//   wrangler dev --port 8787 --host vs.izie.top --local-upstream vs.izie.top --var LOSTFM_TOKEN:devtoken
//   LOSTFM_BASE=http://localhost:8787 node --test scripts/test_lostfm_e2e.mjs
// Never point this at production: it fills the token budget on purpose.
import test from 'node:test'
import assert from 'node:assert/strict'

const BASE = process.env.LOSTFM_BASE || 'http://localhost:8787'
assert.ok(!/izie\.top/.test(BASE), 'refusing to run against production')
const ORIGIN = BASE
const u = (p) => `${BASE}/lostfm${p}`
const post = (p, body, headers = {}) => fetch(u(p), { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'content-type': 'application/json', ...headers } })
const newToken = async () => {
  const r = await fetch(u('/api/token'), { method: 'POST', headers: { origin: ORIGIN } })
  assert.equal(r.status, 200)
  return (await r.json()).token
}
const listen = (ts, track = 'Song', artist = 'Artist') => ({ listened_at: ts, track_metadata: { artist_name: artist, track_name: track } })
const T = (t) => ({ authorization: `Token ${t}` })

test('stats: only the bot token can write, anyone can read', async () => {
  assert.equal((await post('/api/stats', { total: 1 })).status, 401)
  assert.equal((await post('/api/stats', { total: 1 }, { authorization: 'Bearer wrong' })).status, 401)
  assert.equal((await post('/api/stats', 'x'.repeat(2_000_001), { authorization: 'Bearer devtoken' })).status, 413)
  assert.equal((await post('/api/stats', '{"total":"1"}', { authorization: 'Bearer devtoken' })).status, 400)
  assert.equal((await post('/api/stats', { total: 7 }, { authorization: 'Bearer devtoken' })).status, 200)
  assert.equal((await (await fetch(u('/api/stats'))).json()).total, 7)
  assert.equal((await fetch(u('/api/stats'), { method: 'PUT' })).status, 405)
})

test('token: only our own page can make one', async () => {
  assert.equal((await fetch(u('/api/token'), { method: 'POST' })).status, 403)
  assert.equal((await fetch(u('/api/token'), { method: 'POST', headers: { origin: 'https://evil.test' } })).status, 403)
  assert.equal((await fetch(u('/api/token'))).status, 405)
  const t = await newToken()
  assert.match(t, /^lfm_[A-Za-z0-9_-]{32}$/)
})

test('validate-token behaves like ListenBrainz', async () => {
  const t = await newToken()
  assert.deepEqual(await (await fetch(u('/1/validate-token'), { headers: T(t) })).json(), { code: 200, message: 'Token valid.', valid: true, user_name: 'lostfm' })
  assert.equal((await (await fetch(u('/1/validate-token'), { headers: T('lfm_notarealtoken123') })).json()).valid, false)
  assert.equal((await (await fetch(u('/1/validate-token'))).json()).valid, false)
})

test('submit + inbox round trip, now playing, cursor', async () => {
  const t = await newToken()
  assert.equal((await post('/1/submit-listens', { listen_type: 'playing_now', payload: [{ track_metadata: { artist_name: 'A', track_name: 'Live' } }] }, T(t))).status, 200)
  let box = await (await fetch(u('/api/inbox?after=0'), { headers: T(t) })).json()
  assert.equal(box.now_playing.track, 'Live')
  assert.equal((await post('/1/submit-listens', { listen_type: 'single', payload: [listen(1700000000)] }, T(t))).status, 200)
  assert.equal((await post('/1/submit-listens', { listen_type: 'single', payload: [listen(1700000000)] }, T(t))).status, 200) // duplicate
  assert.equal((await post('/1/submit-listens', { listen_type: 'import', payload: [listen(1700000100, 'B'), listen(1700000200, 'C')] }, { authorization: `Bearer ${t}` })).status, 200)
  box = await (await fetch(u('/api/inbox?after=0'), { headers: T(t) })).json()
  assert.deepEqual(box.listens.map((l) => l.track), ['Song', 'B', 'C'])
  assert.equal(box.now_playing, null, 'a finished play clears now playing')
  const later = await (await fetch(u(`/api/inbox?after=${box.listens[0].id}`), { headers: T(t) })).json()
  assert.deepEqual(later.listens.map((l) => l.track), ['B', 'C'])
  const weird = await (await fetch(u('/api/inbox?after=-5'), { headers: T(t) })).json()
  assert.equal(weird.listens.length, 3)
  const weird2 = await fetch(u('/api/inbox?after=1%20OR%201=1'), { headers: T(t) })
  assert.equal(weird2.status, 200)
})

test('tokens are isolated from each other', async () => {
  const a = await newToken(), b = await newToken()
  await post('/1/submit-listens', { listen_type: 'single', payload: [listen(1700001000, 'secret song')] }, T(a))
  const boxB = await (await fetch(u('/api/inbox?after=0'), { headers: T(b) })).json()
  assert.equal(boxB.listens.length, 0)
})

test('submit rejects bad auth, bad bodies, huge bodies', async () => {
  const t = await newToken()
  const good = { listen_type: 'single', payload: [listen(1700000000)] }
  assert.equal((await post('/1/submit-listens', good)).status, 401)
  assert.equal((await post('/1/submit-listens', good, T('lfm_doesnotexist0000000000'))).status, 401)
  assert.equal((await post('/1/submit-listens', good, { authorization: t })).status, 401)
  assert.equal((await post('/1/submit-listens', '{not json', T(t))).status, 400)
  assert.equal((await post('/1/submit-listens', { listen_type: 'single', payload: [{ track_metadata: {} }] }, T(t))).status, 400)
  assert.equal((await post('/1/submit-listens', 'x'.repeat(1_000_001), T(t))).status, 413)
  assert.equal((await fetch(u('/1/submit-listens'), { headers: T(t) })).status, 405)
  const r = await post('/1/submit-listens', '{bad', T(t))
  assert.deepEqual(Object.keys(await r.json()).sort(), ['code', 'error'])
})

test('inbox and delete need the token; deleting removes the listens', async () => {
  const t = await newToken()
  await post('/1/submit-listens', { listen_type: 'single', payload: [listen(1700000000)] }, T(t))
  assert.equal((await fetch(u('/api/inbox'))).status, 401)
  assert.equal((await fetch(u('/api/inbox'), { headers: T('lfm_nopenopenopenope') })).status, 401)
  assert.equal((await post('/api/token/delete', '', T(t))).status, 200)
  assert.equal((await fetch(u('/api/inbox'), { headers: T(t) })).status, 401)
  assert.equal((await post('/1/submit-listens', { listen_type: 'single', payload: [listen(1700000000)] }, T(t))).status, 401)
})

test('artist-image validates input and never errors on odd names', async () => {
  assert.equal((await fetch(u('/api/artist-image'))).status, 400)
  for (const n of ["' OR 1=1 --", '<script>alert(1)</script>', '\u0000\u0001', 'x'.repeat(5000)]) {
    const r = await fetch(u(`/api/artist-image?name=${encodeURIComponent(n)}`))
    assert.ok([200, 400].includes(r.status), `${n.slice(0, 20)} -> ${r.status}`)
    if (r.status === 200) assert.equal(typeof (await r.json()).image, 'string')
  }
})

test('pages send a strict CSP and server files are not exposed', async () => {
  for (const p of ['/', '/connect/']) {
    const r = await fetch(u(p))
    assert.equal(r.status, 200, p)
    const csp = r.headers.get('content-security-policy') || ''
    assert.match(csp, /script-src 'self'/)
    assert.match(csp, /frame-ancestors 'none'/)
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff')
  }
  for (const p of ['/worker.js', '/lostfm/../worker.js', '/lostfm/%2e%2e/%2e%2e/worker.js', '/lostfm.js', '/wrangler.jsonc', '/.dev.vars', '/lostfm/..%2f..%2fwrangler.jsonc']) {
    const r = await fetch(`${BASE}${p}`)
    const text = await r.text()
    assert.ok(!/LostfmStore|LOSTFM_TOKEN|kv_namespaces/.test(text), `${p} leaked server code (${r.status})`)
  }
})

test('CORS: the scrobble API allows extensions, nothing else is opened up', async () => {
  const pre = await fetch(u('/1/submit-listens'), { method: 'OPTIONS' })
  assert.equal(pre.status, 204)
  assert.match(pre.headers.get('access-control-allow-headers'), /authorization/)
  assert.equal(pre.headers.get('access-control-allow-credentials'), null)
  const inbox = await fetch(u('/api/inbox'), { headers: { origin: 'https://evil.test' } })
  assert.equal(inbox.headers.get('access-control-allow-origin'), null)
})

test('token creation is rate limited', async () => {
  let limited = false
  for (let i = 0; i < 40 && !limited; i++) {
    const r = await fetch(u('/api/token'), { method: 'POST', headers: { origin: ORIGIN } })
    limited = r.status === 429
  }
  assert.ok(limited)
})
