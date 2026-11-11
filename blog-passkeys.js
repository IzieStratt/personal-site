// Passkey (WebAuthn) login for the online blog editor. Only one owner; passkeys and sessions live in the
// izie-blog D1 database (see blog/schema.sql). Nothing secret is stored in plain text: sessions are hashed.
export const RP_ID = 'blog.izie.top'
export const ORIGIN = `https://${RP_ID}`
const CHALLENGE_MS = 5 * 60_000
const SESSION_MS = 12 * 3600_000
export const SESSION_COOKIE = '__Host-blog_session'

const enc = new TextEncoder()
const b64uBytes = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
export const randomB64u = (n = 32) => b64uBytes(crypto.getRandomValues(new Uint8Array(n)))
export function fromB64u(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='))
  return Uint8Array.from(b, (c) => c.charCodeAt(0))
}
const sha256 = async (bytes) => new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

export function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ---- minimal CBOR (RFC 8949) decoder: enough for attestationObject and COSE keys
function cbor(bytes, start = 0) {
  let pos = start
  const readLen = (ai) => {
    if (ai < 24) return ai
    if (ai === 24) return bytes[pos++]
    if (ai === 25) { const v = (bytes[pos] << 8) | bytes[pos + 1]; pos += 2; return v }
    if (ai === 26) { const v = new DataView(bytes.buffer, bytes.byteOffset + pos, 4).getUint32(0); pos += 4; return v }
    throw new Error('cbor: unsupported length')
  }
  const item = () => {
    const head = bytes[pos++]
    const major = head >> 5
    const ai = head & 31
    if (major === 0) return readLen(ai)
    if (major === 1) return -1 - readLen(ai)
    if (major === 2 || major === 3) {
      const n = readLen(ai)
      const v = bytes.slice(pos, pos + n)
      pos += n
      return major === 2 ? v : new TextDecoder().decode(v)
    }
    if (major === 4) { const n = readLen(ai); return Array.from({ length: n }, item) }
    if (major === 5) {
      const n = readLen(ai)
      const m = new Map()
      for (let i = 0; i < n; i++) { const k = item(); m.set(k, item()) }
      return m
    }
    throw new Error('cbor: unsupported type')
  }
  const value = item()
  return { value, end: pos }
}

// ---- WebAuthn helpers
function parseClientData(b64u, expectedType, expectedChallenge) {
  const cd = JSON.parse(new TextDecoder().decode(fromB64u(b64u)))
  if (cd.type !== expectedType) throw new Error('wrong ceremony')
  if (cd.challenge !== expectedChallenge) throw new Error('challenge mismatch')
  if (cd.origin !== ORIGIN) throw new Error('wrong origin')
  return cd
}

// flags: 0x01 user present, 0x04 user verified (PIN/biometric), 0x40 attested credential data
function parseAuthData(bytes) {
  const rpIdHash = bytes.slice(0, 32)
  const flags = bytes[32]
  const signCount = new DataView(bytes.buffer, bytes.byteOffset + 33, 4).getUint32(0)
  return { rpIdHash, flags, signCount, rest: bytes.slice(37) }
}

async function checkRpAndFlags(auth) {
  const want = await sha256(enc.encode(RP_ID))
  if (hex(auth.rpIdHash) !== hex(want)) throw new Error('wrong relying party')
  if (!(auth.flags & 0x01) || !(auth.flags & 0x04)) throw new Error('passkey must be used with user verification')
}

// COSE EC2 P-256 key -> JWK
function coseToJwk(map) {
  if (map.get(1) !== 2 || map.get(-1) !== 1) throw new Error('only ES256 P-256 keys are accepted')
  return { kty: 'EC', crv: 'P-256', x: b64uBytes(map.get(-2)), y: b64uBytes(map.get(-3)) }
}

// WebAuthn signatures are DER; WebCrypto wants raw r||s
function derToRaw(der) {
  let p = der[1] < 0x80 ? 2 : 3 // skip the SEQUENCE header (long-form length takes one more byte)
  const readInt = () => {
    if (der[p] !== 0x02) throw new Error('bad signature')
    const n = der[p + 1]
    let v = der.slice(p + 2, p + 2 + n)
    p += 2 + n
    while (v.length > 32 && v[0] === 0) v = v.slice(1)
    if (v.length > 32) throw new Error('bad signature')
    const out = new Uint8Array(32)
    out.set(v, 32 - v.length)
    return out
  }
  const r = readInt()
  const s = readInt()
  const raw = new Uint8Array(64)
  raw.set(r, 0)
  raw.set(s, 32)
  return raw
}

// ---- challenges (single use, 5 minutes)
export async function newChallenge(env, purpose) {
  const id = randomB64u(16)
  const challenge = randomB64u(32)
  await env.COMMENTS.prepare('INSERT INTO challenges (id, challenge, purpose, expires) VALUES (?, ?, ?, ?)')
    .bind(id, challenge, purpose, Date.now() + CHALLENGE_MS).run()
  return { id, challenge }
}

