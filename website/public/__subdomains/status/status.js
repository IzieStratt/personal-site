// status.izie.top: draws /api/status (see status-core.js in the repo root)
const $ = (id) => document.getElementById(id)
const el = (tag, cls, text) => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = text
  return e
}
const DAY = 86400000
const STRIP_DAYS = 30
const MIN_WEEKS = 12
const STALE_MS = 15 * 60000 // the cron runs every 5 minutes; older than this means the checker itself stopped

let data = null
let selected = ''
let loadedAt = 0
let firstDraw = true
let newestCheck = 0 // when the cron last wrote results
let failedRefresh = false

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10)
const items = () => (data ? data.groups.flatMap((g) => g.items) : [])
const ids = () => items().map((i) => i.id) // only services that exist now (history may hold removed ones)

const worst = (states) => {
  const real = states.filter((s) => s !== 'unknown')
  if (!real.length) return 'unknown'
  return ['down', 'degraded', 'up'].find((w) => real.includes(w))
}

const ago = (ms) => {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (s < 90) return `${s}s ago`
  if (s < 5400) return `${Math.round(s / 60)}m ago`
  return `${Math.round(s / 3600)}h ago`
}

// a live count: 45s, 2m 14s, 1h 5m
const clock = (ms) => {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s ago`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ago`
}

// ok/total over the last `n` days for some ids, plus how many of those days have any data
function uptime(idList, n) {
  let ok = 0, total = 0
  const seen = new Set()
  const cutoff = isoDay(Date.now() - (n - 1) * DAY)
  for (const i of idList) for (const [day, [o, t]] of Object.entries(data.history[i] || {})) if (day >= cutoff) { ok += o; total += t; seen.add(day) }
  return { pct: total ? (ok / total) * 100 : null, days: seen.size }
}
const fmtPct = (p) => (p == null ? 'no data' : p === 100 ? '100%' : `${p.toFixed(p > 99 ? 2 : 1)}%`)
const level = (pct) => (pct == null ? 0 : pct === 100 ? 4 : pct >= 99 ? 3 : pct >= 95 ? 2 : 1)

function dayCell(idList, t) {
  const d = isoDay(t)
  let ok = 0, tot = 0
  for (const i of idList) { const v = data.history[i]?.[d]; if (v) { ok += v[0]; tot += v[1] } }
  const pct = tot ? (ok / tot) * 100 : null
  const cell = el('i', `cell l${level(pct)}`)
  const label = new Date(t).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
  cell.dataset.label = pct == null ? `${label}: no data` : `${label}: ${fmtPct(pct)} up (${ok}/${tot} checks)`
  cell.title = cell.dataset.label
  return cell
}

function label(i) {
  if (i.state === 'up') return null
  if (i.state === 'degraded') return 'slow or stale'
  if (i.state === 'down') return 'down'
  return /paused/.test(i.detail) ? 'paused' : 'no data'
}

function render() {
  const all = items()
  const overall = worst(all.map((i) => i.state))
  const banner = $('banner')
  banner.className = `banner ${overall}`
  const names = (state) => all.filter((i) => i.state === state).map((i) => i.name)
  const list = (arr) => (arr.length > 3 ? `${arr.slice(0, 3).join(', ')} +${arr.length - 3}` : arr.join(', '))
  const down = names('down'), slow = names('degraded')
  banner.textContent = down.length ? `down: ${list(down)}` : slow.length ? `slow or stale: ${list(slow)}` : overall === 'unknown' ? 'waiting for the first checks' : 'everything is up'

  newestCheck = Math.max(0, ...all.map((i) => i.checkedAt || 0))

  const root = $('groups')
  root.replaceChildren()
  for (const g of data.groups) {
    const sec = el('section', 'group')
    const h = el('h2')
    h.append(el('span', `dot ${worst(g.items.map((i) => i.state))}`), g.name)
    sec.append(h)
    const ul = el('ul', 'items')
    for (const i of g.items) {
      const li = el('li')
      li.append(el('span', `dot ${i.state}`), el('span', 'name', i.name))
      const strip = el('span', 'strip')
      strip.setAttribute('aria-hidden', 'true')
      const today = Date.parse(isoDay(Date.now()))
      for (let n = STRIP_DAYS - 1; n >= 0; n--) strip.append(dayCell([i.id], today - n * DAY))
      li.append(strip)
      const u = uptime([i.id], 90)
      li.append(el('span', 'pct', u.days < 2 ? 'new' : `${fmtPct(u.pct)} · ${u.days}d`))
      const p = el('p', 'detail')
      const l = label(i)
      if (l) p.append(el('b', `st ${i.state}`, l), ' · ')
      p.append(`${i.detail}${i.ms != null ? ` · ${i.ms}ms` : ''}`)
      li.append(p)
      ul.append(li)
    }
    sec.append(ul)
    root.append(sec)
  }

  const pickEl = $('pick')
  if (pickEl.options.length === 1) {
    for (const g of data.groups) {
      const og = document.createElement('optgroup')
      og.label = g.name
      for (const i of g.items) og.append(new Option(i.name, i.id))
      pickEl.append(og)
    }
  }
  $('graph-section').hidden = false
  drawGraph()

  const c = data.commit
  const foot = $('build')
  if (c?.sha) {
    foot.hidden = false
    foot.replaceChildren('site is at ')
    const a = el('a', null, c.sha.slice(0, 7))
    a.href = c.url
    foot.append(a, ` on main: ${c.message}`)
    if (c.date) { const t = el('span'); t.id = 'commit-age'; t.dataset.at = Date.parse(c.date); foot.append(' (', t, ')') }
  }
  paintTimes()
}

