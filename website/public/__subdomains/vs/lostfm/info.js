// Artist and song pages: /lostfm/artist/?name=X and /lostfm/track/?artist=X&name=Y.
// Info comes from our own /lostfm/api/info (Last.fm page data + Spotify / Apple Music links).
import { esc, icon, art } from './ui.js'
import { safeLink } from './lib.js'

const type = document.body.dataset.type
const q = new URLSearchParams(location.search)
const artist = (type === 'track' ? q.get('artist') : q.get('name')) || ''
const name = type === 'track' ? q.get('name') || '' : artist
const el = document.getElementById('info')

const listen = (href, label, ic) => {
  const u = safeLink(href)
  return u ? `<a class="btn" href="${esc(u)}" rel="noopener noreferrer" target="_blank">${icon(ic)} ${label}</a>` : ''
}

function draw(d) {
  const links = [listen(d.spotify, 'Listen on Spotify', 'spotify'), listen(d.apple, 'Listen on Apple Music', 'apple'), listen(d.lastfm, 'View on Last.fm', 'link')].join('')
  const byline = type === 'track' ? `<p class="since">by <a class="plain" href="../artist/?name=${encodeURIComponent(artist)}">${esc(artist)}</a></p>` : ''
  el.innerHTML = `
    <header class="profile">
      ${art(d.image, name, 'avatar')}
      <div><h1>${esc(name)}</h1>${byline}
        ${d.tags?.length ? `<p class="since">${d.tags.map(esc).join(' · ')}</p>` : ''}</div>
    </header>
    ${d.summary ? `<section class="card"><p>${esc(d.summary)}</p></section>` : ''}
    <section aria-labelledby="h-listen">
      <div class="section-head"><h2 id="h-listen">${icon('music')} Listen</h2></div>
      ${links ? `<div class="nav">${links}</div>` : '<p class="empty">No listening links found.</p>'}
    </section>`
}

async function load() {
  if (!artist || !name) { el.innerHTML = '<p class="empty">Nothing here.</p>'; return }
  document.title = `${name} · lostfm`
  try {
    const r = await fetch(`../api/info?${new URLSearchParams({ type, artist, name })}`)
    if (!r.ok) throw new Error(String(r.status))
    draw(await r.json())
  } catch {
    el.innerHTML = '<p class="empty err">Couldn\'t load this. Try again in a bit.</p>'
  }
}
load()
