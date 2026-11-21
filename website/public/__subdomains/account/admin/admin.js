// account.izie.top/admin/: find, verify, create and promote accounts. The API (/api/admin/*) checks is_admin
// on every call; this page only decides what to draw.
const $ = (id) => document.getElementById(id)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const HANDLE = /^[a-z0-9][a-z0-9_-]{1,23}$/

let sayTimer
function say(text, bad = false) {
  const el = $('status')
  el.textContent = text
  el.className = `comment-status toast${bad ? ' bad' : ''}`
  el.hidden = !text
  clearTimeout(sayTimer)
  if (text && !bad) sayTimer = setTimeout(() => { el.hidden = true }, 4000)
}

async function api(method, path, body, retried = false) {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: { 'x-izie': '1', ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  // risky actions want a fresh passkey check: ask for it, then try once more
  if (data.reauth && !retried) {
    await reauth()
    return api(method, path, body, true)
  }
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

const b64uDec = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0))
const b64uEnc = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
async function reauth() {
  say('confirm it\'s you with your passkey...')
  const { challengeId, options } = await api('POST', 'reauth/options', {}, true)
  const cred = await navigator.credentials.get({
    publicKey: { ...options, challenge: b64uDec(options.challenge), allowCredentials: options.allowCredentials.map((c) => ({ ...c, id: b64uDec(c.id) })) },
  })
  await api('POST', 'reauth/verify', {
    challengeId,
    id: cred.id,
    response: { clientDataJSON: b64uEnc(cred.response.clientDataJSON), authenticatorData: b64uEnc(cred.response.authenticatorData), signature: b64uEnc(cred.response.signature) },
  }, true)
  say('')
}

const run = (btn, fn) => async (e) => {
  e?.preventDefault()
  if (btn) btn.disabled = true
  try { await fn() } catch (err) { say(err.message, true) } finally { if (btn) btn.disabled = false }
}

let me = null
let accounts = []
let pickedId = null

// one account as a card: verification + note, admin, claim link
function card(a, claim) {
  const li = document.createElement('li')
  const bits = [
    `${a.comments} comment${a.comments === 1 ? '' : 's'}`,
    a.passkeys ? `${a.passkeys} passkey${a.passkeys === 1 ? '' : 's'}` : 'no passkey yet',
    a.domains && `domains: ${a.domains}`,
    a.links,
    `since ${a.created.slice(0, 10)}`,
  ].filter(Boolean)
  li.innerHTML = `
    <p class="meta"><strong>@${esc(a.handle)}</strong> · ${esc(a.display_name)}
      ${a.is_admin ? ' · <span class="ok">admin</span>' : ''}${a.manual_verified ? ' · <span class="ok">✓ verified by hand</span>' : a.domains ? ' · <span class="ok">✓ domain</span>' : ''}</p>
    <p class="hint">${bits.map(esc).join(' · ')}</p>
    <label><span>internal note</span><input type="text" maxlength="500" placeholder="who is this?" value="${esc(a.manual_note || '')}"></label>
    <div class="actions"></div>
    <div class="claim"></div>`
  const input = li.querySelector('input')
  const actions = li.querySelector('.actions')
  const btn = (label, fn) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = label
    b.addEventListener('click', run(b, fn))
    actions.append(b)
  }
  btn(a.manual_verified ? 'save note' : 'verify', async () => {
    await api('PUT', `admin/accounts/${encodeURIComponent(a.id)}`, { verified: true, note: input.value })
    say(a.manual_verified ? 'saved' : `@${a.handle} is verified`)
    await refresh()
  })
  if (a.manual_verified) btn('unverify', async () => {
    await api('PUT', `admin/accounts/${encodeURIComponent(a.id)}`, { verified: false, note: input.value })
    say('unverified')
    await refresh()
  })
  if (a.id !== me.id) btn(a.is_admin ? 'remove admin' : 'make admin', async () => {
    if (!a.is_admin && !confirm(`make @${a.handle} an admin? they'll be able to do everything you can, including the blog editor.`)) return
    await api('PUT', `admin/accounts/${encodeURIComponent(a.id)}/admin`, { admin: !a.is_admin })
    say(a.is_admin ? 'admin removed' : `@${a.handle} is an admin`)
    await refresh()
  })
  btn(a.passkeys ? 'new sign-in link' : 'sign-in link', async () => {
    if (a.passkeys && !confirm(`make a link that lets whoever opens it add a passkey to @${a.handle}? only for when they've lost theirs.`)) return
    showClaim(li, (await api('POST', `admin/accounts/${encodeURIComponent(a.id)}/claim`)).claim)
  })
  if (claim) showClaim(li, claim)
  return li
}

function showClaim(li, claim) {
  const box = li.querySelector('.claim')
  box.innerHTML = `<span>send them this (works once, until ${esc(claim.expires.slice(0, 10))}):</span> <code>${esc(claim.url)}</code> <button type="button">copy</button>`
  box.querySelector('button').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText(claim.url); e.target.textContent = 'copied' } catch { e.target.textContent = 'select it' }
  })
}

