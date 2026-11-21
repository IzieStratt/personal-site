// izie accounts: one sign-in for the whole site (account.izie.top), loosely after Hack Club's HCA.
// - passkeys only (WebAuthn, RP ID izie.top so a passkey works on every subdomain). no passwords, ever.
// - a session cookie scoped to .izie.top, so other parts of the site can ask currentAccount()
// - domain verification by a DNS TXT record (with a one-click path for Cloudflare)
// - links to the other things on the site with their own accounts (vibetime, hmojis, blog comments)
// - izie can mark an account verified by hand with an internal note (blog editor, blog-admin.js)
// Tables in account/schema.sql (izie-blog D1, binding COMMENTS).
import { b64uBytes, cbor, checkRpAndFlags, coseToJwk, derToRaw, fromB64u, hex, parseAuthData, parseClientData, randomB64u, sha256 } from './blog-passkeys.js'
import { hmojiTokenInfo } from './hmojis.js'

export const ACCOUNT_RP_ID = 'izie.top'
export const ACCOUNT_ORIGIN = 'https://account.izie.top'
const COOKIE = '__Secure-izie_account'
const SESSION_MS = 30 * 86400_000
const CHALLENGE_MS = 5 * 60_000
const RECHECK_MS = 7 * 86400_000 // verified domains are re-checked this often; remove the record and you lose it
const SIGNUPS_PER_DAY = 5
const TXT_PREFIX = '_izie-verify'
const enc = new TextEncoder()

const json = (data, status = 200, extra = {}) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store', ...extra } })
const fail = (status, error) => json({ error }, status)
const now = () => new Date().toISOString()
const tokenHash = async (t) => hex(await sha256(enc.encode(t)))

// "https://www.Example.com/about" -> "example.com"; null when it isn't a domain (same rule as comments.js)
export function cleanDomain(raw) {
  const host = String(raw || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#:]/)[0].replace(/\.$/, '')
  return /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ? host : null
}

// ---- sessions (shared with every *.izie.top page through the cookie)
function readCookie(request) {
  const c = request.headers.get('cookie') || ''
  const t = c.split(/;\s*/).find((x) => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  return t && t.length <= 128 ? t : null
}

const sessionCookie = (token, maxAge) =>
  `${COOKIE}=${token}; Domain=izie.top; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`

async function startSession(env, accountId) {
  const token = randomB64u(32)
  await env.COMMENTS.prepare('INSERT INTO account_sessions (token_hash, account_id, expires) VALUES (?, ?, ?)')
    .bind(await tokenHash(token), accountId, Date.now() + SESSION_MS).run()
  return sessionCookie(token, SESSION_MS / 1000)
}

// the signed-in account for this request, or null. Any worker route on *.izie.top can call this.
export async function currentAccount(request, env) {
  const token = readCookie(request)
  if (!token || !env.COMMENTS) return null
  try {
    return await env.COMMENTS.prepare(
      'SELECT a.* FROM account_sessions s JOIN accounts a ON a.id = s.account_id WHERE s.token_hash = ? AND s.expires > ?',
    ).bind(await tokenHash(token), Date.now()).first()
  } catch {
    return null // tables not created yet
  }
}

// ---- domains
async function dohTxt(name) {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`, {
    headers: { accept: 'application/dns-json' },
  })
  if (!res.ok) throw new Error('dns lookup failed, try again')
  const data = await res.json()
  return (data.Answer || []).filter((a) => a.type === 16).map((a) => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
}

// the zone a domain lives in and whether Cloudflare runs its DNS (walks up: blog.example.co.uk -> example.co.uk)
async function dnsHost(domain) {
  const parts = domain.split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts.slice(i).join('.')
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=NS`, { headers: { accept: 'application/dns-json' } })
    if (!res.ok) break
    const ns = ((await res.json()).Answer || []).filter((a) => a.type === 2).map((a) => a.data.toLowerCase())
    if (ns.length) return { zone: name, cloudflare: ns.some((n) => /\.ns\.cloudflare\.com\.?$/.test(n)), ns }
  }
  return { zone: parts.slice(-2).join('.'), cloudflare: false, ns: [] }
}

