// Your own lostfm: listens live in IndexedDB in this browser. Sources: Spotify (PKCE login, no secret),
// a private ListenBrainz-style inbox for Apple Music and other scrobblers, and file imports.
import { computeStats, parseImport, spotifyItemsToListens, pickImage, safeLink } from '../lib.js'
import { renderProfile, icon, fmt, ago } from '../ui.js'

const DEFAULT_CLIENT_ID = '0548030654df4cfda630057b3ec8bc6e'
const ownClientId = () => { const v = store.get('lostfm.clientId'); return /^[0-9a-f]{32}$/.test(v || '') ? v : '' }
// people already connected through izie's app keep it until they disconnect; everyone new brings their own
const onIzieApp = () => store.get('lostfm.legacyApp') === '1'
const clientId = () => ownClientId() || (onIzieApp() ? DEFAULT_CLIENT_ID : '')
const REDIRECT = `${location.origin}/lostfm/connect/`
const SCOPES = 'user-read-currently-playing user-read-recently-played'
const SYNC_EVERY = 60_000
const $ = (s) => document.querySelector(s)
const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  // returns false when the browser blocks or fills storage, so callers can say so instead of pretending
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); return true } catch { return false } },
}
const session = {
  get: (k) => { try { return sessionStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); return true } catch { return false } },
}
const STORAGE_BLOCKED = 'Your browser is blocking site storage, so lostfm can\'t save this. Allow storage for vs.izie.top (or leave private browsing) and try again.'

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
  if (!clientId()) return setStatus('#spotify-status', 'Add your Client ID first.', 'err')
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)))
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)))
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  const ok = session.set('lostfm.verifier', verifier) && session.set('lostfm.state', state) && session.set('lostfm.loginClient', clientId())
  if (!ok) return setStatus('#spotify-status', STORAGE_BLOCKED, 'err')
  location.href = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    client_id: clientId(), response_type: 'code', redirect_uri: REDIRECT, scope: SCOPES,
    code_challenge_method: 'S256', code_challenge: challenge, state,
  })
}
async function tokenRequest(params, client = clientId()) {
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: client, ...params }),
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) {
    // only a refused *refresh* means the saved login is dead; a refused code exchange leaves it alone
    if (body.error === 'invalid_grant' && params.grant_type === 'refresh_token') { forgetSpotify(); throw new Error('Spotify login expired. Connect again.') }
    if (body.error === 'invalid_grant') throw new Error('That Spotify login didn\'t go through. Try connecting again.')
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
  const state = session.get('lostfm.state'), verifier = session.get('lostfm.verifier'), client = session.get('lostfm.loginClient')
  ;['state', 'verifier', 'loginClient'].forEach((k) => session.set(`lostfm.${k}`, null))
  if (q.get('error')) throw new Error(q.get('error') === 'access_denied' ? 'You cancelled the Spotify login.' : `Spotify login failed: ${q.get('error')}`)
  if (!state || !client || q.get('state') !== state) throw new Error('Login check failed. Try connecting again.')
  await tokenRequest({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: REDIRECT, code_verifier: verifier }, client)
  // the refresh token belongs to the app that made it, so keep using that app from now on
  if (client === DEFAULT_CLIENT_ID && !ownClientId()) store.set('lostfm.legacyApp', '1')
  else if (client !== ownClientId()) store.set('lostfm.clientId', client)
}
function forgetSpotify() {
  ['access', 'expires', 'refresh', 'lastsync', 'legacyApp'].forEach((k) => store.set(`lostfm.${k}`, null))
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
  if (r.status === 403) throw new Error("Spotify won't let this account in yet. Check the Client ID and that the redirect URI was added to your app.")
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
  if (!store.set('lostfm.inboxToken', body.token)) throw new Error(STORAGE_BLOCKED)
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
const imageRetryAt = new Map() // artist -> time we may ask again after a failed request
async function fillArtistImages(stats) {
  const now = Date.now()
  const names = [...new Set(Object.values(stats.periods).flatMap((p) => p.artists.slice(0, 11).map((a) => a.name)))]
    .filter((n) => !artistImages.has(n) && (imageRetryAt.get(n) || 0) <= now).slice(0, 12)
  if (!names.length) return false
  let stored = 0
  await Promise.all(names.map(async (n) => {
    try {
      const r = await fetch(`../api/artist-image?name=${encodeURIComponent(n)}`)
      if (!r.ok) throw new Error(String(r.status))
      artistImages.set(n, (await r.json()).image || '')
      stored++
    } catch {
      imageRetryAt.set(n, now + 5 * 60_000) // offline or server trouble: leave it for five minutes
    }
  }))
  if (stored) store.set('lostfm.artistImages', JSON.stringify(Object.fromEntries(artistImages)))
  return stored > 0
}

// ---------- UI ----------
let editingClientId = false
// buttons get rebuilt below; put keyboard focus back on the same (or replacement) control afterwards
function keepFocus(container, render) {
  const had = container.contains(document.activeElement)
  const id = had ? document.activeElement.id : null
  render()
  if (!had) return
  ;(id && document.getElementById(id)) ? document.getElementById(id).focus() : container.querySelector('button, a')?.focus()
}
function renderSources() {
  keepFocus($('#spotify-card'), renderSpotify)
  keepFocus($('#apple-card'), renderToken)
}
function renderSpotify() {
  const connected = !!store.get('lostfm.refresh')
  const own = ownClientId()
  $('#own-app-setup').hidden = connected || (!!own && !editingClientId)
  $('#own-app-cancel').hidden = !editingClientId
  if (editingClientId) $('#own-app-details').open = true
  const setupOpen = $('#own-app-details').open
  $('#spotify-actions').innerHTML = connected
    ? `<button id="sp-sync">${icon('refresh')} Sync now</button><button id="sp-off">${icon('logout')} Disconnect</button>`
    : !own || editingClientId
    ? `<button id="sp-setup" class="primary" aria-expanded="${setupOpen}" aria-controls="own-app-details">${icon('spotify')} ${setupOpen ? 'Hide setup' : 'Set up Spotify'}</button>`
    : `<button id="sp-on" class="primary">${icon('spotify')} Connect Spotify</button><button id="sp-change">Change Client ID</button>`
  $('#sp-on')?.addEventListener('click', login)
  $('#sp-setup')?.addEventListener('click', () => {
    $('#own-app-details').open = !$('#own-app-details').open
    if (!$('#own-app-details').open) editingClientId = false
    renderSources()
    if ($('#own-app-details').open) $('#own-app-details a').focus()
  })
  // the saved ID stays until a new one is saved; Cancel goes back to it
  $('#sp-change')?.addEventListener('click', () => { editingClientId = true; $('#own-app-input').value = own; renderSources(); $('#own-app-input').focus() })
  $('#sp-sync')?.addEventListener('click', () => sync(true))
  $('#sp-off')?.addEventListener('click', () => {
    const legacy = onIzieApp()
    forgetSpotify(); renderSources()
    setStatus('#spotify-status', legacy ? 'Disconnected. Your history is still here. To reconnect, set up your own Spotify app.' : 'Disconnected. Your history is still here.')
  })
  const last = Number(store.get('lostfm.lastsync'))
  if (connected && last && !$('#spotify-status').textContent) setStatus('#spotify-status', `${connectedLabel()} · synced ${ago(last / 1000)}`, 'ok')
}
const connectedLabel = () => (onIzieApp() ? "Connected through izie's app" : 'Connected')
function renderToken() {
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
    try { await createToken(); renderSources(); tokenMessage('Token ready. Paste it into your scrobbler.', 'ok') } catch (e) { tokenMessage(e.message, 'err') }
  })
  $('#tok-del')?.addEventListener('click', async (ev) => {
    const b = ev.currentTarget
    if (!confirmClick(b, ' Click again to delete', ' Delete token')) return
    if (await deleteToken()) { renderSources(); tokenMessage('Token deleted. Plays already pulled in are kept.', 'ok') }
    else tokenMessage("Couldn't reach lostfm to delete the token. Nothing was changed; try again.", 'err')
  })
}
// two-step confirm for destructive buttons; the armed state times out or ends when focus leaves
function confirmClick(b, armedText, restText) {
  if (b.dataset.armed === '1') { delete b.dataset.armed; b.lastChild.textContent = restText; return true }
  b.dataset.armed = '1'; b.lastChild.textContent = armedText
  const disarm = () => { if (b.dataset.armed) { delete b.dataset.armed; b.lastChild.textContent = restText } }
  setTimeout(disarm, 5000)
  b.addEventListener('blur', disarm, { once: true })
  return false
}
// server delete first; the local copy goes only when the server agreed (or already had no such token)
async function deleteToken() {
  const token = store.get('lostfm.inboxToken')
  if (token) {
    try {
      const r = await fetch('../api/token/delete', { method: 'POST', headers: { authorization: `Token ${token}` } })
      if (!r.ok && r.status !== 401) return false
    } catch { return false }
  }
  store.set('lostfm.inboxToken', null); store.set('lostfm.inboxAfter', null); store.set('lostfm.inboxLast', null)
  return true
}
// a message the person just triggered stays put for a while instead of being replaced by the next sync
let tokenMessageUntil = 0
function tokenMessage(text, kind) { tokenMessageUntil = Date.now() + 20_000; setStatus('#token-status', text, kind) }

