const $ = (id) => document.getElementById(id)
const state = { slug: new URLSearchParams(location.search).get('post') || 'new' }

async function api(method, url, body, raw) {
  const res = await fetch(url, {
    method,
    headers: { 'x-blog': '1', ...(body && !raw ? { 'content-type': 'application/json' } : {}) },
    body: body ? (raw ? body : JSON.stringify(body)) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) showSignin('your sign-in ran out. sign in again.')
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

// ---- passkeys (WebAuthn). The server checks everything; this only moves bytes between the browser and the API.
const b64u = {
  enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0)),
}
const postJson = (url, body) => api('POST', url, body || {})

function showSignin(message) {
  $('app').hidden = true
  $('signout').hidden = true
  $('signin').hidden = false
  if (message) $('signin-status').textContent = message
}

async function enroll() {
  const setup = $('setup-code').value
  const { challengeId, options } = await postJson('/api/auth/register/options', { setup })
  const cred = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: b64u.dec(options.challenge),
      user: { ...options.user, id: b64u.dec(options.user.id) },
      excludeCredentials: options.excludeCredentials.map((c) => ({ ...c, id: b64u.dec(c.id) })),
    },
  })
  await postJson('/api/auth/register/verify', {
    setup, challengeId, id: cred.id,
    response: { clientDataJSON: b64u.enc(cred.response.clientDataJSON), attestationObject: b64u.enc(cred.response.attestationObject) },
  })
  $('signin-status').textContent = 'passkey saved. signing you in...'
  await boot()
}

async function login() {
  const { challengeId, options } = await postJson('/api/auth/login/options')
  const cred = await navigator.credentials.get({ publicKey: { ...options, challenge: b64u.dec(options.challenge) } })
  await postJson('/api/auth/login/verify', {
    challengeId, id: cred.id,
    response: {
      clientDataJSON: b64u.enc(cred.response.clientDataJSON),
      authenticatorData: b64u.enc(cred.response.authenticatorData),
      signature: b64u.enc(cred.response.signature),
      userHandle: cred.response.userHandle ? b64u.enc(cred.response.userHandle) : null,
    },
  })
  await boot()
}

// signed in once, can add more passkeys (e.g. a second device) from the sign-in panel
async function boot() {
  const st = await fetch('/api/auth/status', { headers: { 'x-blog': '1' } }).then((r) => r.json())
  if (!st.signedIn) {
    $('signin-status').textContent = ''
    $('setup').hidden = st.enrolled
    $('login-actions').hidden = !st.enrolled
    $('signin-hint').textContent = st.enrolled
      ? 'use your passkey (your device\'s fingerprint, face or screen lock).'
      : 'no passkey yet. enter the setup code once to create the first one on this device.'
    return showSignin()
  }
  $('signin').hidden = true
  $('app').hidden = false
  $('signout').hidden = false
  await init()
}

$('enroll').addEventListener('click', () => guard(enroll))
$('login').addEventListener('click', () => guard(login))
$('signout').addEventListener('click', async () => { await postJson('/api/auth/logout').catch(() => {}); location.reload() })
async function guard(fn) {
  try { await fn() } catch (e) { $('signin-status').textContent = e.name === 'NotAllowedError' ? 'the passkey prompt was cancelled.' : e.message }
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
  document.querySelector(`#post-comments input[value="${p.comments || ''}"]`).checked = true
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
  status('saving and committing...')
  try {
    const r = await api('PUT', `/api/posts/${state.slug}`, {
      title: $('title').value, tags: $('tags').value, date: $('date').value,
      draft: $('draft').checked, comments: document.querySelector('#post-comments input:checked').value, body: $('body').value,
    })
    if (state.slug === 'new') history.replaceState(null, '', `?post=${r.slug}`)
    state.slug = r.slug
    $('delete').hidden = false
    $('view').hidden = false
    $('view').href = `/post/${r.slug}/`
    status(`saved as commit ${r.commit}. the site rebuilds in a few minutes, and new links get archived then.`)
    loadList()
    return true
  } catch (err) {
    status(err.message, true)
    return false
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
// publish = save, then commit the blog's files with the post's title as the message, then push
$('publish').addEventListener('click', async () => {
  if (!$('title').value.trim()) return status('give the post a title first', true)
  const { branch } = await api('GET', '/api/git').catch(() => ({ branch: '' }))
  const live = branch === 'main' ? ' (this goes live on the site)' : ''
  if (!confirm(`publish "${$('title').value.trim()}" to ${branch || 'main'}?${live}`)) return
  $('publish').disabled = true
  try {
    // saving commits the post; GitHub then deploys it and the blog-build workflow builds the pages
    await save()
  } catch (err) {
    status(err.message, true)
  } finally {
    $('publish').disabled = false
  }
})
$('delete').addEventListener('click', async () => {
  if (!confirm(`delete "${$('title').value}"? (the md file only; attached files and archives stay in /cdn)`)) return
  await api('DELETE', `/api/posts/${state.slug}`)
  location.href = '/admin/'
})

async function init() {
  await loadList()
  fill(state.slug === 'new' ? {} : await api('GET', `/api/posts/${state.slug}`).catch((e) => (status(e.message, true), {})))
  loadComments()
}
boot().catch((e) => showSignin(e.message))

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