const txtName = (domain) => `${TXT_PREFIX}.${domain}`
const txtValue = (token) => `izie-verify=${token}`

async function hasRecord(domain, token) {
  return (await dohTxt(txtName(domain))).includes(txtValue(token))
}

// a domain and the domains above it: blog.example.com -> [blog.example.com, example.com]
const withParents = (domain) => domain.split('.').slice(0, -1).map((_, i, a) => domain.split('.').slice(i).join('.'))

// re-checks a verified row against DNS now and then; a gone record unverifies it. true if it still stands
async function stillVerified(env, row) {
  if (Date.now() - Date.parse(row.last_checked || 0) <= RECHECK_MS) return true
  let still = true
  try { still = await hasRecord(row.domain, row.token) } catch { /* dns hiccup: keep it for now */ }
  await env.COMMENTS.prepare(`UPDATE account_domains SET ${still ? '' : 'verified_at = NULL, '}last_checked = ? WHERE account_id = ? AND domain = ?`)
    .bind(now(), row.account_id, row.domain).run()
  return still
}

// the account that owns this domain, or null. Verifying example.com covers every subdomain under it, and
// the highest verified domain wins (whoever runs example.com's DNS controls blog.example.com too).
export async function domainOwner(env, domain) {
  const names = withParents(domain)
  const { results } = await env.COMMENTS.prepare(
    `SELECT account_id, domain, token, last_checked FROM account_domains WHERE verified_at IS NOT NULL AND domain IN (${names.map(() => '?').join(',')}) ORDER BY length(domain)`,
  ).bind(...names).all()
  for (const row of results) if (await stillVerified(env, row)) return row.account_id
  return null
}

export async function verifiedDomains(env, accountId) {
  const { results } = await env.COMMENTS.prepare('SELECT domain FROM account_domains WHERE account_id = ? AND verified_at IS NOT NULL ORDER BY domain').bind(accountId).all()
  // domainOwner re-checks stale ones against DNS, so a removed record stops counting
  const owned = await Promise.all(results.map(async (r) => ((await domainOwner(env, r.domain)) === accountId ? r.domain : null)))
  return owned.filter(Boolean)
}

// verified = owns at least one domain, or izie checked them by hand
export async function isVerified(env, account) {
  if (!account) return false
  return !!account.manual_verified || (await verifiedDomains(env, account.id)).length > 0
}

// ---- passkey ceremonies
async function newChallenge(env, purpose, data = null) {
  const id = randomB64u(16)
  const challenge = randomB64u(32)
  await env.COMMENTS.prepare('DELETE FROM account_challenges WHERE expires < ?').bind(Date.now()).run()
  await env.COMMENTS.prepare('INSERT INTO account_challenges (id, challenge, purpose, data, expires) VALUES (?, ?, ?, ?, ?)')
    .bind(id, challenge, purpose, data == null ? null : JSON.stringify(data), Date.now() + CHALLENGE_MS).run()
  return { id, challenge }
}

async function takeChallenge(env, id, purpose) {
  if (typeof id !== 'string' || id.length > 64) return null
  const row = await env.COMMENTS.prepare('DELETE FROM account_challenges WHERE id = ? RETURNING *').bind(id).first()
  if (!row || row.purpose !== purpose || row.expires < Date.now()) return null
  return { challenge: row.challenge, data: row.data ? JSON.parse(row.data) : null }
}

const creationOptions = (challenge, userHandle, name, displayName, exclude) => ({
  challenge,
  rp: { id: ACCOUNT_RP_ID, name: 'izie account' },
  // password managers (1Password etc.) show user.name as the login and file it under the rp: "izie · @handle"
  user: { id: userHandle, name: `@${name}`, displayName: `${displayName} (@${name})` },
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
  attestation: 'none',
  excludeCredentials: exclude.map((id) => ({ type: 'public-key', id })),
  timeout: 60000,
})

