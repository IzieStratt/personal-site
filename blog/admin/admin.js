const $ = (id) => document.getElementById(id)
const state = { slug: new URLSearchParams(location.search).get('post') || 'new' }

async function api(method, url, body, raw) {
  const res = await fetch(url, {
    method,
    headers: { 'x-blog': '1', ...(body && !raw ? { 'content-type': 'application/json' } : {}) },
    body: body ? (raw ? body : JSON.stringify(body)) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

const nowLocal = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function status(msg, bad) {
  const el = $('status')
  el.className = bad ? 'bad' : ''
  el.replaceChildren(typeof msg === 'string' ? document.createTextNode(msg) : msg)
}

function fill(p) {
  state.slug = p.slug || 'new'
  $('title').value = p.title || ''
  $('tags').value = (p.tags || []).join(', ')
  $('date').value = (p.date || nowLocal()).slice(0, 16)
  $('body').value = p.body || ''
  $('draft').checked = !!p.draft
  $('delete').hidden = state.slug === 'new'
  $('view').hidden = state.slug === 'new'
  $('view').href = `/post/${state.slug}/`
}

async function loadList() {
  const posts = await api('GET', '/api/posts')
  const tags = new Set(posts.flatMap((p) => p.tags))
  $('known-tags').replaceChildren(...[...tags].map((t) => Object.assign(document.createElement('option'), { value: t })))
  $('posts').replaceChildren(...posts.map((p) => {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = `?post=${p.slug}`
    a.textContent = p.title
    if (p.draft) a.className = 'draft'
    const time = document.createElement('time')
    time.textContent = p.date.slice(0, 10)
    li.append(time, a)
    return li
  }))
}

async function save(e) {
  e?.preventDefault()
  $('save').disabled = true
  status('saving, and archiving any new links (can take a few seconds)...')
  try {
    const r = await api('PUT', `/api/posts/${state.slug}`, {
      title: $('title').value, tags: $('tags').value, date: $('date').value,
      draft: $('draft').checked, body: $('body').value, refresh: $('refresh').checked,
    })
    $('refresh').checked = false
    if (state.slug === 'new') history.replaceState(null, '', `?post=${r.slug}`)
    state.slug = r.slug
    $('delete').hidden = false
    $('view').hidden = false
    $('view').href = `/post/${r.slug}/`
    const out = document.createElement('div')
    out.append('saved and built.')
    const lines = [
      ...r.archived.made.map((a) => `archived ${a.url} (${a.files} file${a.files === 1 ? '' : 's'}${a.skipped ? `, ${a.skipped} skipped` : ''})`),
      ...r.archived.failed.map((a) => `couldn't archive ${a.url}: ${a.error}`),
    ]
    if (lines.length) {
      const ul = document.createElement('ul')
      ul.append(...lines.map((t) => Object.assign(document.createElement('li'), { textContent: t })))
      out.append(ul)
    }
    status(out, r.archived.failed.length > 0)
    loadList()
  } catch (err) {
    status(err.message, true)
  } finally {
    $('save').disabled = false
  }
}

async function attach(files) {
  const ta = $('body')
  for (const file of files) {
    status(`uploading ${file.name}...`)
    try {
      const r = await api('POST', `/api/upload?name=${encodeURIComponent(file.name)}`, file, true)
      const at = ta.selectionEnd ?? ta.value.length
      const text = `${at && ta.value[at - 1] !== '\n' ? '\n\n' : ''}${r.markdown}\n\n`
      ta.setRangeText(text, at, at, 'end')
      status(`attached ${r.name}`)
    } catch (err) {
      status(`${file.name}: ${err.message}`, true)
    }
  }
}

$('form').addEventListener('submit', save)
$('attach').addEventListener('click', () => $('file').click())
$('file').addEventListener('change', (e) => { attach([...e.target.files]); e.target.value = '' })
$('body').addEventListener('paste', (e) => {
  const files = [...e.clipboardData.files]
  if (files.length) { e.preventDefault(); attach(files.map((f, i) => (f.name === 'image.png' ? new File([f], `pasted-${Date.now()}-${i}.png`, { type: f.type }) : f))) }
})
for (const ev of ['dragenter', 'dragover']) $('body').addEventListener(ev, (e) => { e.preventDefault(); $('body').classList.add('drop') })
for (const ev of ['dragleave', 'drop']) $('body').addEventListener(ev, () => $('body').classList.remove('drop'))
$('body').addEventListener('drop', (e) => { e.preventDefault(); attach([...e.dataTransfer.files]) })
document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') save(e) })
$('delete').addEventListener('click', async () => {
  if (!confirm(`delete "${$('title').value}"? (the md file only; attached files and archives stay in /cdn)`)) return
  await api('DELETE', `/api/posts/${state.slug}`)
  location.href = '/admin/'
})

;(async () => {
  await loadList()
  fill(state.slug === 'new' ? {} : await api('GET', `/api/posts/${state.slug}`).catch((e) => (status(e.message, true), {})))
})()

// comments: held ones first, then everything else. emails are shown here only, never on the site.
async function loadComments() {
  const note = $('comments-status')
  try {
    pick((await api('GET', '/api/moderation/mode')).mode)
    const rows = await api('GET', '/api/moderation/comments')
    rows.sort((a, b) => (b.status === 'pending') - (a.status === 'pending'))
    note.textContent = rows.length ? `${rows.filter((c) => c.status === 'pending').length} waiting for you` : 'no comments yet'
    $('moderation').replaceChildren(...rows.map((c) => {
      const li = document.createElement('li')
      li.className = c.status
      const meta = document.createElement('p')
      meta.className = 'meta'
      meta.textContent = `${c.name} · ${c.site || c.email} · ${c.created.slice(0, 10)} · on ${c.post} · ${c.status}${c.parent ? ' · a reply' : ''}`
      const body = document.createElement('p')
      body.className = 'body'
      body.textContent = c.body
      const actions = document.createElement('div')
      actions.className = 'actions'
      const act = (label, fn) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.textContent = label
        b.addEventListener('click', async () => {
          b.disabled = true
          try { await fn(); await loadComments() } catch (e) { note.textContent = e.message; b.disabled = false }
        })
        actions.append(b)
      }
      if (c.status !== 'approved') act('approve', () => api('PUT', `/api/moderation/comments/${c.id}`, { status: 'approved' }))
      if (c.status !== 'hidden') act('hide', () => api('PUT', `/api/moderation/comments/${c.id}`, { status: 'hidden' }))
      act('delete', () => confirm('delete this comment and its replies?') ? api('DELETE', `/api/moderation/comments/${c.id}`) : null)
      const post = document.createElement('a')
      post.href = `/post/${c.post}/`
      post.target = '_blank'
      post.textContent = 'view post'
      actions.append(post)
      li.append(meta, body, actions)
      return li
    }))
  } catch (e) {
    note.textContent = `couldn't load comments: ${e.message}`
  }
}

// a dropdown of our own (the native one pops open at the wrong size): button + listbox, arrow keys, Esc to close
const dd = { button: $('mode'), list: $('mode-list'), options: [...$('mode-list').children], value: 'review', active: 0 }

function pick(value) {
  const i = Math.max(0, dd.options.findIndex((o) => o.dataset.value === value))
  dd.value = dd.options[i].dataset.value
  dd.button.textContent = dd.options[i].textContent
  for (const o of dd.options) o.setAttribute('aria-selected', String(o === dd.options[i]))
}

function highlight(i) {
  dd.active = (i + dd.options.length) % dd.options.length
  dd.options.forEach((o, n) => o.classList.toggle('active', n === dd.active))
  dd.list.setAttribute('aria-activedescendant', dd.options[dd.active].id)
}

function openMenu() {
  dd.list.hidden = false
  dd.button.setAttribute('aria-expanded', 'true')
  highlight(dd.options.findIndex((o) => o.dataset.value === dd.value))
  dd.list.focus()
}

function closeMenu(refocus = true) {
  dd.list.hidden = true
  dd.button.setAttribute('aria-expanded', 'false')
  if (refocus) dd.button.focus()
}

async function choose(i) {
  closeMenu()
  const value = dd.options[i].dataset.value
  if (value === dd.value) return
  const before = dd.value
  pick(value)
  try { await api('PUT', '/api/moderation/mode', { mode: value }); $('comments-status').textContent = 'saved' } catch (e) { pick(before); $('comments-status').textContent = e.message }
}

dd.button.addEventListener('click', () => (dd.list.hidden ? openMenu() : closeMenu()))
dd.button.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); openMenu() }
})
dd.list.addEventListener('keydown', (e) => {
  const keys = { ArrowDown: () => highlight(dd.active + 1), ArrowUp: () => highlight(dd.active - 1), Home: () => highlight(0), End: () => highlight(dd.options.length - 1), Enter: () => choose(dd.active), ' ': () => choose(dd.active), Escape: () => closeMenu(), Tab: () => closeMenu(false) }
  if (keys[e.key]) { if (e.key !== 'Tab') e.preventDefault(); keys[e.key]() }
})
dd.list.addEventListener('click', (e) => { const i = dd.options.indexOf(e.target.closest('[role=option]')); if (i >= 0) choose(i) })
dd.list.addEventListener('mousemove', (e) => { const i = dd.options.indexOf(e.target.closest('[role=option]')); if (i >= 0 && i !== dd.active) highlight(i) })
document.addEventListener('click', (e) => { if (!dd.list.hidden && !e.target.closest('.dropdown')) closeMenu(false) })
$('reload-comments').addEventListener('click', loadComments)
loadComments()
