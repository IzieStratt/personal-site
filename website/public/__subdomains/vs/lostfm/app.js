// lostfm: renders stats in the shape music-stalker's SpotifyScrobbler.stats() makes.
// "izie's listening" fetches that snapshot; "your own" builds the same shape from listens kept in IndexedDB.
import { computeStats, parseImport, spotifyItemsToListens } from './lib.js'

const CLIENT_ID = '0548030654df4cfda630057b3ec8bc6e'
const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, '')
const SCOPES = 'user-read-currently-playing user-read-recently-played'
const $ = (s) => document.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const safeUrl = (u) => (/^https:\/\//.test(u || '') ? u : '')
const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} },
}

let period = store.get('lostfm.period') || '7d'
let view = 'izie'
let lastStats = null
let syncTimer = null

// ---------- rendering ----------
const fmt = (n) => Number(n || 0).toLocaleString()
function ago(ts) {
  const s = Math.max(0, Date.now() / 1000 - ts)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`
  return new Date(ts * 1000).toLocaleDateString()
}

function topList(rows, label) {
  if (!rows?.length) return `<p class="muted">nothing yet</p>`
  const max = rows[0].at(-1)
  return `<ol class="top">${rows.map((r) => {
    const c = r.at(-1)
    const main = esc(r[0])
    const sub = r.length === 3 ? ` <small>${esc(r[1])}</small>` : ''
    return `<li><div class="fill" style="width:${(c / max) * 100}%"></div><span title="${esc(r[0])}">${main}${sub}</span><span class="c">${fmt(c)}</span></li>`
  }).join('')}</ol>`.replace('<ol', `<ol aria-label="${esc(label)}"`)
}

function heatmap(daily) {
  const days = 53 * 7
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const start = new Date(today - (days - 1 - (6 - today.getUTCDay())) * 864e5)
  const counts = Object.values(daily || {})
  const max = Math.max(1, ...counts)
  let cells = ''
  for (let d = new Date(start); d <= today; d = new Date(+d + 864e5)) {
    const key = d.toISOString().slice(0, 10)
    const c = daily?.[key] || 0
    const lvl = c ? Math.min(4, 1 + Math.floor((c / max) * 3.999)) : 0
    cells += `<i title="${key}: ${c} plays" style="background:var(--heat${lvl})"></i>`
  }
  return `<div class="heat">${cells}</div><div class="legend">last year, one square per day (UTC)</div>`
}

function render(st, who) {
  lastStats = st
  const el = $('#stats')
  if (!st || !st.total) {
    el.innerHTML = `<div class="card"><p class="muted">${who === 'izie' ? 'no stats yet.' : 'no listens yet. connect spotify or import a last.fm export.'}</p></div>`
    return
  }
  const p = st.periods[period] || st.periods['7d']
  const np = st.now_playing
  const nowHtml = np
    ? `<div class="card now"><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span>now playing: ${safeUrl(np.url) ? `<a href="${esc(np.url)}" rel="noopener" target="_blank">${esc(np.name)}</a>` : esc(np.name)} <span class="muted">by ${esc(np.artist)}</span></span></div>`
    : ''
  const periods = [['7d', 'week'], ['30d', 'month'], ['365d', 'year'], ['all', 'all time']]
  el.innerHTML = `
    ${nowHtml}
    <div class="card nums">
      <div class="num"><b>${fmt(st.total)}</b><span>plays ever</span></div>
      <div class="num"><b>${fmt(st.periods['7d'].plays)}</b><span>this week</span></div>
      <div class="num"><b>${fmt(st.periods['30d'].plays)}</b><span>this month</span></div>
      <div class="num"><b>${st.first ? new Date(st.first * 1000).getFullYear() : '–'}</b><span>listening since</span></div>
    </div>
    <div class="card">${heatmap(st.daily)}</div>
    <div class="periods">${periods.map(([k, l]) => `<button data-period="${k}" aria-pressed="${k === period}">${l}</button>`).join('')}
      <span class="muted" style="align-self:center">${fmt(p.plays)} plays</span></div>
    <div class="grid">
      <div class="card"><h2>top artists</h2>${topList(p.artists, 'top artists')}</div>
      <div class="card"><h2>top tracks</h2>${topList(p.tracks, 'top tracks')}</div>
      <div class="card"><h2>top albums</h2>${topList(p.albums, 'top albums')}</div>
    </div>
    <div class="card"><h2>recent</h2><ul class="recent">${st.recent.map((t) => `<li><span>${safeUrl(t.url) ? `<a href="${esc(t.url)}" rel="noopener" target="_blank">${esc(t.name)}</a>` : esc(t.name)} <span class="muted">· ${esc(t.artist)}</span></span><time datetime="${new Date(t.ts * 1000).toISOString()}">${ago(t.ts)}</time></li>`).join('')}</ul></div>
    ${who === 'izie' ? `<p class="muted">updated ${ago(st.generated_at)}</p>` : ''}`
  const heat = el.querySelector('.heat')
  if (heat) heat.scrollLeft = heat.scrollWidth
  el.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => {
    period = b.dataset.period
    store.set('lostfm.period', period)
    render(lastStats, who)
  }))
}

// ---------- izie ----------
async function loadIzie() {
  try {
    const r = await fetch('api/stats', { cache: 'no-store' })
    if (view !== 'izie') return
    render(r.ok ? await r.json() : null, 'izie')
  } catch {
    if (view === 'izie') $('#stats').innerHTML = `<div class="card err">couldn't load stats.</div>`
  }
}