// returns the challenge value and deletes it, or null if missing/expired/wrong purpose
async function takeChallenge(env, id, purpose) {
  if (typeof id !== 'string' || id.length > 64) return null
  const row = await env.COMMENTS.prepare('SELECT challenge, purpose, expires FROM challenges WHERE id = ?').bind(id).first()
  await env.COMMENTS.prepare('DELETE FROM challenges WHERE id = ?').bind(id).run()
  if (!row || row.purpose !== purpose || row.expires < Date.now()) return null
  return row.challenge
}

export const passkeyCount = (env) =>
  env.COMMENTS.prepare('SELECT COUNT(*) AS n FROM passkeys').first('n').then((n) => Number(n) || 0)

// ---- registration (attestation "none": we only need the public key)
export async function finishRegistration(env, body) {
  const challenge = await takeChallenge(env, body.challengeId, 'register')
  if (!challenge) throw new Error('that sign-in expired, try again')
  parseClientData(body.response.clientDataJSON, 'webauthn.create', challenge)
  const att = cbor(fromB64u(body.response.attestationObject)).value
  const auth = parseAuthData(att.get('authData'))
  await checkRpAndFlags(auth)
  if (!(auth.flags & 0x40)) throw new Error('no credential in response')
  // attested credential data: aaguid(16) credIdLen(2) credId cosePublicKey
  const rest = auth.rest
  const credLen = (rest[16] << 8) | rest[17]
  const credId = rest.slice(18, 18 + credLen)
  const key = cbor(rest, 18 + credLen).value
  const jwk = coseToJwk(key)
  const id = b64uBytes(credId)
  await env.COMMENTS.prepare('INSERT INTO passkeys (id, public_key, sign_count, created) VALUES (?, ?, ?, ?)')
    .bind(id, JSON.stringify(jwk), auth.signCount, new Date().toISOString()).run()
  return { id }
}

// ---- login (discoverable credentials: no username needed)
export async function finishLogin(env, body) {
  const challenge = await takeChallenge(env, body.challengeId, 'login')
  if (!challenge) throw new Error('that sign-in expired, try again')
  const r = body.response
  parseClientData(r.clientDataJSON, 'webauthn.get', challenge)
  const row = await env.COMMENTS.prepare('SELECT public_key, sign_count FROM passkeys WHERE id = ?').bind(String(body.id)).first()
  if (!row) throw new Error('unknown passkey')
  const authBytes = fromB64u(r.authenticatorData)
  const auth = parseAuthData(authBytes)
  await checkRpAndFlags(auth)
  const cdHash = await sha256(fromB64u(r.clientDataJSON))
  const signed = new Uint8Array(authBytes.length + 32)
  signed.set(authBytes, 0)
  signed.set(cdHash, authBytes.length)
  const key = await crypto.subtle.importKey('jwk', JSON.parse(row.public_key), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
  const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, derToRaw(fromB64u(r.signature)), signed)
  if (!ok) throw new Error('signature check failed')
  // a counter that goes backwards means a cloned authenticator; counters of 0 mean the device doesn't count
  if ((auth.signCount || row.sign_count) && auth.signCount <= row.sign_count) throw new Error('passkey counter went backwards')
  await env.COMMENTS.prepare('UPDATE passkeys SET sign_count = ?, last_used = ? WHERE id = ?')
    .bind(auth.signCount, new Date().toISOString(), String(body.id)).run()
  return createSession(env)
}

// ---- sessions
export async function createSession(env) {
  const token = randomB64u(32)
  const hash = hex(await sha256(enc.encode(token)))
  await env.COMMENTS.prepare('INSERT INTO sessions (token_hash, expires) VALUES (?, ?)').bind(hash, Date.now() + SESSION_MS).run()
  return {
    token,
    cookie: `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MS / 1000}`,
  }
}

export async function isSignedIn(request, env) {
  const cookie = request.headers.get('cookie') || ''
  const token = cookie.split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1)
  if (!token || token.length > 128) return false
  const hash = hex(await sha256(enc.encode(token)))
  await env.COMMENTS.prepare('DELETE FROM sessions WHERE expires < ?').bind(Date.now()).run()
  const row = await env.COMMENTS.prepare('SELECT expires FROM sessions WHERE token_hash = ?').bind(hash).first()
  return !!row && row.expires > Date.now()
}

export async function endSession(request, env) {
  const cookie = request.headers.get('cookie') || ''
  const token = cookie.split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1)
  if (token) await env.COMMENTS.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hex(await sha256(enc.encode(token)))).run()
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}

// options JSON for the browser
export const creationOptions = (challenge, userId, excludeIds) => ({
  challenge,
  rp: { id: RP_ID, name: 'izie blog' },
  user: { id: userId, name: 'owner', displayName: 'owner' },
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
  attestation: 'none',
  excludeCredentials: excludeIds.map((id) => ({ type: 'public-key', id })),
  timeout: 60000,
})

export const requestOptions = (challenge) => ({ challenge, rpId: RP_ID, userVerification: 'required', timeout: 60000 })