// attestation "none": all we keep is the public key
async function readNewPasskey(response, challenge) {
  parseClientData(response.clientDataJSON, 'webauthn.create', challenge, ACCOUNT_ORIGIN)
  const att = cbor(fromB64u(response.attestationObject)).value
  const auth = parseAuthData(att.get('authData'))
  await checkRpAndFlags(auth, ACCOUNT_RP_ID)
  if (!(auth.flags & 0x40)) throw new Error('no credential in response')
  const rest = auth.rest
  const credLen = (rest[16] << 8) | rest[17]
  const credId = rest.slice(18, 18 + credLen)
  const jwk = coseToJwk(cbor(rest, 18 + credLen).value)
  return { id: b64uBytes(credId), jwk, signCount: auth.signCount }
}

async function savePasskey(env, accountId, pk, label) {
  await env.COMMENTS.prepare('INSERT INTO account_passkeys (id, account_id, public_key, sign_count, label, created) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(pk.id, accountId, JSON.stringify(pk.jwk), pk.signCount, label, now()).run()
}

const HANDLE = /^[a-z0-9][a-z0-9_-]{1,23}$/
const cleanName = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 40)

async function ipHash(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  return tokenHash(`${env.COMMENT_SALT || 'blog'}:account:${ip}`)
}

async function signupOptions(request, env, body) {
  const handle = String(body.handle || '').trim().toLowerCase()
  const name = cleanName(body.name) || handle
  if (!HANDLE.test(handle)) return fail(400, 'pick a username: 2-24 letters, numbers, - or _')
  if (await env.COMMENTS.prepare('SELECT 1 FROM accounts WHERE handle = ?').bind(handle).first()) return fail(409, 'that username is taken')
  const ip = await ipHash(request, env)
  const n = await env.COMMENTS.prepare('SELECT COUNT(*) AS n FROM accounts WHERE ip_hash = ? AND created > ?')
    .bind(ip, new Date(Date.now() - 86400_000).toISOString()).first('n')
  if (n >= SIGNUPS_PER_DAY) return fail(429, 'too many new accounts from here today, try tomorrow')
  const accountId = randomB64u(16)
  const { id, challenge } = await newChallenge(env, 'signup', { accountId, handle, name })
  return json({ challengeId: id, options: creationOptions(challenge, accountId, handle, name, []) })
}

