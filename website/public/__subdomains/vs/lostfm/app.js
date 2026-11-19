// izie's public profile: the snapshot music-stalker pushes every couple of minutes.
import { renderProfile } from './ui.js'

const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch {} },
}
const el = document.getElementById('profile')
let period = store.get('lostfm.period') || '7d'
let stats = null

function draw() {
  renderProfile(el, stats, {
    name: 'izie', avatar: 'iz', avatarSrc: 'avatar.jpg', period, updated: true, emptyText: 'No stats yet.',
    onPeriod: (p) => { period = p; store.set('lostfm.period', p); draw() },
  })
}

async function load() {
  try {
    const r = await fetch('api/stats', { cache: 'no-store' })
    stats = r.ok ? await r.json() : null
    draw()
  } catch {
    if (!stats) el.innerHTML = '<p class="empty err">Couldn\'t load stats. Try again in a bit.</p>'
  }
}

load()
setInterval(() => { if (!document.hidden) load() }, 60_000)
document.addEventListener('visibilitychange', () => { if (!document.hidden) load() })
