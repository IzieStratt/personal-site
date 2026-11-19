// Pure helpers for lostfm (no DOM), so they can be tested with node.
// A listen is { id, ts (start, unix seconds), name, artist, album, url, source }.

export function spotifyItemsToListens(items) {
  const out = []
  for (const it of items || []) {
    const t = it?.track
    if (!t?.name || !it.played_at) continue
    // played_at is when the play ended; store start times like Last.fm does
    const ts = Math.floor(Date.parse(it.played_at) / 1000 - (t.duration_ms || 0) / 1000)
    out.push({
      id: `sp:${it.played_at}`, ts, name: t.name,
      artist: (t.artists || []).map((a) => a.name).join(', '),
      album: t.album?.name || '', url: t.external_urls?.spotify || '', source: 'spotify',
    })
  }
  return out
}

const lf = (ts, name, artist, album = '', url = '', source = 'lastfm') =>
  ts && name ? { id: `${source === 'lastfm' ? 'lf' : source}:${ts}:${name}`, ts, name, artist: artist || '', album: album || '', url: url || '', source } : null

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

/** Accepts: lostfm's own export, Last.fm exports (CSV with or without header, API-style JSON pages),
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
        if (v.track && typeof v.track === 'object') return walk(v.track)
        if (v.recenttracks) return walk(v.recenttracks)
        if (v.date?.uts && v.name) {
          const a = v.artist, al = v.album
          out.push(lf(Number(v.date.uts), v.name, a?.['#text'] ?? a?.name ?? a, al?.['#text'] ?? al, v.url))
        } else if ('master_metadata_track_name' in v) {
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
    const col = (...names) => head.findIndex((h) => names.includes(h))
    const ti = col('track', 'name', 'title', 'track_name'), ai = col('artist', 'artist_name')
    if (ti >= 0 && ai >= 0) {
      const ui = col('uts', 'timestamp', 'date', 'utc_time', 'time', 'played_at'), bi = col('album', 'album_name')
      for (const r of rows.slice(1)) out.push(lf(toTs(r[ui]), r[ti], r[ai], bi >= 0 ? r[bi] : ''))
    } else {
      // lastfm-to-csv: artist,album,track,date
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

function top(list, keyFn, n) {
  const m = new Map()
  for (const l of list) {
    const k = keyFn(l)
    if (!k) continue
    const s = JSON.stringify(k)
    const e = m.get(s)
    e ? e[e.length - 1]++ : m.set(s, [...k, 1])
  }
  return [...m.values()].sort((a, b) => b.at(-1) - a.at(-1)).slice(0, n)
}

/** Same shape as SpotifyScrobbler.stats() in music-stalker. */
export function computeStats(listens, now = Math.floor(Date.now() / 1000), { recent = 50, n = 25, days = 365 } = {}) {
  const all = dedupe(listens).sort((a, b) => b.ts - a.ts)
  const out = { generated_at: now, total: all.length, first: all.length ? all.at(-1).ts : null, periods: {}, daily: {}, recent: [], now_playing: null }
  out.recent = all.slice(0, recent).map(({ name, artist, album, url, ts }) => ({ name, artist, album, url, ts }))
  for (const l of all) {
    if (l.ts < now - days * 86400) break
    const d = new Date(l.ts * 1000).toISOString().slice(0, 10)
    out.daily[d] = (out.daily[d] || 0) + 1
  }
  for (const [label, d] of [['7d', 7], ['30d', 30], ['365d', 365], ['all', null]]) {
    const since = d ? now - d * 86400 : 0
    const p = all.filter((l) => l.ts >= since)
    out.periods[label] = {
      plays: p.length,
      artists: top(p, (l) => [l.artist], n),
      tracks: top(p, (l) => [l.name, l.artist], n),
      albums: top(p, (l) => (l.album ? [l.album, l.artist] : null), n),
    }
  }
  return out
}
