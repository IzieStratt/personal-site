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
// message text is escaped first; then bare https links become links and line breaks stay
const linkify = (text) => esc(text).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g, (u) => `<a href="${u}" rel="noopener" target="_blank">${u}</a>`).replace(/\n/g, '<br>')

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

// one-click: Domain Connect (the DNS host's own "allow izie.top to add this record?" page) when the host runs our
// template; otherwise a link to the right DNS page, with the API-token way tucked away as a last resort
async function cloudflareHelp(box, d) {
  let host
  try { host = await api('GET', `domains/${encodeURIComponent(d.domain)}/dns`) } catch { return }
  const tokenUrl = `https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=${encodeURIComponent(JSON.stringify([{ key: 'dns', type: 'edit' }]))}&name=${encodeURIComponent(`izie.top verify ${d.domain}`)}`
  const dash = host.cloudflare ? `<a href="https://dash.cloudflare.com/?to=/:account/${encodeURIComponent(host.zone)}/dns/records" target="_blank" rel="noopener">open ${esc(host.zone)} on Cloudflare</a>` : ''
  if (!host.connect && !host.cloudflare) return
  box.hidden = false
  box.innerHTML = host.connect
    ? `<div class="actions"><a class="button" href="${esc(host.connect.url)}">set it up with ${esc(host.connect.provider)}</a></div>
       <p class="hint">${esc(host.connect.provider)} asks you to approve one TXT record, then sends you back here verified.</p>`
    : `<p class="hint"><strong>${esc(host.zone)} is on Cloudflare.</strong> add the record there, then press check: ${dash}</p>
       <details class="cf-more"><summary>or let izie.top add it with an API token</summary>
         <form class="cf-token">
           <p class="hint"><a href="${esc(tokenUrl)}" target="_blank" rel="noopener">make a token</a> (the link picks <em>DNS → Edit</em>), paste it here. it's used once and never kept.</p>
           <label><span>cloudflare API token</span><input name="token" type="password" autocomplete="off" required></label>
           <div class="actions"><button type="submit">add record and verify</button></div>
         </form>
       </details>`
  const form = box.querySelector('.cf-token')
  form?.addEventListener('submit', busy(null, async () => {
    say('adding the record on Cloudflare...')
    await api('POST', `domains/${encodeURIComponent(d.domain)}/cloudflare`, { token: form.elements.token.value })
    form.elements.token.value = ''
    await checkUntilSeen(d.domain)
    await load()
  }))
}

// new records take a few seconds to show up; try a handful of times
async function checkUntilSeen(domain) {
  for (let i = 0; ; i++) {
    try { await api('POST', `domains/${encodeURIComponent(domain)}/check`); break } catch (e) {
      if (i >= 6) throw new Error("the record is in, but it isn't showing up yet. press check in a minute")
      say('record added, waiting for it to show up...')
      await new Promise((r) => setTimeout(r, 3000))
    }
  }
  say(`${domain} is verified`)
}

function render(a) {
  me = a
  $('who').innerHTML = `signed in as <strong>@${esc(a.handle)}</strong>${a.slackIds.length ? ` · slack ${a.slackIds.map(esc).join(', ')}` : ''}`
  $('verified-badge').innerHTML = a.verified
    ? `<span class="ok">✓ verified</span>${a.manualVerified ? ' by izie' : ' by domain'}: you can comment wherever comments are limited to verified accounts.`
    : 'not verified yet. verify a domain below so you can comment when comments are limited to verified accounts.'
  $('notices').replaceChildren(...a.notices.map((n) => {
    const li = document.createElement('li')
    li.innerHTML = `<p class="meta">${linkify(n.body)}</p><p class="hint">${n.sender ? `from @${esc(n.sender)} · ` : ''}${esc(n.created.slice(0, 10))}</p><div class="actions"><button type="button">got it</button></div>`
    li.querySelector('button').addEventListener('click', (e) => busy(e.currentTarget, async () => { await api('DELETE', `notices/${n.id}`); li.remove() })())
    return li
  }))
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

// back from the DNS host's Domain Connect page: ?connected=<domain>, plus ?error= if it didn't go through
async function connectedReturn() {
  const q = new URLSearchParams(location.search)
  const domain = q.get('connected')
  if (!domain) return
  history.replaceState(null, '', '/')
  if (q.get('error')) return say(q.get('error') === 'access_denied' || /cancel/i.test(q.get('error_description') || q.get('error')) ? 'cancelled, nothing was changed' : `your DNS host said: ${q.get('error_description') || q.get('error')}`, true)
  try { await checkUntilSeen(domain) } catch (e) { say(e.message, true) }
  await load()
}

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
load().then(connectedReturn).catch((e) => say(e.message, true))
