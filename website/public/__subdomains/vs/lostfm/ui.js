// Shared rendering for lostfm profiles (izie's page and your own). Everything from data is escaped,
// links and images go through the allowlists in lib.js.
import { safeImage } from './lib.js'

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
export const fmt = (n) => Number(n || 0).toLocaleString('en')
export const plays = (n) => `${fmt(n)} play${n === 1 ? '' : 's'}`

const PATHS = {
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
}
// brand marks are filled, not stroked
const FILLED = {
  spotify: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3.9Zm1.2-2.7a.8.8 0 0 1-1 .3c-2.7-1.7-6.9-2.2-10.2-1.2a.8.8 0 1 1-.4-1.5c3.7-1.1 8.4-.6 11.4 1.3.4.2.5.7.2 1.1Zm.1-2.8C14.7 9 9.4 8.8 6.3 9.7a.9.9 0 1 1-.5-1.8c3.5-1.1 9.4-.9 13.1 1.3a.9.9 0 0 1-1 1.7Z"/>',
  apple: '<path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.9-.8-3-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.6ZM14.1 5.6c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z"/>',
}
export function icon(name, label) {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'
  if (FILLED[name]) return `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" ${a11y}>${FILLED[name]}</svg>`
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${PATHS[name] || ''}</svg>`
}

// placeholder colour from the name, so the same artist always gets the same tile
function hue(s) {
  let h = 0
  for (const c of String(s)) h = (h * 31 + c.codePointAt(0)) >>> 0
  return h % 360
}
const ph = (s) => `--ph: hsl(${hue(s)} 45% 45%)`
const letter = (s) => esc([...String(s || '?').replace(/^the\s+/i, '').trim()][0]?.toUpperCase() || '?')

export function art(image, name, cls = 'art') {
  const src = safeImage(image)
  return `<span class="${cls}" style="${ph(name)}">${src ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : letter(name)}</span>`
}

// artist and song names open our own pages (Last.fm info + links to listen on Spotify / Apple Music)
const here = new URL('.', import.meta.url).pathname
const page = (kind, params) => `${here}${kind}/?${new URLSearchParams(params)}`
const linked = (text, _url, kind = 'track', artist = '') => {
  if (!text) return ''
  const href = kind === 'artist' ? page('artist', { name: text }) : kind === 'track' && artist ? page('track', { artist, name: text }) : ''
  return href ? `<a class="plain" href="${esc(href)}">${esc(text)}</a>` : esc(text)
}

export function ago(ts, now = Date.now() / 1000) {
  const s = Math.max(0, now - ts)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} day${s < 172800 ? '' : 's'} ago`
  return new Date(ts * 1000).toLocaleDateString('en', { day: 'numeric', month: 'short', year: s > 86400 * 300 ? 'numeric' : undefined })
}

function heatmap(daily) {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const start = new Date(+today - (52 * 7 + today.getUTCDay()) * 864e5)
  const max = Math.max(1, ...Object.values(daily || {}))
  let cells = ''
  for (let d = start; d <= today; d = new Date(+d + 864e5)) {
    const key = d.toISOString().slice(0, 10)
    const c = daily?.[key] || 0
    const lvl = c ? Math.min(4, 1 + Math.floor((c / max) * 3.999)) : 0
    cells += `<i title="${key}: ${c} play${c === 1 ? '' : 's'}" style="background:var(--heat${lvl})"></i>`
  }
  return `<div class="heat-wrap"><div class="heat" role="img" aria-label="plays per day over the last year">${cells}</div></div>
    <div class="legend">less <span class="sw">${[0, 1, 2, 3, 4].map((l) => `<i style="background:var(--heat${l})"></i>`).join('')}</span> more · one square per day (UTC)</div>`
}

