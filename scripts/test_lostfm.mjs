// node --test scripts/test_lostfm.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, parseImport, dedupe, computeStats, spotifyItemsToListens, safeImage, safeLink, pickImage } from '../website/public/__subdomains/vs/lostfm/lib.js'
import { parseSubmission } from '../lostfm-core.js'

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
  assert.deepEqual(st.periods['7d'].artists, [{ name: 'X', image: '', url: '', plays: 2 }])
  assert.deepEqual(st.periods.all.tracks[0], { name: 'A', artist: 'X', image: '', url: '', plays: 2 })
  assert.deepEqual(st.periods.all.albums, [{ name: 'Al', artist: 'X', image: '', plays: 2 }])
  assert.equal(st.artists, 2)
  assert.equal(st.tracks, 2)
  assert.equal(Object.values(st.daily).reduce((a, b) => a + b), 3)
  assert.equal(st.recent[0].name, 'A')
  assert.equal(st.first, now - 40 * 86400)
})

test('artist images come from the map, album art from the plays', () => {
  const now = 1795000000
  const st = computeStats([{ id: '1', ts: now - 10, name: 'T', artist: 'A', album: 'B', url: '', source: 'spotify', image: 'https://i.scdn.co/image/ab' }], now,
    { artistImages: new Map([['A', 'https://i.scdn.co/image/artist']]) })
  assert.equal(st.periods['7d'].artists[0].image, 'https://i.scdn.co/image/artist')
  assert.equal(st.periods['7d'].albums[0].image, 'https://i.scdn.co/image/ab')
  assert.equal(st.recent[0].image, 'https://i.scdn.co/image/ab')
})

test('image and link allowlists block anything unexpected', () => {
  assert.equal(safeImage('https://i.scdn.co/image/ab'), 'https://i.scdn.co/image/ab')
  assert.equal(safeImage('https://lastfm.freetls.fastly.net/i/u/300x300/x.jpg'), 'https://lastfm.freetls.fastly.net/i/u/300x300/x.jpg')
  assert.equal(safeImage('https://lastfm-img.freetls.fastly.net/i/u/300x300/x.gif'), 'https://lastfm-img.freetls.fastly.net/i/u/300x300/x.gif')
  assert.equal(safeImage('https://lastfm-imgx.freetls.fastly.net/x'), '')
  assert.equal(safeImage('https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'), '')
  for (const bad of ['javascript:alert(1)', 'http://i.scdn.co/x', 'https://evil.test/x.png', 'https://i.scdn.co.evil.test/x', 'data:image/png;base64,AA', '//i.scdn.co/x', 42, null]) {
    assert.equal(safeImage(bad), '', String(bad))
  }
  assert.equal(safeLink('https://open.spotify.com/track/x'), 'https://open.spotify.com/track/x')
  for (const bad of ['javascript:alert(1)', 'https://open.spotify.com.evil.test/', 'http://open.spotify.com/', ' https://open.spotify.com/x', 'JAVASCRIPT:x']) {
    assert.equal(safeLink(bad), '', bad)
  }
  assert.equal(pickImage([{ url: 'https://i.scdn.co/640', width: 640 }, { url: 'https://i.scdn.co/300', width: 300 }, { url: 'https://i.scdn.co/64', width: 64 }]), 'https://i.scdn.co/300')
})

test('imports Apple Music Play Activity CSV, skipping short plays and non-audio', () => {
  const csv = [
    'Album Name,Artist Name,Song Name,Event Start Timestamp,Play Duration Milliseconds,End Reason Type,Media Type',
    'Al,Artist,Long Song,2024-03-01T10:00:00.000Z,200000,NATURAL_END_OF_TRACK,AUDIO',
    'Al,Artist,Skipped,2024-03-01T10:05:00.000Z,4000,TRACK_SKIPPED_FORWARDS,AUDIO',
    'Al,Artist,A Video,2024-03-01T10:06:00.000Z,200000,NATURAL_END_OF_TRACK,VIDEO',
  ].join('\n')
  const r = parseImport(csv)
  assert.equal(r.length, 1)
  assert.deepEqual([r[0].name, r[0].artist, r[0].album, r[0].ts, r[0].source], ['Long Song', 'Artist', 'Al', Date.UTC(2024, 2, 1, 10) / 1000, 'apple'])
})

test('Last.fm JSON import keeps cover art but not the placeholder', () => {
  const t = (name, img) => ({ name, artist: { '#text': 'A' }, date: { uts: '1700000000' }, image: [{ '#text': img }] })
  const r = parseImport(JSON.stringify([{ track: [t('S', 'https://lastfm.freetls.fastly.net/i/u/300x300/a.jpg'), t('P', 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'), t('E', 'https://evil.test/a.jpg')] }]))
  assert.deepEqual(r.map((x) => x.image), ['https://lastfm.freetls.fastly.net/i/u/300x300/a.jpg', '', ''])
})

const L = (over = {}) => ({ listened_at: 1700000000, track_metadata: { artist_name: 'A', track_name: 'T', ...over } })

test('submit-listens: accepts the three ListenBrainz types', () => {
  assert.equal(parseSubmission({ listen_type: 'single', payload: [L()] }).listens[0].listened_at, 1700000000)
  assert.equal(parseSubmission({ listen_type: 'playing_now', payload: [{ track_metadata: { artist_name: 'A', track_name: 'T' } }] }).listens[0].listened_at, null)
  assert.equal(parseSubmission({ listen_type: 'import', payload: [L(), L()] }).listens.length, 2)
})

test('submit-listens: rejects bad input', () => {
  const bad = [
    null, 'x', {}, { listen_type: 'nope', payload: [L()] }, { listen_type: 'single', payload: [] },
    { listen_type: 'single', payload: [L(), L()] }, { listen_type: 'single', payload: [{ listened_at: 1700000000, track_metadata: { artist_name: 'A' } }] },
    { listen_type: 'single', payload: [{ ...L(), listened_at: 'soon' }] }, { listen_type: 'single', payload: [{ ...L(), listened_at: 1.5e9 + 0.5 }] },
    { listen_type: 'single', payload: [{ ...L(), listened_at: 99 }] }, { listen_type: 'import', payload: Array(1001).fill(L()) },
    { listen_type: 'single', payload: [{ listened_at: 1700000000, track_metadata: { artist_name: { toString: 1 }, track_name: 'T' } }] },
  ]
  for (const b of bad) assert.throws(() => parseSubmission(b), JSON.stringify(b)?.slice(0, 80))
})

test('submit-listens: strips control characters, trims long fields, only keeps safe links', () => {
  const r = parseSubmission({ listen_type: 'single', payload: [L({ track_name: 'a\u0000b\nc' + 'x'.repeat(2000), artist_name: ' A ',
    additional_info: { origin_url: 'javascript:alert(1)', spotify_id: 'https://open.spotify.com/track/abc' } })] }).listens[0]
  assert.equal(r.track.length, 512)
  assert.ok(r.track.startsWith('abcx'))
  assert.equal(r.artist, 'A')
  assert.equal(r.url, 'https://open.spotify.com/track/abc')
  const r2 = parseSubmission({ listen_type: 'single', payload: [L({ additional_info: { origin_url: 'javascript:alert(1)' } })] }).listens[0]
  assert.equal(r2.url, '')
  const r3 = parseSubmission({ listen_type: 'single', payload: [L({ additional_info: { origin_url: 'https://music.apple.com/us/song/1' } })] }).listens[0]
  assert.equal(r3.url, 'https://music.apple.com/us/song/1')
})
