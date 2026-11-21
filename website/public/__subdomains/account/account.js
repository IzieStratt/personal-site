// account.izie.top: passkey sign-in, domain verification, linked services. API in /account.js (worker).
const $ = (id) => document.getElementById(id)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// one message pinned to the bottom of the screen, so errors show up wherever you are on the page
let sayTimer
function say(text, bad = false) {
  const el = $('status')
  el.textContent = text
  el.className = `comment-status toast${bad ? ' bad' : ''}`
  el.hidden = !text
  clearTimeout(sayTimer)
  if (text && !bad && !text.endsWith('...')) sayTimer = setTimeout(() => { el.hidden = true }, 4000)
}

async function api(method, path, body) {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: { 'x-izie': '1', ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

const b64u = {
  enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0)),
}

async function createPasskey(options) {
  const cred = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: b64u.dec(options.challenge),
      user: { ...options.user, id: b64u.dec(options.user.id) },
      excludeCredentials: options.excludeCredentials.map((c) => ({ ...c, id: b64u.dec(c.id) })),
    },
  })
  return { clientDataJSON: b64u.enc(cred.response.clientDataJSON), attestationObject: b64u.enc(cred.response.attestationObject) }
}

// a guess at what to call a new passkey, so the list makes sense later
const deviceLabel = () => {
  const ua = navigator.userAgent
  return /iPhone|iPad/.test(ua) ? 'iphone / ipad' : /Mac/.test(ua) ? 'mac' : /Android/.test(ua) ? 'android' : /Windows/.test(ua) ? 'windows' : /Linux/.test(ua) ? 'linux' : 'passkey'
}

// ?next= sends you back to the page you came from (izie.top pages only)
function next() {
  const n = new URLSearchParams(location.search).get('next')
  try {
    const u = new URL(n)
    if (u.protocol === 'https:' && (u.hostname === 'izie.top' || u.hostname.endsWith('.izie.top'))) return u.href
  } catch {}
  return null
}

async function signedIn() {
  const back = next()
  if (back) location.href = back
  else await load()
}

const busy = (btn, fn) => async (e) => {
  e?.preventDefault()
  const b = btn || e?.submitter
  if (b) b.disabled = true
  try { await fn(e) } catch (err) { say(err.name === 'NotAllowedError' ? 'cancelled' : err.message, true) } finally { if (b) b.disabled = false }
}

// ---- signed out
// passkey sign-in. "conditional" runs quietly in the background so 1Password / the browser can offer the
// passkey right in the username field; the button does the same thing out loud.
let autofill = null
async function passkeyLogin(conditional) {
  const { challengeId, options } = await api('POST', 'login/options')
  if (!conditional) { autofill?.abort(); say('waiting for your passkey...') }
  const ctrl = conditional ? (autofill = new AbortController()) : null
  const cred = await navigator.credentials.get({
    publicKey: { ...options, challenge: b64u.dec(options.challenge) },
    ...(conditional ? { mediation: 'conditional', signal: ctrl.signal } : {}),
  })
  await api('POST', 'login/verify', {
    challengeId,
    id: cred.id,
    response: {
      clientDataJSON: b64u.enc(cred.response.clientDataJSON),
      authenticatorData: b64u.enc(cred.response.authenticatorData),
      signature: b64u.enc(cred.response.signature),
    },
  })
  say('')
  await signedIn()
}
$('login-form').addEventListener('submit', busy($('login'), () => passkeyLogin(false)))
async function startAutofill() {
  try {
    if (await window.PublicKeyCredential?.isConditionalMediationAvailable?.()) await passkeyLogin(true)
  } catch (e) {
    if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') say(e.message, true)
  }
}

$('signup').addEventListener('submit', busy(null, async (e) => {
  const f = e.target.elements
  const handle = f.handle.value.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9_-]{1,23}$/.test(handle)) throw new Error('usernames are 2-24 lowercase letters, numbers, - or _')
  autofill?.abort() // a pending autofill sign-in would block making a new passkey
  say('making your passkey...')
  const { challengeId, options } = await api('POST', 'signup/options', { handle, name: f.name.value })
  const response = await createPasskey(options)
  await api('POST', 'signup/verify', { challengeId, response, label: deviceLabel() })
  say('welcome!')
  await signedIn()
}))

// ---- signed in
let me = null

