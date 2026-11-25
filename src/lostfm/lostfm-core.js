// Pure parts of the lostfm worker (no Cloudflare imports), so node can test them.
const MAX_LISTENS_PER_SUBMIT = 1000
const FIELD_MAX = 512

/** Validates a ListenBrainz submit-listens body. Returns { type, listens: [{listened_at, artist, track, album}] }. */
export function parseSubmission(body) {
  if (!body || typeof body !== 'object') throw new Error('Invalid JSON.')
  const type = body.listen_type
  if (!['single', 'playing_now', 'import'].includes(type)) throw new Error('listen_type must be single, playing_now or import.')
  if (!Array.isArray(body.payload) || !body.payload.length) throw new Error('payload must be a non-empty list.')
  if (body.payload.length > MAX_LISTENS_PER_SUBMIT) throw new Error('Too many listens in one request.')
  if (type !== 'import' && body.payload.length !== 1) throw new Error(`${type} takes exactly one listen.`)
  const clean = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, FIELD_MAX) : '')
  const listens = body.payload.map((l) => {
    const m = l?.track_metadata
    const artist = clean(m?.artist_name), track = clean(m?.track_name)
    if (!artist || !track) throw new Error('artist_name and track_name are required.')
    const listened_at = type === 'playing_now' ? null : Number(l.listened_at)
    if (type !== 'playing_now' && !(Number.isInteger(listened_at) && listened_at > 1e9 && listened_at < 1e10)) {
      throw new Error('listened_at must be a unix timestamp in seconds.')
    }
    const info = m.additional_info || {}
    const spotify = typeof info.spotify_id === 'string' && /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+$/.test(info.spotify_id) ? info.spotify_id : ''
    const origin = clean(info.origin_url)
    const urlOk = /^https:\/\/(music\.apple\.com|open\.spotify\.com|www\.youtube\.com|music\.youtube\.com|soundcloud\.com)\//.test(origin)
    return { listened_at, artist, track, album: clean(m.release_name), url: spotify || (urlOk ? origin : ''), player: clean(info.media_player || info.submission_client) }
  })
  return { type, listens }
}