async function signupVerify(request, env, body) {
  const ch = await takeChallenge(env, body.challengeId, 'signup')
  if (!ch) return fail(400, 'that took too long, try again')
  const { accountId, handle, name } = ch.data
  const pk = await readNewPasskey(body.response, ch.challenge)
  try {
    await env.COMMENTS.batch([
      env.COMMENTS.prepare('INSERT INTO accounts (id, handle, display_name, created, ip_hash) VALUES (?, ?, ?, ?, ?)')
        .bind(accountId, handle, name, now(), await ipHash(request, env)),
      env.COMMENTS.prepare('INSERT INTO account_passkeys (id, account_id, public_key, sign_count, label, created) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(pk.id, accountId, JSON.stringify(pk.jwk), pk.signCount, cleanName(body.label) || 'first passkey', now()),
    ])
  } catch {
    return fail(409, 'that username was just taken, pick another')
  }
  return json({ ok: true }, 200, { 'set-cookie': await startSession(env, accountId) })
}

async function loginVerify(env, body) {
  const ch = await takeChallenge(env, body.challengeId, 'login')
  if (!ch) return fail(400, 'that took too long, try again')
  const r = body.response
  parseClientData(r.clientDataJSON, 'webauthn.get', ch.challenge, ACCOUNT_ORIGIN)
  const row = await env.COMMENTS.prepare('SELECT account_id, public_key, sign_count FROM account_passkeys WHERE id = ?').bind(String(body.id)).first()
  if (!row) return fail(400, "that passkey isn't on any account (was it deleted?)")
  const authBytes = fromB64u(r.authenticatorData)
  const auth = parseAuthData(authBytes)
  await checkRpAndFlags(auth, ACCOUNT_RP_ID)
  const signed = new Uint8Array(authBytes.length + 32)
  signed.set(authBytes, 0)
  signed.set(await sha256(fromB64u(r.clientDataJSON)), authBytes.length)
  const key = await crypto.subtle.importKey('jwk', JSON.parse(row.public_key), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
  if (!(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, derToRaw(fromB64u(r.signature)), signed))) return fail(400, 'signature check failed')
  if ((auth.signCount || row.sign_count) && auth.signCount <= row.sign_count) return fail(400, 'passkey counter went backwards')
  const upd = await env.COMMENTS.prepare('UPDATE account_passkeys SET sign_count = ?, last_used = ? WHERE id = ? AND sign_count = ?').bind(auth.signCount, now(), String(body.id), row.sign_count).run()
  if (!upd.meta.changes) return fail(400, 'that passkey was just used, try again')
  return json({ ok: true }, 200, { 'set-cookie': await startSession(env, row.account_id) })
}

// ---- what the account page shows (manual_note stays internal)
async function profile(env, a) {
  const db = env.COMMENTS
  const [keys, domains, links, comments] = await Promise.all([
    db.prepare('SELECT id, label, created, last_used FROM account_passkeys WHERE account_id = ? ORDER BY created').bind(a.id).all(),
    db.prepare('SELECT domain, token, created, verified_at, last_checked FROM account_domains WHERE account_id = ? ORDER BY domain').bind(a.id).all(),
    db.prepare('SELECT service, external_id, label, slack_id, created FROM account_links WHERE account_id = ? ORDER BY service').bind(a.id).all(),
    db.prepare("SELECT post, status, COUNT(*) AS n FROM comments WHERE account_id = ? GROUP BY post, status").bind(a.id).all().catch(() => ({ results: [] })),
  ])
  const doms = domains.results.map((d) => ({ ...d, record: { type: 'TXT', name: txtName(d.domain), value: txtValue(d.token) } }))
  return {
    id: a.id,
    handle: a.handle,
    name: a.display_name,
    created: a.created,
    manualVerified: !!a.manual_verified,
    admin: !!a.is_admin,
    verified: !!a.manual_verified || doms.some((d) => d.verified_at),
    passkeys: keys.results,
    domains: doms,
    links: links.results,
    slackIds: [...new Set(links.results.map((l) => l.slack_id).filter(Boolean))],
    comments: comments.results,
  }
}

// ---- linking other site accounts
async function linkService(env, a, service, secret) {
  secret = String(secret || '').trim()
  if (!secret || secret.length > 200) return fail(400, 'paste the token')
  let externalId, label, slackId = null
  if (service === 'vibetime') {
    const res = await env.VIBETIME.get(env.VIBETIME.idFromName('main')).fetch(new Request('https://vs.izie.top/api/v1/me', {
      method: 'POST', headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' }, body: '{}',
    }))
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.handle) return fail(400, "that vibetime token didn't work")
    externalId = data.handle
    label = `@${data.handle}`
  } else if (service === 'hmojis') {
    const info = await hmojiTokenInfo(env, secret)
    if (!info) return fail(400, "that isn't an active hmojis token")
    externalId = info.id
    label = info.name
    slackId = info.slackUserId
  } else return fail(404, 'unknown service')
  const taken = await env.COMMENTS.prepare('SELECT account_id FROM account_links WHERE service = ? AND external_id = ?').bind(service, externalId).first('account_id')
  if (taken && taken !== a.id) return fail(409, 'that is already linked to another izie account')
  await env.COMMENTS.prepare('INSERT OR REPLACE INTO account_links (service, external_id, account_id, label, slack_id, created) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(service, externalId, a.id, label, slackId, now()).run()
  return json({ ok: true })
}

// ---- Cloudflare one-click: the browser hands over a short-lived API token (DNS edit) once; it's used and dropped
async function cloudflareAdd(env, a, domain, cfToken) {
  cfToken = String(cfToken || '').trim()
  if (!/^[A-Za-z0-9_-]{30,80}$/.test(cfToken)) return fail(400, "that doesn't look like a Cloudflare API token")
  const row = await env.COMMENTS.prepare('SELECT token FROM account_domains WHERE account_id = ? AND domain = ?').bind(a.id, domain).first()
  if (!row) return fail(404, 'add the domain first')
  const cf = (path, init = {}) => fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init, headers: { authorization: `Bearer ${cfToken}`, 'content-type': 'application/json' },
  }).then((r) => r.json()).catch(() => ({ success: false }))
  const { zone } = await dnsHost(domain)
  const zones = await cf(`/zones?name=${encodeURIComponent(zone)}`)
  const zoneId = zones.result?.[0]?.id
  if (!zones.success || !zoneId) return fail(400, `that token can't see the ${zone} zone. give it Zone → DNS → Edit on ${zone}`)
  const name = txtName(domain)
  const content = txtValue(row.token)
  const existing = await cf(`/zones/${zoneId}/dns_records?type=TXT&name=${encodeURIComponent(name)}`)
  if (!existing.result?.some((r) => r.content.replace(/^"|"$/g, '') === content)) {
    const made = await cf(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify({ type: 'TXT', name, content: `"${content}"`, ttl: 120, comment: 'izie.top account verification' }),
    })
    if (!made.success) return fail(400, `cloudflare said: ${made.errors?.[0]?.message || 'no'}`)
  }
  return json({ ok: true, zone })
}