let drawnKey = ''
async function draw(force = false) {
  const listens = await allListens()
  $('#data-summary').textContent = listens.length ? `${fmt(listens.length)} plays stored in this browser.` : 'Nothing stored yet.'
  const newest = listens.reduce((m, l) => Math.max(m, l.ts), 0)
  const key = [listens.length, newest, nowPlaying?.name, nowPlaying?.artist, period, artistImages.size, Math.floor(Date.now() / 300_000)].join('|')
  if (!force && key === drawnKey) return
  drawnKey = key
  const stats = computeStats(listens, undefined, { artistImages })
  stats.now_playing = nowPlaying
  renderProfile($('#profile'), stats, {
    name: 'you', avatar: 'you', period, emptyText: 'Connect a source or import a file and your stats show up here.',
    onPeriod: (p) => {
      period = p; store.set('lostfm.period', p)
      draw(true).then(() => document.querySelector(`[data-period="${p}"]`)?.focus())
    },
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
      setStatus('#spotify-status', `${connectedLabel()} · synced just now`, 'ok')
    } catch (e) { setStatus('#spotify-status', e.message, 'err'); renderSources() }
  }
  if (store.get('lostfm.inboxToken')) {
    try {
      np = np || await syncInbox()
      if (Date.now() > tokenMessageUntil) setStatus('#token-status', `Inbox checked ${ago(Number(store.get('lostfm.inboxLast')) / 1000)}`, 'ok')
    } catch (e) { tokenMessage(e.message, 'err'); renderSources() }
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
$('#own-app-redirect').textContent = REDIRECT
$('#own-app-form').addEventListener('submit', (ev) => {
  ev.preventDefault()
  const v = $('#own-app-input').value.trim().toLowerCase()
  if (!/^[0-9a-f]{32}$/.test(v)) return setStatus('#spotify-status', 'That doesn\'t look like a Client ID (32 letters and numbers).', 'err')
  if (v !== ownClientId() && store.get('lostfm.refresh')) forgetSpotify() // a login from another app can't be refreshed with this one
  if (!store.set('lostfm.clientId', v)) return setStatus('#spotify-status', STORAGE_BLOCKED, 'err')
  editingClientId = false
  setStatus('#spotify-status', 'Saved. Now click Connect Spotify.', 'ok')
  renderSources()
  $('#sp-on')?.focus()
})
$('#own-app-cancel').addEventListener('click', () => {
  editingClientId = false; $('#own-app-details').open = false; renderSources(); $('#sp-on')?.focus()
})
$('#export').addEventListener('click', async () => {
  const blob = new Blob([JSON.stringify({ lostfm: 1, listens: await allListens() })], { type: 'application/json' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'lostfm-listens.json' })
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
})
$('#wipe').addEventListener('click', async (ev) => {
  const b = ev.currentTarget
  if (!confirmClick(b, ' Click again: this can\'t be undone', ' Delete everything')) return
  await clearListens(); const tokenGone = await deleteToken(); forgetSpotify()
  store.set('lostfm.artistImages', null); artistImages = new Map()
  nowPlaying = null
  setStatus('#data-status', tokenGone
    ? 'Deleted. Spotify is disconnected and your scrobble token is gone.'
    : "Deleted your plays and disconnected Spotify, but couldn't reach lostfm to delete your scrobble token. Click Delete token to try again.", tokenGone ? 'ok' : 'err')
  renderSources(); draw(true)
})
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-copy]')
  if (!b) return
  const src = $(`#${b.dataset.copy}`)
  try { await navigator.clipboard.writeText(src.textContent); b.lastChild.textContent = ' Copied' } catch {
    // clipboard blocked: select the text so Cmd/Ctrl+C works
    const range = document.createRange(); range.selectNodeContents(src)
    getSelection().removeAllRanges(); getSelection().addRange(range)
    b.lastChild.textContent = ' Press ⌘C / Ctrl+C'
  }
  setTimeout(() => { b.lastChild.textContent = ' Copy' }, 1500)
})