// relative times are repainted on their own every few seconds, so they keep moving between fetches
function paintTimes() {
  const u = $('updated')
  if (failedRefresh && loadedAt) u.textContent = `couldn't refresh, showing data from ${clock(loadedAt)}`
  else u.textContent = newestCheck ? `checked every 5 minutes, last ${clock(newestCheck)}` : ''
  const t = document.getElementById('commit-age')
  if (t) t.textContent = clock(Number(t.dataset.at))
}

function drawGraph() {
  const graph = $('graph')
  const months = $('months')
  graph.replaceChildren()
  months.replaceChildren()
  const idList = selected ? [selected] : ids()
  const today = Date.parse(isoDay(Date.now()))
  // start at the Sunday on or before the first day with any data, but always show at least MIN_WEEKS weeks
  const days = Object.values(data.history).flatMap((h) => Object.keys(h)).sort()
  const firstData = days.length ? Date.parse(days[0]) : today
  const minStart = today - (MIN_WEEKS * 7 - 1) * DAY
  const start0 = Math.max(Math.min(firstData, minStart), today - (data.days - 1) * DAY)
  const startOffset = new Date(start0).getUTCDay()
  const first = start0 - startOffset * DAY
  const count = Math.round((today - first) / DAY) + 1
  let lastMonth = -1
  let cols = 0
  for (let n = 0; n < count; n++) {
    const t = first + n * DAY
    graph.append(dayCell(idList, t))
    const col = Math.floor(n / 7)
    const d = new Date(t)
    if (d.getUTCMonth() !== lastMonth && d.getUTCDate() <= 7) {
      const s = el('span', null, d.toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short' }))
      s.style.left = `calc(${col} * (var(--size) + var(--gap)))`
      months.append(s)
      lastMonth = d.getUTCMonth()
    }
    cols = col + 1
  }
  months.style.width = `calc(${cols} * (var(--size) + var(--gap)))`
  const u = uptime(idList, data.days)
  const name = selected ? items().find((i) => i.id === selected)?.name : 'everything'
  const note = u.days < 2 ? `${name}: not enough history yet. each square is one day.` : `${name}: ${fmtPct(u.pct)} over the ${u.days} day${u.days > 1 ? 's' : ''} checked. each square is one day.`
  $('graph-note').textContent = note
  $('graph-note').dataset.default = note
  if (firstDraw) { graph.parentElement.scrollLeft = graph.parentElement.scrollWidth; firstDraw = false }
}

// one listener for hover (desktop) and tap (phones, where title tooltips never show)
const showCell = (e) => {
  const c = e.target.closest?.('.cell[data-label]')
  if (c) $('graph-note').textContent = c.dataset.label
}
$('graph').addEventListener('pointerover', showCell)
$('graph').addEventListener('click', showCell)
$('graph').addEventListener('pointerleave', () => { $('graph-note').textContent = $('graph-note').dataset.default || '' })
$('pick').addEventListener('change', (e) => { selected = e.target.value; if (data) drawGraph() })

function skeleton() {
  const root = $('groups')
  for (let g = 0; g < 3; g++) {
    const ul = el('ul', 'items')
    for (let r = 0; r < 3; r++) ul.append(el('li', 'skel'))
    root.append(ul)
  }
}

async function load() {
  try {
    const res = await fetch('/api/status')
    if (!res.ok) throw new Error(res.status)
    const next = await res.json()
    // if the cron stopped, old green results must not look current
    for (const g of next.groups) for (const i of g.items) {
      if (!i.checkedAt || Date.now() - i.checkedAt > STALE_MS) {
        i.detail = i.checkedAt ? `last check ${ago(i.checkedAt)}` : 'not checked yet'
        i.state = i.checkedAt ? 'degraded' : 'unknown'
        i.ms = null
      }
    }
    data = next
    loadedAt = Date.now()
    failedRefresh = false
    render()
  } catch {
    if (data) { failedRefresh = true; paintTimes() }
    else {
      $('groups').replaceChildren()
      $('banner').className = 'banner down'
      $('banner').textContent = "couldn't load the status (that's a status in itself)"
    }
  }
}
skeleton()
load()
setInterval(load, 30000) // the api is cached for 30s
setInterval(() => { if (data) paintTimes() }, 1000) // counts up every second without refetching
// background tabs throttle timers, so catch up the moment the tab is shown again
document.addEventListener('visibilitychange', () => { if (!document.hidden) load() })