async function verifyDomain(env, a, domain) {
  const row = await env.COMMENTS.prepare('SELECT token FROM account_domains WHERE account_id = ? AND domain = ?').bind(a.id, domain).first()
  if (!row) return fail(404, 'add the domain first')
  if (!(await hasRecord(domain, row.token))) {
    return fail(400, `no matching TXT record at ${txtName(domain)} yet. new records can take a minute or two to show up`)
  }
  const parent = withParents(domain).slice(1)
  if (parent.length) {
    const owner = await domainOwner(env, parent[0])
    if (owner && owner !== a.id) return fail(409, `${parent[0]} is verified by another account, which covers ${domain} too`)
  }
  const other = await env.COMMENTS.prepare('SELECT account_id FROM account_domains WHERE domain = ? AND verified_at IS NOT NULL AND account_id != ?').bind(domain, a.id).first('account_id')
  // whoever controls the DNS right now wins: the old claim is dropped
  if (other) await env.COMMENTS.prepare('UPDATE account_domains SET verified_at = NULL WHERE domain = ? AND account_id = ?').bind(domain, other).run()
  await env.COMMENTS.prepare('UPDATE account_domains SET verified_at = ?, last_checked = ? WHERE account_id = ? AND domain = ?').bind(now(), now(), a.id, domain).run()
  return json({ ok: true })
}

