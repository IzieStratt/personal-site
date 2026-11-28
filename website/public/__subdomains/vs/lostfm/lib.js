// Pure helpers for lostfm (no DOM), so they can be tested with node.
// A listen is { id, ts (start, unix seconds), name, artist, album, url, source }.

const IMAGE_HOSTS = /^https:\/\/(i\.scdn\.co|[a-z0-9-]+\.mzstatic\.com|coverartarchive\.org|archive\.org|[a-z0-9-]+\.archive\.org)\//

/** Only https images from hosts we expect; anything else becomes '' (the page draws a placeholder). */
export const safeImage = (u) => (typeof u === 'string' && IMAGE_HOSTS.test(u) ? u : '')
/** Only https links to music services; anything else (javascript:, data:, http:) becomes ''. */
export const safeLink = (u) =>
  typeof u === 'string' && /^https:\/\/(open\.spotify\.com|music\.apple\.com|www\.youtube\.com|music\.youtube\.com|soundcloud\.com)\//.test(u) ? u : ''

/** Spotify image lists are largest-first; take the smallest one at least `want` px wide. */
export function pickImage(images, want = 300) {
  const ok = (images || []).filter((i) => safeImage(i?.url))
  if (!ok.length) return ''
  const big = ok.filter((i) => (i.width || 0) >= want)
  return (big.length ? big.at(-1) : ok[0]).url
}

export function spotifyItemsToListens(items) {
  const out = []
  for (const it of items || []) {
    const t = it?.track
    if (!t?.name || !it.played_at) continue
    // played_at is when the play ended; store start times
    const ts = Math.floor(Date.parse(it.played_at) / 1000 - (t.duration_ms || 0) / 1000)
    out.push({
      id: `sp:${it.played_at}`, ts, name: t.name,
      artist: (t.artists || []).map((a) => a.name).join(', '),
      album: t.album?.name || '', url: t.external_urls?.spotify || '', source: 'spotify',
      image: pickImage(t.album?.images),
    })
  }
  return out
}

const lf = (ts, name, artist, album = '', url = '', source = 'csv', image = '') =>
  ts && name ? { id: `${source === 'csv' ? 'lf' : source}:${ts}:${name}`, ts, name, artist: artist || '', album: album || '', url: url || '', source, image: safeImage(image) } : null

export function parseCsv(text) {
  const rows = []
  let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') q = false
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((f) => f.trim()))
}

function toTs(v) {
  if (v == null || v === '') return null
  if (/^\d{9,11}$/.test(String(v).trim())) return Number(v)
  const ms = Date.parse(/\d{1,2} \w{3} \d{4}/.test(v) && !/Z|[+-]\d\d:?\d\d$/.test(v) ? `${v} UTC` : v)
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

/** Accepts: lostfm's own export, generic CSVs (with or without header),
 *  and Spotify's extended streaming history JSON. Returns listens. Throws if nothing is recognised. */
export function parseImport(text) {
  const trimmed = text.trim()
  let out = []
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const data = JSON.parse(trimmed)
    if (data?.listens) out = data.listens.filter((l) => l?.id && l.ts && l.name)
    else {
      const walk = (v) => {
        if (Array.isArray(v)) return v.forEach(walk)
        if (!v || typeof v !== 'object') return
        if ('master_metadata_track_name' in v) {
          if (!v.master_metadata_track_name || (v.ms_played ?? 0) < 30000) return
          const end = Date.parse(v.ts)
          const id = v.spotify_track_uri?.split(':').pop()
          out.push(lf(Math.floor((end - v.ms_played) / 1000), v.master_metadata_track_name,
            v.master_metadata_album_artist_name, v.master_metadata_album_album_name,
            id ? `https://open.spotify.com/track/${id}` : '', 'sphist'))
        }
      }
      walk(data)
    }
  } else {
    const rows = parseCsv(text)
    const head = rows[0]?.map((h) => h.trim().toLowerCase()) || []
    // Apple Music "Play Activity" CSV from privacy.apple.com
    const am = (n) => head.indexOf(n)
    if (am('song name') >= 0 && am('event start timestamp') >= 0) {
      const name = am('song name'), artist = am('artist name'), album = am('album name'), start = am('event start timestamp')
      const playMs = am('play duration milliseconds'), endType = am('end reason type'), media = am('media type')
      for (const r of rows.slice(1)) {
        if (media >= 0 && r[media] && !/audio/i.test(r[media])) continue
        if (playMs >= 0 && Number(r[playMs] || 0) < 30000) continue
        if (endType >= 0 && /SCRUB|FAILED/i.test(r[endType] || '')) continue
        out.push(lf(toTs(r[start]), r[name], artist >= 0 ? r[artist] : '', album >= 0 ? r[album] : '', '', 'apple'))
      }
      out = out.filter(Boolean)
      if (!out.length) throw new Error("couldn't find any plays in that file")
      return out
    }
    const col = (...names) => head.findIndex((h) => names.includes(h))
    const ti = col('track', 'name', 'title', 'track_name'), ai = col('artist', 'artist_name')
    if (ti >= 0 && ai >= 0) {
      const ui = col('uts', 'timestamp', 'date', 'utc_time', 'time', 'played_at'), bi = col('album', 'album_name')
      for (const r of rows.slice(1)) out.push(lf(toTs(r[ui]), r[ti], r[ai], bi >= 0 ? r[bi] : ''))
    } else {
      // headerless: artist,album,track,date
      for (const r of rows) if (r.length >= 4) out.push(lf(toTs(r[3]), r[2], r[0], r[1]))
    }
  }
  out = out.filter(Boolean)
  if (!out.length) throw new Error("couldn't find any plays in that file")
  return out
}