const PERIODS = [['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['365d', 'Last year'], ['all', 'All time']]

function tiles(items, sub) {
  if (!items.length) return '<p class="empty">Nothing in this period.</p>'
  return `<ol class="tiles">${items.slice(0, 11).map((it, i) => {
    const src = safeImage(it.image)
    return `<li style="${ph(it.name)}">
      ${src ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="letter" aria-hidden="true">${letter(it.name)}</span>`}
      <span class="rank">#${i + 1}</span>
      <span class="cap"><b>${linked(it.name, it.url, it.artist === undefined ? 'artist' : 'album', it.artist)}</b><small>${sub(it)}</small></span>
    </li>`
  }).join('')}</ol>`
}

function topTracks(items) {
  if (!items.length) return '<p class="empty">Nothing in this period.</p>'
  const max = items[0].plays
  return `<ol class="rows">${items.slice(0, 15).map((t, i) => `<li>
    <span class="rank">${i + 1}</span>${art(t.image, t.artist)}
    <span class="text"><span class="name">${linked(t.name, t.url, 'track', t.artist)}</span><span class="by">${linked(t.artist, '', 'artist')}</span></span>
    <span class="plays"><span class="fill" style="width:${Math.max(6, (t.plays / max) * 100)}%"></span><span>${plays(t.plays)}</span></span>
  </li>`).join('')}</ol>`
}

function recentRows(stats, limit) {
  const np = stats.now_playing
  const rows = []
  if (np) {
    rows.push(`<li class="playing">${art(np.image, np.artist)}
      <span class="text"><span class="name">${linked(np.name, np.url, 'track', np.artist)}</span><span class="by">${linked(np.artist, '', 'artist')}</span></span>
      <time><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span> Scrobbling now</time></li>`)
  }
  for (const t of stats.recent.slice(0, limit)) {
    rows.push(`<li>${art(t.image, t.artist)}
      <span class="text"><span class="name">${linked(t.name, t.url, 'track', t.artist)}</span><span class="by">${linked(t.artist, '', 'artist')}</span></span>
      <time datetime="${new Date(t.ts * 1000).toISOString()}" title="${new Date(t.ts * 1000).toLocaleString('en')}">${ago(t.ts)}</time></li>`)
  }
  return `<ol class="rows no-rank">${rows.join('')}</ol>`
}

/**
 * Draws a whole profile into `el`.
 * opts: { name, avatar (text or image url), period, onPeriod(p), updated (bool: show "updated" time) }
 */
export function renderProfile(el, stats, opts) {
  if (!stats || !stats.total) {
    el.innerHTML = `<p class="empty">${esc(opts.emptyText || 'No listens yet.')}</p>`
    return
  }
  const period = stats.periods[opts.period] ? opts.period : '7d'
  const p = stats.periods[period]
  const recentLimit = opts.recentLimit || 10
  const since = stats.first ? new Date(stats.first * 1000).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const avatarImg = opts.avatarSrc || safeImage(opts.avatar) // avatarSrc: a file we host ourselves
  el.innerHTML = `
    <header class="profile">
      <div class="avatar" aria-hidden="true">${avatarImg ? `<img src="${esc(avatarImg)}" alt="">` : esc(opts.avatar || letter(opts.name))}</div>
      <div>
        <h1>${esc(opts.name)}</h1>
        <p class="since">${since ? `${icon('calendar')} scrobbling since ${esc(since)}` : ''}</p>
        <dl class="counts">
          <div><dt>Scrobbles</dt><dd>${fmt(stats.total)}</dd></div>
          <div><dt>Artists</dt><dd>${fmt(stats.artists)}</dd></div>
          <div><dt>Tracks</dt><dd>${fmt(stats.tracks)}</dd></div>
        </dl>
      </div>
    </header>

    <section aria-labelledby="h-recent">
      <div class="section-head"><h2 id="h-recent">${icon('clock')} Recent tracks</h2>
        ${opts.updated ? `<span class="muted">updated ${ago(stats.generated_at)}</span>` : ''}</div>
      ${recentRows(stats, recentLimit)}
      ${stats.recent.length > recentLimit ? `<button class="more" data-more>Show ${Math.min(50, stats.recent.length)} recent tracks</button>` : ''}
    </section>

    <div class="periods" role="group" aria-label="time period">
      ${PERIODS.map(([k, l]) => `<button data-period="${k}" aria-pressed="${k === period}">${l}</button>`).join('')}
    </div>

    <section aria-labelledby="h-artists">
      <div class="section-head"><h2 id="h-artists">${icon('mic')} Top artists</h2><span class="muted">${fmt(p.plays)} scrobble${p.plays === 1 ? '' : 's'}</span></div>
      ${tiles(p.artists, (a) => plays(a.plays))}
    </section>

    <section aria-labelledby="h-albums">
      <div class="section-head"><h2 id="h-albums">${icon('disc')} Top albums</h2></div>
      ${tiles(p.albums, (a) => `${esc(a.artist)} · ${plays(a.plays)}`)}
    </section>

    <section aria-labelledby="h-tracks">
      <div class="section-head"><h2 id="h-tracks">${icon('chart')} Top tracks</h2></div>
      ${topTracks(p.tracks)}
    </section>

    <section aria-labelledby="h-activity">
      <div class="section-head"><h2 id="h-activity">${icon('calendar')} Listening activity</h2></div>
      <div class="card">${heatmap(stats.daily)}</div>
    </section>`

  const heat = el.querySelector('.heat-wrap')
  if (heat) heat.scrollLeft = heat.scrollWidth
  el.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => opts.onPeriod(b.dataset.period)))
  el.querySelector('[data-more]')?.addEventListener('click', () => renderProfile(el, stats, { ...opts, recentLimit: 50 }))
}
