// Tag filter on the front page. The chips are links to the tag pages; here they become toggles that
// narrow the list to posts having every picked tag. The picks live in the url hash (#web,meta).
(() => {
  const toggle = document.getElementById('filter-toggle')
  const panel = document.getElementById('filter-panel')
  const list = document.getElementById('post-list')
  if (!toggle || !panel || !list) return
  const chips = [...panel.querySelectorAll('.tags a')]
  const items = [...list.children]
  const count = document.getElementById('filter-count')
  const clear = document.querySelector('.filter-clear')
  const label = toggle.querySelector('.label')
  const still = matchMedia('(prefers-reduced-motion: reduce)')
  const none = Object.assign(document.createElement('p'), { className: 'no-match', hidden: true, textContent: 'no posts have all of those tags.' })
  list.after(none)

  const tagOf = (a) => decodeURIComponent(a.getAttribute('href').split('/')[2])
  for (const li of items) li.dataset.tags = [...li.querySelectorAll('.tags a')].map(tagOf).join(' ')
  const on = new Set()

  function setOpen(open) {
    panel.dataset.open = String(open)
    toggle.setAttribute('aria-expanded', String(open))
    panel.inert = !open // closed chips leave the tab order
  }

  // posts that stop matching fade out and shrink; ones that start matching rise in
  function swap(li, visible, instant) {
    if (instant || still.matches || !li.isConnected) { li.hidden = !visible; return }
    li.getAnimations().forEach((a) => a.cancel())
    if (visible && li.hidden) {
      li.hidden = false
      li.animate([{ opacity: 0, transform: 'translateY(0.6rem) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' })
    } else if (!visible && !li.hidden) {
      li.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.97)' }], { duration: 160, easing: 'ease-in' }).onfinish = () => { li.hidden = true }
    }
  }

  function show(instant = false) {
    let shown = 0
    for (const li of items) {
      const mine = li.dataset.tags.split(' ')
      const match = [...on].every((t) => mine.includes(t))
      if (match) shown++
      swap(li, match, instant)
    }
    for (const a of chips) a.setAttribute('aria-pressed', String(on.has(tagOf(a))))
    none.hidden = shown > 0
    clear.hidden = on.size === 0
    label.textContent = on.size ? `filter (${on.size})` : 'filter'
    count.textContent = on.size ? `showing ${shown} of ${items.length} posts` : ''
  }

  const fromHash = () => {
    on.clear()
    for (const t of decodeURIComponent(location.hash.slice(1)).split(',')) if (t) on.add(t)
  }
  const toHash = () => history.replaceState(null, '', on.size ? `#${[...on].map(encodeURIComponent).join(',')}` : location.pathname)

  toggle.hidden = false
  toggle.addEventListener('click', () => setOpen(panel.dataset.open !== 'true'))
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setOpen(false); toggle.focus() }
  })
  for (const a of chips) {
    a.setAttribute('role', 'button')
    a.addEventListener('click', (e) => {
      e.preventDefault()
      const t = tagOf(a)
      on.has(t) ? on.delete(t) : on.add(t)
      toHash()
      show()
    })
    a.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); a.click() } })
  }
  clear.addEventListener('click', () => { on.clear(); toHash(); show() })
  addEventListener('hashchange', () => { fromHash(); setOpen(on.size > 0); show() })

  fromHash()
  panel.style.transition = 'none' // start closed without playing the close animation
  setOpen(on.size > 0)
  requestAnimationFrame(() => requestAnimationFrame(() => { panel.style.transition = '' }))
  show(true)
})()