document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.tip-btn')
  document.querySelectorAll('.tip[data-open]').forEach((t) => {
    if (!btn || t !== btn.parentElement) { delete t.dataset.open; t.querySelector('.tip-btn').setAttribute('aria-expanded', 'false') }
  })
  if (!btn) return
  const tip = btn.parentElement
  const open = !tip.hasAttribute('data-open')
  open ? (tip.dataset.open = '', delete tip.dataset.dismissed) : (delete tip.dataset.open, tip.dataset.dismissed = '')
  btn.setAttribute('aria-expanded', String(open))
})
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return
  document.querySelectorAll('.tip').forEach((t) => {
    if (t.matches(':hover, :focus-within, [data-open]')) { t.dataset.dismissed = ''; delete t.dataset.open; t.querySelector('.tip-btn').setAttribute('aria-expanded', 'false') }
  })
})
document.querySelectorAll('.tip').forEach((t) => {
  const reset = () => { if (!t.matches(':hover, :focus-within')) delete t.dataset.dismissed }
  t.addEventListener('mouseleave', reset)
  t.addEventListener('focusout', () => setTimeout(reset))
})

// existing connections from before bring-your-own-app were made with izie's app
if (store.get('lostfm.refresh') && !ownClientId() && !store.get('lostfm.legacyApp')) store.set('lostfm.legacyApp', '1')

;(async () => {
  renderSources()
  try { await finishLogin() } catch (e) { setStatus('#spotify-status', e.message, 'err') }
  renderSources()
  await draw(true)
  sync()
  setInterval(() => { if (!document.hidden) sync() }, SYNC_EVERY)
})()