function pick(a, claim) {
  pickedId = a?.id ?? null
  $('picked').replaceChildren(...(a ? [Object.assign(document.createElement('ol'), { className: 'cards' })] : []))
  if (a) $('picked').firstChild.append(card(a, claim))
}

// ---- search box with suggestions from the current accounts
const q = $('q')
const list = $('suggest')
let items = []
let active = -1

function matches(text) {
  const t = text.trim().toLowerCase().replace(/^@/, '')
  if (!t) return []
  const hay = (a) => [a.handle, a.display_name, a.domains, a.manual_note, a.links].filter(Boolean).join(' ').toLowerCase()
  return accounts
    .filter((a) => hay(a).includes(t))
    .sort((x, y) => (y.handle.startsWith(t) - x.handle.startsWith(t)) || x.handle.localeCompare(y.handle))
    .slice(0, 8)
}

function suggest() {
  const t = q.value.trim().toLowerCase().replace(/^@/, '')
  const found = matches(t)
  items = found.map((a) => ({ a }))
  if (HANDLE.test(t) && !accounts.some((a) => a.handle === t)) items.push({ create: t })
  list.replaceChildren(...items.map((it, i) => {
    const li = document.createElement('li')
    li.setAttribute('role', 'option')
    li.id = `sg-${i}`
    li.innerHTML = it.create
      ? `make a new account <strong>@${esc(it.create)}</strong>`
      : `<strong>@${esc(it.a.handle)}</strong> ${esc(it.a.display_name)} <span class="sub">${esc([it.a.domains, it.a.manual_note].filter(Boolean).join(' · '))}</span>`
    return li
  }))
  list.hidden = !items.length
  q.setAttribute('aria-expanded', String(!list.hidden))
  highlight(items.length ? 0 : -1)
}

function highlight(i) {
  active = i
  ;[...list.children].forEach((li, k) => li.classList.toggle('active', k === i))
  if (i >= 0) { q.setAttribute('aria-activedescendant', `sg-${i}`); list.children[i].scrollIntoView({ block: 'nearest' }) } else q.removeAttribute('aria-activedescendant')
}

function choose(i) {
  const it = items[i]
  if (!it) return
  list.hidden = true
  q.setAttribute('aria-expanded', 'false')
  if (it.create) {
    pick(null)
    $('create-handle').textContent = `@${it.create}`
    $('create').dataset.handle = it.create
    $('create').hidden = false
    $('create').elements.note.focus()
  } else {
    $('create').hidden = true
    q.value = `@${it.a.handle}`
    pick(it.a)
  }
}

q.addEventListener('input', suggest)
q.addEventListener('focus', () => { if (q.value) suggest() })
q.addEventListener('keydown', (e) => {
  if (list.hidden && e.key === 'ArrowDown') { suggest(); return }
  const keys = {
    ArrowDown: () => highlight((active + 1) % items.length),
    ArrowUp: () => highlight((active - 1 + items.length) % items.length),
    Enter: () => choose(active),
    Escape: () => { list.hidden = true; q.setAttribute('aria-expanded', 'false') },
  }
  if (!list.hidden && keys[e.key]) { e.preventDefault(); keys[e.key]() }
})
list.addEventListener('mousedown', (e) => {
  const li = e.target.closest('[role=option]')
  if (li) { e.preventDefault(); choose([...list.children].indexOf(li)) }
})
list.addEventListener('mousemove', (e) => {
  const li = e.target.closest('[role=option]')
  if (li) highlight([...list.children].indexOf(li))
})
q.addEventListener('blur', () => setTimeout(() => { list.hidden = true; q.setAttribute('aria-expanded', 'false') }, 100))

$('create').addEventListener('submit', async (e) => {
  e.preventDefault()
  const f = e.target
  const b = f.querySelector('button')
  b.disabled = true
  try {
    const res = await api('POST', 'admin/accounts', { handle: f.dataset.handle, name: f.elements.name.value, note: f.elements.note.value })
    f.reset()
    f.hidden = true
    await refresh()
    q.value = `@${accounts.find((a) => a.id === res.id)?.handle ?? ''}`
    pick(accounts.find((a) => a.id === res.id), res.claim)
    say('made it. send them the link so they can set their passkey')
  } catch (err) {
    say(err.message, true)
  } finally {
    b.disabled = false
  }
})

async function refresh() {
  accounts = await api('GET', 'admin/accounts')
  $('all').replaceChildren(...accounts.map((a) => card(a)))
  if (pickedId) pick(accounts.find((a) => a.id === pickedId))
}

async function start() {
  const { account } = await api('GET', 'me')
  me = account
  if (!account) {
    $('gate').innerHTML = `<a href="/?next=${encodeURIComponent(location.href)}">sign in</a> with an admin account.`
    return
  }
  if (!account.admin) {
    $('gate').textContent = 'admins only.'
    return
  }
  $('gate').hidden = true
  $('app').hidden = false
  await refresh()
}
start().catch((e) => { $('gate').textContent = e.message })