// ---- router (account.izie.top/api/*)
export async function handleAccount(request, env, url) {
  if (!env.COMMENTS) return fail(503, 'accounts are not set up yet')
  const p = url.pathname.slice('/api/'.length).split('/')
  const m = request.method
  if (m !== 'GET' && (request.headers.get('origin') !== ACCOUNT_ORIGIN || request.headers.get('x-izie') !== '1')) return fail(403, 'bad origin')
  let body = {}
  if (m === 'POST' || m === 'PUT' || m === 'DELETE') {
    const text = await request.text()
    if (text.length > 64 << 10) return fail(413, 'too big')
    try { body = text ? JSON.parse(text) : {} } catch { return fail(400, 'bad json') }
  }
  try {
    if (p[0] === 'signup' && p[1] === 'options' && m === 'POST') return await signupOptions(request, env, body)
    if (p[0] === 'signup' && p[1] === 'verify' && m === 'POST') return await signupVerify(request, env, body)
    if (p[0] === 'login' && p[1] === 'options' && m === 'POST') {
      const { id, challenge } = await newChallenge(env, 'login')
      return json({ challengeId: id, options: { challenge, rpId: ACCOUNT_RP_ID, userVerification: 'required', timeout: 60000 } })
    }
    if (p[0] === 'login' && p[1] === 'verify' && m === 'POST') return await loginVerify(env, body)

    const a = await currentAccount(request, env)
    if (p[0] === 'me' && m === 'GET') return json({ account: a ? await profile(env, a) : null })
    if (!a) return fail(401, 'sign in first')

    if (p[0] === 'logout' && m === 'POST') {
      const t = readCookie(request)
      if (t) await env.COMMENTS.prepare('DELETE FROM account_sessions WHERE token_hash = ?').bind(await tokenHash(t)).run()
      return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) })
    }
    if (p[0] === 'me' && m === 'PUT') {
      const name = cleanName(body.name)
      if (!name) return fail(400, 'name needs 1-40 characters')
      await env.COMMENTS.prepare('UPDATE accounts SET display_name = ? WHERE id = ?').bind(name, a.id).run()
      return json({ ok: true })
    }
    if (p[0] === 'me' && m === 'DELETE') {
      if (body.confirm !== a.handle) return fail(400, 'type your username to confirm')
      await env.COMMENTS.batch([
        env.COMMENTS.prepare('UPDATE comments SET account_id = NULL WHERE account_id = ?').bind(a.id),
        ...['account_sessions', 'account_passkeys', 'account_domains', 'account_links'].map((t) => env.COMMENTS.prepare(`DELETE FROM ${t} WHERE account_id = ?`).bind(a.id)),
        env.COMMENTS.prepare('DELETE FROM accounts WHERE id = ?').bind(a.id),
      ])
      return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) })
    }

    if (p[0] === 'passkeys' && !p[1] && m === 'POST') {
      const { results } = await env.COMMENTS.prepare('SELECT id FROM account_passkeys WHERE account_id = ?').bind(a.id).all()
      const { id, challenge } = await newChallenge(env, 'add', { accountId: a.id })
      return json({ challengeId: id, options: creationOptions(challenge, a.id, a.handle, a.display_name, results.map((r) => r.id)) })
    }
    if (p[0] === 'passkeys' && p[1] === 'verify' && m === 'POST') {
      const ch = await takeChallenge(env, body.challengeId, 'add')
      if (!ch || ch.data.accountId !== a.id) return fail(400, 'that took too long, try again')
      await savePasskey(env, a.id, await readNewPasskey(body.response, ch.challenge), cleanName(body.label) || 'passkey')
      return json({ ok: true })
    }
    if (p[0] === 'passkeys' && p[1] && m === 'DELETE') {
      const n = await env.COMMENTS.prepare('SELECT COUNT(*) AS n FROM account_passkeys WHERE account_id = ?').bind(a.id).first('n')
      if (n <= 1) return fail(400, "that's your only passkey. add another one before removing it")
      const keep = await tokenHash(readCookie(request))
      await env.COMMENTS.batch([
        env.COMMENTS.prepare('DELETE FROM account_passkeys WHERE id = ? AND account_id = ?').bind(decodeURIComponent(p[1]), a.id),
        // a removed passkey may have been the lost one: sign out everywhere else too
        env.COMMENTS.prepare('DELETE FROM account_sessions WHERE account_id = ? AND token_hash != ?').bind(a.id, keep),
      ])
      return json({ ok: true })
    }

    if (p[0] === 'domains') {
      const domain = cleanDomain(p[1] ? decodeURIComponent(p[1]) : body.domain)
      if (!domain) return fail(400, "that doesn't look like a domain (like example.com)")
      if ((domain === 'izie.top' || domain.endsWith('.izie.top')) && !a.is_admin) return fail(400, "izie.top addresses can't be claimed")
      if (!p[1] && m === 'POST') {
        const count = await env.COMMENTS.prepare('SELECT COUNT(*) AS n FROM account_domains WHERE account_id = ?').bind(a.id).first('n')
        if (count >= 10) return fail(400, 'ten domains is the limit')
        await env.COMMENTS.prepare('INSERT OR IGNORE INTO account_domains (account_id, domain, token, created) VALUES (?, ?, ?, ?)').bind(a.id, domain, randomB64u(18), now()).run()
        return json({ ok: true, domain })
      }
      if (p[2] === 'dns' && m === 'GET') return json(await dnsHost(domain))
      if (p[2] === 'check' && m === 'POST') return await verifyDomain(env, a, domain)
      if (p[2] === 'cloudflare' && m === 'POST') return await cloudflareAdd(env, a, domain, body.token)
      if (!p[2] && m === 'DELETE') {
        await env.COMMENTS.prepare('DELETE FROM account_domains WHERE account_id = ? AND domain = ?').bind(a.id, domain).run()
        return json({ ok: true })
      }
    }

    // site admin (accounts.is_admin): the same controls as the blog editor's accounts list
    if (p[0] === 'admin') {
      if (!a.is_admin) return fail(403, 'admins only')
      if (p[1] === 'accounts') return await adminAccounts(request, env, p.slice(2), body)
      if (p[1] === 'who') {
        if (m === 'PUT') {
          if (!['anyone', 'verified'].includes(body.who)) return fail(400, 'bad setting')
          await env.COMMENTS.prepare("INSERT INTO settings (key, value) VALUES ('who', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").bind(body.who).run()
        }
        return json({ who: (await env.COMMENTS.prepare("SELECT value FROM settings WHERE key = 'who'").first('value')) ?? 'anyone' })
      }
    }
    if (p[0] === 'links' && p[1] && !p[2] && m === 'POST') return await linkService(env, a, p[1], body.token)
    if (p[0] === 'links' && p[1] && p[2] && m === 'DELETE') {
      await env.COMMENTS.prepare('DELETE FROM account_links WHERE account_id = ? AND service = ? AND external_id = ?').bind(a.id, p[1], decodeURIComponent(p[2])).run()
      return json({ ok: true })
    }
    return fail(404, 'not found')
  } catch (e) {
    return fail(400, e.message || 'failed')
  }
}