// ---------- your own: IndexedDB ----------
function db() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('lostfm', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('listens', { keyPath: 'id' })
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}
async function putListens(rows) {
  const d = await db()
  const before = (await allListens()).length
  await new Promise((res, rej) => {
    const tx = d.transaction('listens', 'readwrite')
    const os = tx.objectStore('listens')
    rows.forEach((r) => os.put(r))
    tx.oncomplete = res
    tx.onerror = () => rej(tx.error)
  })
  return (await allListens()).length - before
}
async function allListens() {
  const d = await db()
  return new Promise((res, rej) => {
    const req = d.transaction('listens').objectStore('listens').getAll()
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}
async function clearListens() {
  const d = await db()
  await new Promise((res) => { const tx = d.transaction('listens', 'readwrite'); tx.objectStore('listens').clear(); tx.oncomplete = res })
}

// ---------- your own: Spotify PKCE ----------
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
async function login() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)))
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)))
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  store.set('lostfm.verifier', verifier)
  store.set('lostfm.state', state)
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
  if (!r.ok) throw new Error(body.error_description || body.error || `spotify said ${r.status}`)
  store.set('lostfm.access', body.access_token)
  store.set('lostfm.expires', String(Date.now() + (body.expires_in - 60) * 1000))
  if (body.refresh_token) store.set('lostfm.refresh', body.refresh_token)
}
async function finishLogin() {
  const q = new URLSearchParams(location.search)
  if (!q.has('code') && !q.has('error')) return false
  history.replaceState(null, '', REDIRECT)
  if (q.get('error')) throw new Error(`spotify login: ${q.get('error')}`)
  if (q.get('state') !== store.get('lostfm.state')) throw new Error('login state mismatch, try again')
  await tokenRequest({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: REDIRECT, code_verifier: store.get('lostfm.verifier') })
  store.set('lostfm.verifier', null); store.set('lostfm.state', null)
  return true
}
async function accessToken() {
  if (store.get('lostfm.access') && Date.now() < Number(store.get('lostfm.expires'))) return store.get('lostfm.access')
  if (!store.get('lostfm.refresh')) return null
  await tokenRequest({ grant_type: 'refresh_token', refresh_token: store.get('lostfm.refresh') })
  return store.get('lostfm.access')
}
async function spotify(path) {
  const t = await accessToken()
  if (!t) throw new Error('not connected')
  const r = await fetch(`https://api.spotify.com/v1${path}`, { headers: { authorization: `Bearer ${t}` } })
  if (r.status === 204) return null
  if (r.status === 403) throw new Error("spotify won't let this account in yet: ask izie to add you to the app")
  if (!r.ok) throw new Error(`spotify said ${r.status}`)
  return r.json()
}
let myNowPlaying = null
async function sync() {
  const recent = await spotify('/me/player/recently-played?limit=50')
  await putListens(spotifyItemsToListens(recent?.items || []))
  const cur = await spotify('/me/player/currently-playing')
  const it = cur?.is_playing && cur.currently_playing_type === 'track' ? cur.item : null
  myNowPlaying = it ? { name: it.name, artist: it.artists.map((a) => a.name).join(', '), album: it.album?.name || '', url: it.external_urls?.spotify || '' } : null
  store.set('lostfm.lastsync', String(Date.now()))
}

