// Your own lostfm: listens live in IndexedDB in this browser. Sources: Spotify (PKCE login, no secret),
// a private ListenBrainz-style inbox for Apple Music and other scrobblers, and file imports.
import { computeStats, parseImport, spotifyItemsToListens, pickImage, safeLink } from '../lib.js'
import { renderProfile, icon, fmt, ago } from '../ui.js'

const CLIENT_ID = '0548030654df4cfda630057b3ec8bc6e'
const REDIRECT = `${location.origin}/lostfm/connect/`
const SCOPES = 'user-read-currently-playing user-read-recently-played'
const SYNC_EVERY = 60_000
const $ = (s) => document.querySelector(s)
const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} },
}

document.querySelectorAll('[data-icon]').forEach((el) => { el.outerHTML = icon(el.dataset.icon) })

let period = store.get('lostfm.period') || '7d'
let nowPlaying = null
let artistImages = new Map(Object.entries(JSON.parse(store.get('lostfm.artistImages') || '{}')))

function setStatus(id, text, kind = '') {
  const el = $(id)
  el.className = `status ${kind}`
  el.innerHTML = text ? `${kind === 'ok' ? icon('check') : ''}<span></span>` : ''
  if (text) el.querySelector('span').textContent = text
}

// ---------- IndexedDB ----------
let dbPromise
function db() {
  dbPromise ||= new Promise((res, rej) => {
    const req = indexedDB.open('lostfm', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('listens', { keyPath: 'id' })
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
  return dbPromise
}
async function tx(mode, fn) {
  const d = await db()
  return new Promise((res, rej) => {
    const t = d.transaction('listens', mode)
    const out = fn(t.objectStore('listens'))
    t.oncomplete = () => res(out?.result ?? out)
    t.onerror = () => rej(t.error)
  })
}
const allListens = () => tx('readonly', (s) => s.getAll())
const countListens = () => tx('readonly', (s) => s.count())
const clearListens = () => tx('readwrite', (s) => s.clear())
async function putListens(rows) {
  const before = await countListens()
  // keep artwork we already have if the new copy lacks it
  const existing = new Map((await allListens()).map((l) => [l.id, l]))
  await tx('readwrite', (s) => rows.forEach((r) => s.put({ ...r, image: r.image || existing.get(r.id)?.image || '' })))
  return (await countListens()) - before
}

// ---------- Spotify (PKCE) ----------
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
async function login() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)))
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)))
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  sessionStorage.setItem('lostfm.verifier', verifier)
  sessionStorage.setItem('lostfm.state', state)
  location.href = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT, scope: SCOPES,
    code_challenge_method: 'S256', code_challenge: challenge, state,
  })
}
async function tokenRequest(params) {
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...params }),
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) {
    if (body.error === 'invalid_grant') { forgetSpotify(); throw new Error('Spotify login expired. Connect again.') }
    throw new Error(body.error_description || body.error || `Spotify said ${r.status}`)
  }
  store.set('lostfm.access', body.access_token)
  store.set('lostfm.expires', String(Date.now() + (body.expires_in - 60) * 1000))
  if (body.refresh_token) store.set('lostfm.refresh', body.refresh_token)
}
async function finishLogin() {
  const q = new URLSearchParams(location.search)
  if (!q.has('code') && !q.has('error')) return
  history.replaceState(null, '', location.pathname)
  const state = sessionStorage.getItem('lostfm.state'), verifier = sessionStorage.getItem('lostfm.verifier')
  sessionStorage.removeItem('lostfm.state'); sessionStorage.removeItem('lostfm.verifier')
  if (q.get('error')) throw new Error(q.get('error') === 'access_denied' ? 'You cancelled the Spotify login.' : `Spotify login failed: ${q.get('error')}`)
  if (!state || q.get('state') !== state) throw new Error('Login check failed. Try connecting again.')
  await tokenRequest({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: REDIRECT, code_verifier: verifier })
}
function forgetSpotify() {
  ['access', 'expires', 'refresh', 'lastsync'].forEach((k) => store.set(`lostfm.${k}`, null))
}
async function accessToken() {
  if (store.get('lostfm.access') && Date.now() < Number(store.get('lostfm.expires'))) return store.get('lostfm.access')
  if (!store.get('lostfm.refresh')) return null
  await tokenRequest({ grant_type: 'refresh_token', refresh_token: store.get('lostfm.refresh') })
  return store.get('lostfm.access')
}
async function spotify(path) {
  const t = await accessToken()
  if (!t) throw new Error('Not connected')
  const r = await fetch(`https://api.spotify.com/v1${path}`, { headers: { authorization: `Bearer ${t}` } })
  if (r.status === 204) return null
  if (r.status === 403) throw new Error("Spotify won't let this account in yet. Ask izie to add your Spotify email.")
  if (r.status === 429) throw new Error('Spotify is rate limiting us. Trying again in a minute.')
  if (!r.ok) throw new Error(`Spotify said ${r.status}`)
  return r.json()
}
async function syncSpotify() {
  const recent = await spotify('/me/player/recently-played?limit=50')
  await putListens(spotifyItemsToListens(recent?.items || []))
  const cur = await spotify('/me/player/currently-playing')
  const it = cur?.is_playing && cur.currently_playing_type === 'track' ? cur.item : null
  store.set('lostfm.lastsync', String(Date.now()))
  return it ? { name: it.name, artist: it.artists.map((a) => a.name).join(', '), album: it.album?.name || '', url: it.external_urls?.spotify || '', image: pickImage(it.album?.images) } : null
}

