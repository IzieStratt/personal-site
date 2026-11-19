// node --test scripts/test_lostfm.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, parseImport, dedupe, computeStats, spotifyItemsToListens } from '../website/public/__subdomains/vs/lostfm/lib.js'
import { handleLostfm } from '../lostfm.js'

test('csv parser handles quotes, commas and CRLF', () => {
  assert.deepEqual(parseCsv('a,"b, c","d ""e"""\r\n1,2,3\n'), [['a', 'b, c', 'd "e"'], ['1', '2', '3']])
})

test('imports lastfm-to-csv (no header)', () => {
  const r = parseImport('Daft Punk,Discovery,One More Time,18 Nov 2026 20:00\n')
  assert.equal(r.length, 1)
  assert.equal(r[0].ts, Date.UTC(2026, 10, 18, 20) / 1000)
  assert.equal(r[0].artist, 'Daft Punk')
  assert.equal(r[0].album, 'Discovery')
})

test('imports header CSV (ghan style)', () => {
  const r = parseImport('uts,utc_time,artist,artist_mbid,album,album_mbid,track,track_mbid\n1700000000,x,A,,Al,,T,\n')
  assert.deepEqual([r[0].ts, r[0].name, r[0].artist, r[0].album], [1700000000, 'T', 'A', 'Al'])
})

test('imports Last.fm API JSON pages and skips now playing', () => {
  const pages = [{ recenttracks: { track: [
    { name: 'NP', artist: { '#text': 'A' }, '@attr': { nowplaying: 'true' } },
    { name: 'S', artist: { '#text': 'A' }, album: { '#text': 'Al' }, date: { uts: '1700000000' } },
  ] } }]
  const r = parseImport(JSON.stringify(pages))
  assert.equal(r.length, 1)
  assert.equal(r[0].name, 'S')
})

test('imports Spotify extended history, skipping short plays', () => {
  const r = parseImport(JSON.stringify([
    { ts: '2024-01-01T00:03:00Z', ms_played: 180000, master_metadata_track_name: 'Long', master_metadata_album_artist_name: 'A', spotify_track_uri: 'spotify:track:abc' },
    { ts: '2024-01-01T00:04:00Z', ms_played: 5000, master_metadata_track_name: 'Skip', master_metadata_album_artist_name: 'A' },
    { ts: '2024-01-01T00:05:00Z', ms_played: 99000, master_metadata_track_name: null },
  ]))
  assert.equal(r.length, 1)
  assert.equal(r[0].ts, Date.UTC(2024, 0, 1) / 1000)
  assert.equal(r[0].url, 'https://open.spotify.com/track/abc')
})

test('round-trips lostfm export and rejects junk', () => {
  const l = [{ id: 'x', ts: 1, name: 'n', artist: 'a', album: '', url: '', source: 'spotify' }]
  assert.deepEqual(parseImport(JSON.stringify({ lostfm: 1, listens: l })), l)
  assert.throws(() => parseImport('hello\n'))
})

test('spotify items use start time; dedupe drops imported copies', () => {
  const [s] = spotifyItemsToListens([{ played_at: '2026-11-18T20:03:20Z', track: { name: 'B', duration_ms: 200000, artists: [{ name: 'Y' }] } }])
  assert.equal(s.ts, Date.UTC(2026, 10, 18, 20, 0, 0) / 1000)
  const kept = dedupe([s, { ...s, id: 'lf', source: 'lastfm', ts: s.ts + 40 }, { ...s, id: 'lf2', source: 'lastfm', ts: s.ts - 9999 }])
  assert.deepEqual(kept.map((l) => l.id), [s.id, 'lf2'])
})

test('computeStats matches the python shape', () => {
  const now = 1795000000
  const L = (ts, name, artist, album = '') => ({ id: `${ts}${name}`, ts, name, artist, album, url: '', source: 'lastfm' })
  const st = computeStats([L(now - 3600, 'A', 'X', 'Al'), L(now - 7200, 'A', 'X', 'Al'), L(now - 40 * 86400, 'B', 'Y')], now)
  assert.equal(st.total, 3)
  assert.equal(st.periods['7d'].plays, 2)
  assert.deepEqual(st.periods['7d'].artists, [['X', 2]])
  assert.deepEqual(st.periods.all.tracks[0], ['A', 'X', 2])
  assert.deepEqual(st.periods.all.albums, [['Al', 'X', 2]])
  assert.equal(Object.values(st.daily).reduce((a, b) => a + b), 3)
  assert.equal(st.recent[0].name, 'A')
  assert.equal(st.first, now - 40 * 86400)
})

function env() {
  const kv = new Map()
  return { LOSTFM_TOKEN: 'secret', LOSTFM: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => kv.set(k, v) } }
}
const req = (method, body, auth) => new Request('https://vs.izie.top/lostfm/api/stats', { method, body, headers: auth ? { authorization: auth } : {} })

test('worker: push needs the token, then GET serves it', async () => {
  const e = env()
  assert.equal((await handleLostfm(req('GET'), e)).status, 404)
  assert.equal((await handleLostfm(req('POST', '{"total":1}', 'Bearer nope'), e)).status, 401)
  assert.equal((await handleLostfm(req('POST', '{"total":1}'), e)).status, 401)
  assert.equal((await handleLostfm(req('POST', 'not json', 'Bearer secret'), e)).status, 400)
  assert.equal((await handleLostfm(req('POST', '{"nope":1}', 'Bearer secret'), e)).status, 400)
  assert.equal((await handleLostfm(req('POST', '{"total":5}', 'Bearer secret'), e)).status, 200)
  const r = await handleLostfm(req('GET'), e)
  assert.equal(r.status, 200)
  assert.deepEqual(await r.json(), { total: 5 })
  assert.equal((await handleLostfm(req('DELETE'), e)).status, 405)
})

test('worker: refuses when no token is configured', async () => {
  const e = env(); delete e.LOSTFM_TOKEN
  assert.equal((await handleLostfm(req('POST', '{"total":1}', 'Bearer undefined'), e)).status, 401)
})