function domainCard(d) {
  const li = document.createElement('li')
  const enc = encodeURIComponent(d.domain)
  li.innerHTML = `
    <p class="meta"><strong>${esc(d.domain)}</strong> ${d.verified_at ? `<span class="ok">✓ verified ${esc(d.verified_at.slice(0, 10))}</span>` : '<span class="hint">not verified yet</span>'}</p>
    ${d.verified_at ? '<p class="hint">keep the record in place: it gets re-checked every so often.</p>' : `
    <p class="hint">add this record at your DNS host, then press check:</p>
    <div class="record">
      <span>type</span><code>TXT</code><span></span>
      <span>name</span><code>${esc(d.record.name)}</code><button type="button" data-copy="${esc(d.record.name)}">copy</button>
      <span>value</span><code>${esc(d.record.value)}</code><button type="button" data-copy="${esc(d.record.value)}">copy</button>
    </div>
    <div class="cf" hidden></div>`}
    <div class="actions">
      ${d.verified_at ? '' : '<button type="button" data-act="check">check</button>'}
      <button type="button" data-act="remove">remove</button>
    </div>`
  const act = (name, fn) => li.querySelector(`[data-act=${name}]`)?.addEventListener('click', (e) => busy(e.currentTarget, fn)())
  act('check', async () => { say('looking it up...'); await api('POST', `domains/${enc}/check`); say(`${d.domain} is verified`); await load() })
  act('remove', async () => {
    if (!confirm(`remove ${d.domain}?${d.verified_at ? ' someone else could verify it after.' : ''}`)) return
    await api('DELETE', `domains/${enc}`)
    await load()
  })
  if (!d.verified_at) cloudflareHelp(li.querySelector('.cf'), d)
  return li
}

// Cloudflare: a button straight to the zone's DNS page, and a "do it for me" with a one-off API token
async function cloudflareHelp(box, d) {
  let host
  try { host = await api('GET', `domains/${encodeURIComponent(d.domain)}/dns`) } catch { return }
  const tokenUrl = `https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=${encodeURIComponent(JSON.stringify([{ key: 'dns', type: 'edit' }]))}&name=${encodeURIComponent(`izie.top verify ${d.domain}`)}`
  box.hidden = false
  box.innerHTML = `
    <p class="hint">${host.cloudflare ? `<strong>${esc(host.zone)} is on Cloudflare.</strong>` : 'using Cloudflare?'} skip the copying:</p>
    <div class="actions">
      <button type="button" data-act="cf-auto">add it for me</button>
      <a href="https://dash.cloudflare.com/?to=/:account/${encodeURIComponent(host.zone)}/dns/records" target="_blank" rel="noopener">open the DNS page</a>
    </div>
    <form class="cf-token" hidden>
      <p class="hint"><a href="${esc(tokenUrl)}" target="_blank" rel="noopener">make a token</a> with <em>Zone → DNS → Edit</em> for ${esc(host.zone)} (the link fills that in), paste it here. it's used once to add the record and never kept; delete the token after.</p>
      <label><span>cloudflare API token</span><input name="token" type="password" autocomplete="off" required></label>
      <div class="actions"><button type="submit">add record and verify</button></div>
    </form>`
  const form = box.querySelector('.cf-token')
  box.querySelector('[data-act=cf-auto]').addEventListener('click', () => { form.hidden = false; form.elements.token.focus() })
  form.addEventListener('submit', busy(null, async () => {
    say('adding the record on Cloudflare...')
    await api('POST', `domains/${encodeURIComponent(d.domain)}/cloudflare`, { token: form.elements.token.value })
    form.elements.token.value = ''
    // Cloudflare's own resolver sees the new record within seconds, but give it a couple of tries
    for (let i = 0; ; i++) {
      try { await api('POST', `domains/${encodeURIComponent(d.domain)}/check`); break } catch (e) {
        if (i >= 4) throw new Error('the record is in, but it isn\'t showing up yet. press check in a minute')
        say('record added, waiting for it to show up...')
        await new Promise((r) => setTimeout(r, 3000))
      }
    }
    say(`${d.domain} is verified`)
    await load()
  }))
}