// ---- for izie in the blog editor (blog-admin.js, already behind the owner's passkey)
export async function adminAccounts(request, env, parts, body) {
  const db = env.COMMENTS
  if (!parts[0] && request.method === 'GET') {
    const { results } = await db.prepare(`
      SELECT a.id, a.handle, a.display_name, a.created, a.is_admin, a.manual_verified, a.manual_note, a.manual_at,
        (SELECT group_concat(domain, ' ') FROM account_domains d WHERE d.account_id = a.id AND d.verified_at IS NOT NULL) AS domains,
        (SELECT group_concat(service || ':' || COALESCE(label, external_id), ' · ') FROM account_links l WHERE l.account_id = a.id) AS links,
        (SELECT COUNT(*) FROM comments c WHERE c.account_id = a.id) AS comments
      FROM accounts a ORDER BY a.created DESC LIMIT 500`).all()
    return json(results)
  }
  if (parts[0] && request.method === 'PUT') {
    const on = !!body.verified
    const note = String(body.note ?? '').trim().slice(0, 500)
    if (on && !note) return json({ error: 'add a note on who this is' }, 400)
    await db.prepare('UPDATE accounts SET manual_verified = ?, manual_note = ?, manual_at = ? WHERE id = ?')
      .bind(on ? 1 : 0, note || null, on ? now() : null, decodeURIComponent(parts[0])).run()
    return json({ ok: true })
  }
  return json({ error: 'not found' }, 404)
}