// ---------- your own: UI ----------
function showError(e) {
  const el = $('#me-error')
  el.hidden = !e
  el.textContent = e ? String(e.message || e) : ''
}
async function renderMe() {
  const connected = !!store.get('lostfm.refresh')
  const actions = $('#me-actions')
  actions.innerHTML = `
    ${connected ? '<button id="sync">sync now</button>' : '<button id="connect">connect spotify</button>'}
    <label class="btn" for="import">import last.fm export</label><input id="import" type="file" accept=".csv,.json,application/json,text/csv">
    <button id="export">download my data</button>
    ${connected ? '<button id="disconnect">disconnect</button>' : ''}
    <button id="wipe">delete my data</button>
    <span class="muted" id="me-status"></span>`
  $('#connect')?.addEventListener('click', login)
  $('#sync')?.addEventListener('click', () => runSync(true))
  $('#disconnect')?.addEventListener('click', () => {
    ['access', 'expires', 'refresh', 'lastsync'].forEach((k) => store.set(`lostfm.${k}`, null))
    clearInterval(syncTimer); myNowPlaying = null; renderMe()
  })
  $('#wipe').addEventListener('click', async () => {
    if ($('#wipe').dataset.armed !== '1') { $('#wipe').dataset.armed = '1'; $('#wipe').textContent = 'click again to delete everything'; return }
    await clearListens(); renderMe()
  })
  $('#export').addEventListener('click', async () => {
    const blob = new Blob([JSON.stringify({ lostfm: 1, listens: await allListens() })], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'lostfm-listens.json' })
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  })
  $('#import').addEventListener('change', async (ev) => {
    const f = ev.target.files[0]
    if (!f) return
    try {
      $('#me-status').textContent = 'importing…'
      const rows = parseImport(await f.text())
      const added = await putListens(rows)
      $('#me-status').textContent = `imported ${fmt(added)} new plays (${fmt(rows.length)} in file)`
      showError(null)
      drawMe()
    } catch (e) { showError(e); $('#me-status').textContent = '' }
    ev.target.value = ''
  })
  drawMe()
}
async function drawMe() {
  if (view !== 'me') return
  const st = computeStats(await allListens())
  st.now_playing = myNowPlaying
  render(st, 'me')
  const last = Number(store.get('lostfm.lastsync'))
  if (last && $('#me-status') && !$('#me-status').textContent.startsWith('imported')) $('#me-status').textContent = `synced ${ago(last / 1000)}`
}
async function runSync(manual) {
  if (!store.get('lostfm.refresh')) return
  try {
    if (manual) $('#me-status').textContent = 'syncing…'
    await sync(); showError(null)
  } catch (e) { showError(e) }
  if ($('#me-status')?.textContent === 'syncing…') $('#me-status').textContent = ''
  drawMe()
}

function setView(v) {
  view = v
  $('#tab-izie').setAttribute('aria-pressed', v === 'izie')
  $('#tab-me').setAttribute('aria-pressed', v === 'me')
  $('#me-panel').hidden = v !== 'me'
  store.set('lostfm.view', v)
  clearInterval(syncTimer)
  if (v === 'izie') { loadIzie(); syncTimer = setInterval(loadIzie, 60_000) }
  else { renderMe(); runSync(); syncTimer = setInterval(runSync, 60_000) }
}

$('#tab-izie').addEventListener('click', () => setView('izie'))
$('#tab-me').addEventListener('click', () => setView('me'))

;(async () => {
  let start = store.get('lostfm.view') === 'me' ? 'me' : 'izie'
  try { if (await finishLogin()) start = 'me' } catch (e) { start = 'me'; setTimeout(() => showError(e)) }
  setView(start)
})()