function render(a) {
  me = a
  $('who').innerHTML = `signed in as <strong>@${esc(a.handle)}</strong>${a.slackIds.length ? ` · slack ${a.slackIds.map(esc).join(', ')}` : ''}`
  $('verified-badge').innerHTML = a.verified
    ? `<span class="ok">✓ verified</span>${a.manualVerified ? ' by izie' : ' by domain'}: you can comment wherever comments are limited to verified accounts.`
    : 'not verified yet. verify a domain below so you can comment when comments are limited to verified accounts.'
  $('profile').elements.name.value = a.name
  $('domains').replaceChildren(...a.domains.map(domainCard))

  const svc = { vibetime: 'vibetime', hmojis: 'hmojis' }
  $('links').replaceChildren(...a.links.map((l) => {
    const li = document.createElement('li')
    li.innerHTML = `<p class="meta"><strong>${esc(svc[l.service] || l.service)}</strong> · ${esc(l.label || l.external_id)}${l.slack_id ? ` · slack ${esc(l.slack_id)}` : ''}</p><div class="actions"><button type="button">unlink</button></div>`
    li.querySelector('button').addEventListener('click', (e) => busy(e.currentTarget, async () => { await api('DELETE', `links/${l.service}/${encodeURIComponent(l.external_id)}`); await load() })())
    return li
  }))
  const n = a.comments.reduce((s, c) => s + c.n, 0)
  const posts = new Set(a.comments.map((c) => c.post)).size
  $('comment-count').innerHTML = `blog: ${n ? `${n} comment${n === 1 ? '' : 's'} on ${posts} post${posts === 1 ? '' : 's'}` : 'no comments yet'} (<a href="https://blog.izie.top">blog</a>)`

  $('admin').hidden = !a.admin
  $('passkeys').replaceChildren(...a.passkeys.map((k) => {
    const li = document.createElement('li')
    li.innerHTML = `<p class="meta"><strong>${esc(k.label || 'passkey')}</strong> · added ${esc(k.created.slice(0, 10))}${k.last_used ? ` · last used ${esc(k.last_used.slice(0, 10))}` : ''}</p>${a.passkeys.length > 1 ? '<div class="actions"><button type="button">remove</button></div>' : ''}`
    li.querySelector('button')?.addEventListener('click', (e) => busy(e.currentTarget, async () => {
      if (!confirm('remove this passkey? it will stop working here.')) return
      await api('DELETE', `passkeys/${encodeURIComponent(k.id)}`)
      await load()
    })())
    return li
  }))
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]')
  if (!b) return
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'copied' } catch { b.textContent = 'select it' }
  setTimeout(() => { b.textContent = 'copy' }, 1500)
})

$('profile').addEventListener('submit', busy(null, async (e) => { await api('PUT', 'me', { name: e.target.elements.name.value }); say('saved') }))
$('logout').addEventListener('click', busy($('logout'), async () => { await api('POST', 'logout'); say('signed out'); await load() }))
$('add-domain').addEventListener('submit', busy(null, async (e) => {
  const el = e.target.elements.domain
  await api('POST', 'domains', { domain: el.value })
  el.value = ''
  say('')
  await load()
}))
$('link').addEventListener('submit', busy(null, async (e) => {
  const f = e.target.elements
  await api('POST', `links/${f.service.value}`, { token: f.token.value })
  f.token.value = ''
  say('linked')
  await load()
}))
$('add-passkey').addEventListener('click', busy($('add-passkey'), async () => {
  const { challengeId, options } = await api('POST', 'passkeys')
  const response = await createPasskey(options)
  await api('POST', 'passkeys/verify', { challengeId, response, label: deviceLabel() })
  say('passkey added')
  await load()
}))
$('delete').addEventListener('submit', busy(null, async (e) => {
  await api('DELETE', 'me', { confirm: e.target.elements.confirm.value })
  say('account deleted')
  await load()
}))

// ---- claim links (an admin made this account for you; you set the passkey)
const claimId = new URLSearchParams(location.search).get('claim')
$('claim-go').addEventListener('click', busy($('claim-go'), async () => {
  autofill?.abort()
  say('making your passkey...')
  const { challengeId, options } = await api('POST', 'claim/options', { claim: claimId })
  const response = await createPasskey(options)
  await api('POST', 'claim/verify', { challengeId, response, label: deviceLabel() })
  history.replaceState(null, '', '/')
  say('all set!')
  $('claim').hidden = true
  await load()
}))

async function load() {
  if (!window.PublicKeyCredential) say("this browser can't use passkeys, so it can't sign in here", true)
  if (claimId) {
    // peek first so a dead link says so right away
    try {
      const { handle } = await api('POST', 'claim/options', { claim: claimId })
      $('claim-text').innerHTML = `izie made an account for you: <strong>@${esc(handle)}</strong>. make a passkey to start using it.`
      $('claim').hidden = false
      $('signed-out').hidden = true
      $('signed-in').hidden = true
      return
    } catch (e) {
      say(e.message, true)
      history.replaceState(null, '', '/')
    }
  }
  const { account } = await api('GET', 'me')
  $('signed-out').hidden = !!account
  $('signed-in').hidden = !account
  if (account) render(account)
  else startAutofill()
}
load().catch((e) => say(e.message, true))
