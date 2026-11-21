// The site's own dropdown (same look as the blog editor's): turns every <select data-fancy> into a button +
// listbox with arrow keys, Home/End, Enter/Space, Esc and Tab. The real <select> stays in the form, hidden and
// kept in sync, so form code reads .value and gets 'change' events as usual. Options added later are picked up.
(() => {
  const css = `
    .fdd { position: relative; }
    .fdd > button { box-sizing: border-box; width: 100%; text-align: left; padding: 0.4rem 2.2rem 0.4rem 0.9rem; position: relative;
      border: 2px solid var(--fg); border-radius: 0.75rem; background: var(--input-bg, transparent); color: var(--fg); font: inherit; cursor: pointer; }
    .fdd > button::after { content: ""; position: absolute; right: 0.9rem; top: 50%; width: 0.4rem; height: 0.4rem; border: solid currentColor;
      border-width: 0 1.5px 1.5px 0; transform: translateY(-70%) rotate(45deg); }
    .fdd > ul { position: absolute; top: calc(100% + 0.3rem); left: 0; right: 0; margin: 0; padding: 0.3rem; list-style: none; z-index: 20;
      box-sizing: border-box; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--bg); outline: none;
      box-shadow: 0 6px 24px rgb(0 0 0 / 0.12); max-height: 16rem; overflow-y: auto; }
    .fdd > ul[hidden] { display: none; }
    .fdd [role="option"] { padding: 0.35rem 0.6rem; border-radius: 0.4rem; cursor: pointer; font-size: 0.95rem; overflow-wrap: anywhere; }
    .fdd [role="option"].active { background: var(--card); }
    .fdd [role="option"][aria-selected="true"]::before { content: "• "; }
    select[data-fancy].fdd-native { display: none; }`
  let n = 0

  function upgrade(select) {
    if (select.dataset.fancyDone) return
    select.dataset.fancyDone = '1'
    const id = `fdd-${++n}`
    const box = document.createElement('div')
    box.className = 'fdd'
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('aria-haspopup', 'listbox')
    button.setAttribute('aria-expanded', 'false')
    const list = document.createElement('ul')
    list.setAttribute('role', 'listbox')
    list.tabIndex = -1
    list.hidden = true
    list.id = `${id}-list`
    // keep the select's label pointing at something focusable
    const label = select.closest('label')
    if (label) {
      const text = label.querySelector('span')
      if (text) { text.id ||= `${id}-label`; button.setAttribute('aria-labelledby', `${text.id} ${id}-btn`); list.setAttribute('aria-labelledby', text.id) }
    }
    button.id = `${id}-btn`
    box.append(button, list)
    select.classList.add('fdd-native')
    select.after(box)
    let options = []
    let active = 0

    const sync = () => {
      const i = Math.max(0, select.selectedIndex)
      button.textContent = select.options[i]?.textContent ?? ''
      options.forEach((o, k) => o.setAttribute('aria-selected', String(k === i)))
    }
    const build = () => {
      options = [...select.options].map((opt, k) => {
        const li = document.createElement('li')
        li.setAttribute('role', 'option')
        li.id = `${id}-o${k}`
        li.textContent = opt.textContent
        return li
      })
      list.replaceChildren(...options)
      sync()
    }
    const highlight = (i) => {
      if (!options.length) return
      active = (i + options.length) % options.length
      options.forEach((o, k) => o.classList.toggle('active', k === active))
      list.setAttribute('aria-activedescendant', options[active].id)
      options[active].scrollIntoView({ block: 'nearest' })
    }
    const open = () => {
      list.hidden = false
      button.setAttribute('aria-expanded', 'true')
      highlight(Math.max(0, select.selectedIndex))
      list.focus()
    }
    const close = (refocus = true) => {
      list.hidden = true
      button.setAttribute('aria-expanded', 'false')
      if (refocus) button.focus()
    }
    const choose = (i) => {
      close()
      if (i === select.selectedIndex) return
      select.selectedIndex = i
      sync()
      select.dispatchEvent(new Event('change', { bubbles: true }))
      select.dispatchEvent(new Event('input', { bubbles: true }))
    }

    button.addEventListener('click', () => (list.hidden ? open() : close()))
    button.addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open() } })
    list.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: () => highlight(active + 1), ArrowUp: () => highlight(active - 1), Home: () => highlight(0), End: () => highlight(options.length - 1),
        Enter: () => choose(active), ' ': () => choose(active), Escape: () => close(), Tab: () => close(false) }
      if (keys[e.key]) { if (e.key !== 'Tab') e.preventDefault(); keys[e.key]() }
    })
    list.addEventListener('click', (e) => { const i = options.indexOf(e.target.closest('[role=option]')); if (i >= 0) choose(i) })
    list.addEventListener('mousemove', (e) => { const i = options.indexOf(e.target.closest('[role=option]')); if (i >= 0 && i !== active) highlight(i) })
    document.addEventListener('click', (e) => { if (!list.hidden && !box.contains(e.target)) close(false) })
    select.addEventListener('change', sync)
    // options rewritten by page code (e.g. the comment domain picker) rebuild the list
    new MutationObserver(build).observe(select, { childList: true, subtree: true, characterData: true })
    // .value set from code doesn't fire change; keep the button honest
    const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')
    Object.defineProperty(select, 'value', { get: () => desc.get.call(select), set: (v) => { desc.set.call(select, v); sync() } })
    build()
  }

  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  const scan = (root) => root.querySelectorAll?.('select[data-fancy]').forEach(upgrade)
  const start = () => {
    scan(document)
    new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((node) => {
      if (node.matches?.('select[data-fancy]')) upgrade(node)
      else scan(node)
    }))).observe(document.body, { childList: true, subtree: true })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
