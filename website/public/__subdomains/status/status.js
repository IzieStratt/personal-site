// status.izie.top: draws /api/status (see status-core.js in the repo root)
const $ = (id) => document.getElementById(id)
const el = (tag, cls, text) => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = text
  return e
}
const LABEL = { up: 'operational', degraded: 'degraded', down: 'down', unknown: 'no data yet' }
const WORST = ['down', 'degraded', 'up'] // unknown never beats a real state

let data = null
let selected = ''

const worst = (states) => {
  const real = states.filter((s) => s !== 'unknown')
  if (!real.length) return 'unknown'
  return WORST.find((w) => real.includes(w))
}

const ago = (ms) => {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (s < 90) return `${s}s ago`
  if (s < 5400) return `${Math.round(s / 60)}m ago`
  return `${Math.round(s / 3600)}h ago`
}

// uptime over the last `n` days for one id, or for everything when id is ''
function uptime(id, n) {
  let ok = 0, total = 0
  const ids = id ? [id] : Object.keys(data.history)
  const cutoff = isoDay(Date.now() - (n - 1) * 86400000)
  for (const i of ids) for (const [day, [o, t]] of Object.entries(data.history[i] || {})) if (day >= cutoff) { ok += o; total += t }
  return total ? (ok / total) * 100 : null
}
const fmtPct = (p) => (p == null ? 'no data' : p === 100 ? '100%' : `${p.toFixed(p > 99 ? 2 : 1)}%`)
const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10)

function render() {
  const all = data.groups.flatMap((g) => g.items)
  const overall = worst(all.map((i) => i.state))
  const banner = $('banner')
  banner.className = `banner ${overall}`
  const downs = all.filter((i) => i.state === 'down').length
  banner.textContent = overall === 'up' ? 'everything is up' : overall === 'unknown' ? 'waiting for the first checks' : downs ? `${downs} thing${downs > 1 ? 's' : ''} down` : 'some things are slow or stalled'
  const newest = Math.max(0, ...all.map((i) => i.checkedAt || 0))
  $('updated').textContent = newest ? `checked every 5 minutes, last ${ago(newest)}` : ''

  const root = $('groups')
  root.replaceChildren()
  for (const g of data.groups) {
    const sec = el('section', 'group')
    const h = el('h2')
    h.append(el('span', `dot ${worst(g.items.map((i) => i.state))}`), g.name)
    sec.append(h)
    const ul = el('ul', 'items')
    for (const i of g.items) {
      const li = el('li', i.id === selected ? 'selected' : '')
      li.tabIndex = 0
      li.title = 'show this one in the graph'
      li.append(el('span', `dot ${i.state}`), el('span', 'name', i.name), el('span', 'pct', `${fmtPct(uptime(i.id, 90))} · 90d`))
      li.append(el('p', 'detail', `${LABEL[i.state]}${i.detail ? ` · ${i.detail}` : ''}${i.ms != null ? ` · ${i.ms}ms` : ''}`))
      const pick = () => { selected = selected === i.id ? '' : i.id; $('pick').value = selected; render() }
      li.addEventListener('click', pick)
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick() } })
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
  drawGraph()
  const c = data.commit
  const foot = $('build')
  if (c?.sha) {
    foot.hidden = false
    foot.replaceChildren('site is at ')
    const a = el('a', null, c.sha.slice(0, 7))
    a.href = c.url
    foot.append(a, ` on main: ${c.message}${c.date ? ` (${ago(Date.parse(c.date))})` : ''}`)
  }
}

function drawGraph() {
  const graph = $('graph')
  const months = $('months')
  graph.replaceChildren()
  months.replaceChildren()
  const ids = selected ? [selected] : Object.keys(data.history)
  const day0 = Date.parse(isoDay(Date.now()))
  const first = day0 - (data.days - 1) * 86400000
  const startOffset = new Date(first).getUTCDay() // pad so rows are Sun..Sat
  let cols = 0
  for (let n = 0; n < startOffset; n++) graph.append(el('i', 'cell future'))
  let lastMonth = -1
  for (let n = 0; n < data.days; n++) {
    const t = first + n * 86400000
    const d = isoDay(t)
    let ok = 0, tot = 0
    for (const i of ids) { const v = data.history[i]?.[d]; if (v) { ok += v[0]; tot += v[1] } }
    const pct = tot ? (ok / tot) * 100 : null
    const cell = el('i', `cell l${pct == null ? 0 : pct === 100 ? 4 : pct >= 99 ? 3 : pct >= 95 ? 2 : 1}`)
    const label = new Date(t).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
    cell.title = pct == null ? `${label}: no data` : `${label}: ${fmtPct(pct)} up (${ok}/${tot} checks)`
    graph.append(cell)
    const col = Math.floor((startOffset + n) / 7)
    const m = new Date(t).getUTCMonth()
    if (m !== lastMonth && new Date(t).getUTCDate() <= 7) {
      const s = el('span', null, new Date(t).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short' }))
      s.style.left = `calc(${col} * (var(--size) + var(--gap)))`
      months.append(s)
      lastMonth = m
    }
    cols = col + 1
  }
  months.style.width = `calc(${cols} * (var(--size) + var(--gap)))`
  const p = uptime(selected, data.days)
  const name = selected ? data.groups.flatMap((g) => g.items).find((i) => i.id === selected)?.name : 'everything'
  $('graph-note').textContent = `${name}: ${fmtPct(p)} over the past year. each square is one day; hover for the number. click a service above to graph just that one.`
  graph.parentElement.scrollLeft = graph.parentElement.scrollWidth
}

$('pick').addEventListener('change', (e) => { selected = e.target.value; render() })

async function load() {
  try {
    const res = await fetch('/api/status')
    if (!res.ok) throw new Error(res.status)
    data = await res.json()
    // if the cron stopped, old green results must not look current
    for (const g of data.groups) for (const i of g.items) {
      if (!i.checkedAt || Date.now() - i.checkedAt > 15 * 60000) { i.state = 'unknown'; i.detail = 'no recent check' }
    }
    render()
  } catch {
    $('banner').className = 'banner down'
    $('banner').textContent = "couldn't load the status (that's a status in itself)"
  }
}
load()
setInterval(load, 60000)