/** Drops imported plays that a Spotify sync already recorded (same track within 5 minutes). */
export function dedupe(listens) {
  const live = new Map()
  for (const l of listens) if (l.source === 'spotify') (live.get(l.name) || live.set(l.name, []).get(l.name)).push(l.ts)
  return listens.filter((l) => l.source === 'spotify' || !(live.get(l.name) || []).some((t) => Math.abs(t - l.ts) <= 300))
}

function top(list, keyFn, n, extra) {
  const m = new Map()
  for (const l of list) {
    const k = keyFn(l)
    if (!k) continue
    const e = m.get(k)
    if (e) {
      e.plays++
      if (!e.image && l.image) e.image = l.image
    } else m.set(k, { ...extra(l), plays: 1 })
  }
  return [...m.values()].sort((a, b) => b.plays - a.plays).slice(0, n)
}

/** Same shape as SpotifyScrobbler.stats() in music-stalker. artistImages: Map of artist name -> image url. */
export function computeStats(listens, now = Math.floor(Date.now() / 1000), { recent = 50, n = 25, days = 365, artistImages = new Map() } = {}) {
  const all = dedupe(listens).sort((a, b) => b.ts - a.ts)
  // a play without art borrows it from another play of the same track
  const artFor = new Map()
  for (const l of all) if (l.image && !artFor.has(`${l.name}\u0000${l.artist}`)) artFor.set(`${l.name}\u0000${l.artist}`, l.image)
  for (const l of all) if (!l.image) l.image = artFor.get(`${l.name}\u0000${l.artist}`) || ''
  const out = {
    generated_at: now, total: all.length, artists: new Set(all.map((l) => l.artist)).size,
    tracks: new Set(all.map((l) => `${l.name}\u0000${l.artist}`)).size,
    first: all.length ? all.at(-1).ts : null, periods: {}, daily: {}, recent: [], now_playing: null,
  }
  out.recent = all.slice(0, recent).map(({ name, artist, album, url, ts, image }) => ({ name, artist, album, url, ts, image: image || '' }))
  for (const l of all) {
    if (l.ts < now - days * 86400) break
    const d = new Date(l.ts * 1000).toISOString().slice(0, 10)
    out.daily[d] = (out.daily[d] || 0) + 1
  }
  for (const [label, d] of [['7d', 7], ['30d', 30], ['365d', 365], ['all', null]]) {
    const since = d ? now - d * 86400 : 0
    const p = all.filter((l) => l.ts >= since)
    const artists = top(p, (l) => l.artist, n, (l) => ({ name: l.artist, image: '', url: '' }))
    for (const a of artists) a.image = artistImages.get(a.name) || ''
    out.periods[label] = {
      plays: p.length,
      artists,
      tracks: top(p, (l) => `${l.name}\u0000${l.artist}`, n, (l) => ({ name: l.name, artist: l.artist, image: l.image || '', url: l.url || '' })),
      albums: top(p, (l) => (l.album ? `${l.album}\u0000${l.artist}` : null), n, (l) => ({ name: l.album, artist: l.artist, image: l.image || '' })),
    }
  }
  return out
}