// ---------- inbox (Apple Music & other scrobblers) ----------
async function createToken() {
  const r = await fetch('../api/token', { method: 'POST' })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(body.error || `Couldn't make a token (${r.status})`)
  store.set('lostfm.inboxToken', body.token)
  store.set('lostfm.inboxAfter', '0')
}
async function syncInbox() {
  const token = store.get('lostfm.inboxToken')
  if (!token) return null
  let after = Number(store.get('lostfm.inboxAfter') || 0), np = null
  for (let i = 0; i < 50; i++) {
    const r = await fetch(`../api/inbox?after=${after}`, { headers: { authorization: `Token ${token}` }, cache: 'no-store' })
    if (r.status === 401) { store.set('lostfm.inboxToken', null); throw new Error('Your scrobble token was deleted. Make a new one.') }
    if (!r.ok) throw new Error(`Inbox said ${r.status}`)
    const body = await r.json()
    await putListens(body.listens.map((l) => ({
      id: `inbox:${l.id}`, ts: l.listened_at, name: l.track, artist: l.artist, album: l.album || '',
      url: safeLink(l.url), source: 'inbox', image: '',
    })))
    after = body.next
    store.set('lostfm.inboxAfter', String(after))
    if (body.now_playing) np = { name: body.now_playing.track, artist: body.now_playing.artist, album: body.now_playing.album || '', url: safeLink(body.now_playing.url), image: '' }
    if (!body.more) break
  }
  store.set('lostfm.inboxLast', String(Date.now()))
  return np
}

// ---------- artist pictures ----------
async function fillArtistImages(stats) {
  const names = [...new Set(Object.values(stats.periods).flatMap((p) => p.artists.slice(0, 11).map((a) => a.name)))]
    .filter((n) => !artistImages.has(n)).slice(0, 12)
  if (!names.length) return false
  await Promise.all(names.map(async (n) => {
    try {
      const r = await fetch(`../api/artist-image?name=${encodeURIComponent(n)}`)
      artistImages.set(n, r.ok ? (await r.json()).image || '' : '')
    } catch { /* try again next time */ }
  }))
  store.set('lostfm.artistImages', JSON.stringify(Object.fromEntries(artistImages)))
  return true
}

// ---------- UI ----------
function renderSources() {
  const connected = !!store.get('lostfm.refresh')
  $('#spotify-actions').innerHTML = connected
    ? `<button id="sp-sync">${icon('refresh')} Sync now</button><button id="sp-off">${icon('logout')} Disconnect</button>`
    : `<button id="sp-on" class="primary">${icon('spotify')} Connect Spotify</button>`
  $('#sp-on')?.addEventListener('click', login)
  $('#sp-sync')?.addEventListener('click', () => sync(true))
  $('#sp-off')?.addEventListener('click', () => { forgetSpotify(); renderSources(); setStatus('#spotify-status', 'Disconnected. Your history is still here.') })
  const last = Number(store.get('lostfm.lastsync'))
  if (connected && last && !$('#spotify-status').textContent) setStatus('#spotify-status', `Connected · synced ${ago(last / 1000)}`, 'ok')

  const token = store.get('lostfm.inboxToken')
  $('#token-box').hidden = !token
  $('#token-actions').innerHTML = token
    ? `<button id="tok-del" class="danger">${icon('trash')} Delete token</button>`
    : `<button id="tok-new" class="primary">${icon('key')} Make a scrobble token</button>`
  if (token) {
    $('#token-url').textContent = `${location.origin}/lostfm/1/submit-listens`
    $('#token-value').textContent = token
  }
  $('#tok-new')?.addEventListener('click', async () => {
    try { await createToken(); renderSources(); setStatus('#token-status', 'Token ready. Paste it into your scrobbler.', 'ok') } catch (e) { setStatus('#token-status', e.message, 'err') }
  })
  $('#tok-del')?.addEventListener('click', async (ev) => {
    const b = ev.currentTarget
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.lastChild.textContent = ' Click again to delete'; return }
    await deleteToken(); renderSources(); setStatus('#token-status', 'Token deleted. Plays already pulled in are kept.')
  })
}
async function deleteToken() {
  const token = store.get('lostfm.inboxToken')
  if (token) await fetch('../api/token/delete', { method: 'POST', headers: { authorization: `Token ${token}` } }).catch(() => {})
  store.set('lostfm.inboxToken', null); store.set('lostfm.inboxAfter', null); store.set('lostfm.inboxLast', null)
}

async function draw() {
  const listens = await allListens()
  $('#data-summary').textContent = listens.length ? `${fmt(listens.length)} plays stored in this browser.` : 'Nothing stored yet.'
  const stats = computeStats(listens, undefined, { artistImages })
  stats.now_playing = nowPlaying
  renderProfile($('#profile'), stats, {
    name: 'you', avatar: 'you', period, emptyText: 'Connect a source or import a file and your stats show up here.',
    onPeriod: (p) => { period = p; store.set('lostfm.period', p); draw() },
  })
  if (await fillArtistImages(stats)) draw()
}

let syncing = false
async function sync(manual = false) {
  if (syncing) return
  syncing = true
  let np = null
  if (store.get('lostfm.refresh')) {
    try {
      if (manual) setStatus('#spotify-status', 'Syncing…')
      np = await syncSpotify()
      setStatus('#spotify-status', 'Connected · synced just now', 'ok')
    } catch (e) { setStatus('#spotify-status', e.message, 'err'); renderSources() }
  }
  if (store.get('lostfm.inboxToken')) {
    try {
      np = np || await syncInbox()
      setStatus('#token-status', `Inbox checked ${ago(Number(store.get('lostfm.inboxLast')) / 1000)}`, 'ok')
    } catch (e) { setStatus('#token-status', e.message, 'err'); renderSources() }
  }
  nowPlaying = np
  syncing = false
  await draw()
}

$('#import').addEventListener('change', async (ev) => {
  const files = [...ev.target.files]
  ev.target.value = ''
  if (!files.length) return
  try {
    setStatus('#import-status', 'Importing…')
    let rows = []
    for (const f of files) rows = rows.concat(parseImport(await f.text()))
    const added = await putListens(rows)
    setStatus('#import-status', `Imported ${fmt(added)} new plays (${fmt(rows.length)} in the file${files.length > 1 ? 's' : ''}).`, 'ok')
    await draw()
  } catch (e) { setStatus('#import-status', e.message || 'That file could not be read.', 'err') }
})
$('#import').multiple = true

$('#export').addEventListener('click', async () => {
  const blob = new Blob([JSON.stringify({ lostfm: 1, listens: await allListens() })], { type: 'application/json' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'lostfm-listens.json' })
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
})
$('#wipe').addEventListener('click', async (ev) => {
  const b = ev.currentTarget
  if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.lastChild.textContent = ' Click again: this can\'t be undone'; return }
  await clearListens(); await deleteToken(); forgetSpotify()
  ;['artistImages'].forEach((k) => store.set(`lostfm.${k}`, null)); artistImages = new Map()
  b.dataset.armed = ''; b.lastChild.textContent = ' Delete everything'
  nowPlaying = null
  setStatus('#data-status', 'Deleted. Spotify is disconnected and your scrobble token is gone.', 'ok')
  renderSources(); draw()
})
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-copy]')
  if (!b) return
  try { await navigator.clipboard.writeText($(`#${b.dataset.copy}`).textContent); b.lastChild.textContent = ' Copied' } catch { b.lastChild.textContent = ' Select it' }
  setTimeout(() => { b.lastChild.textContent = ' Copy' }, 1500)
})

;(async () => {
  try { await finishLogin() } catch (e) { setStatus('#spotify-status', e.message, 'err') }
  renderSources()
  await draw()
  sync()
  setInterval(() => { if (!document.hidden) sync() }, SYNC_EVERY)
})()
