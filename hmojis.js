// Server side of the hmojis (HMojis) Taut plugin, served at
// https://vs.izie.top/slack/hmojis/*. Public repo: nothing secret lives here.
// The only secret is the Slack bot token, a Cloudflare secret named
// HMOJI_SLACK_BOT_TOKEN. Everything else is in KV.
//
// Security model in one paragraph: the client is untrusted. A token is only
// ever minted by this server, for an already verified token holder. A token
// becomes usable only after its holder proves they control a Slack account by
// posting a one-time code, as themselves, into a DM with the bot; this server
// reads that message back from Slack and takes the author from Slack's own
// `user` field. Every token is then bound to a device key (ECDSA P-256, the
// private half never leaves the plugin's machine) and every request is signed.
// See hmojis/README.md for the full threat model and its limits.
//
// KV layout (HMOJI_TOKENS; raw tokens are 48 hex chars, every other key
// starts with "~" so the two can never collide):
//   <token>                    token record (see normalizeRecord), metadata = summary
//   ~ch:<id>                   verification challenge, 10 min TTL
//   ~inv:<inviterTid>:<tid>    outstanding invite marker (value: token), TTL = invite TTL
//   ~owner:<slackUserId>       token that owns that Slack account
//   ~devreq:<tid>:<keyId>      additional-device request awaiting the operator
//   ~flag:<tid>:<type>         behavioural flag on a token
//   ~seen:<tid>                last (device, ip, asn) seen, for overlap detection
//   ~ev:<tid>:<time>:<rand>    audit log entry, 90 day TTL
//   ~rl:<scope>:<key>:<window> rate limit counters
//   ~cfg:bot                   cached bot user id
//   ~banned:<slackUserId>      permanently barred account (no TTL)
//   ~removed:<slackUserId>     barred until the operator clears the key (no TTL)
// HMOJI_CONFIG: "config" (group key + emoji catalog), "security" (knobs), and
// "review:<id>" (pending emoji submissions, 7 day TTL - the image bytes are in
// HMOJI_IMAGES under ~review:<id> until the submission is decided).

const HMOJI_CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

const HMOJI_MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const HMOJI_MAX_SUBMIT_BYTES = 5 * 1024 * 1024
const MAX_BODY_BYTES = 4096
const REVIEW_TTL_SEC = 7 * 86400
const DAY = 86400_000
// Where the review-channel preview images live; the worker is always served
// under this origin (see worker.js), so there is no need to discover it.
const HMOJI_ORIGIN = 'https://vs.izie.top'
const DEFAULT_DECOY = ':neocat-ohno:'
const SUBMIT_NAME_RE = /^[A-Za-z0-9_-]{1,40}$/
const DECOY_RE = /^:[A-Za-z0-9_+-]+:$/
const REVIEW_ID_RE = /^[0-9a-f]{8}$/
const REVIEW_VERBS = new Set(['yes', 'no', 'ban', 'remove'])

const DEFAULT_SECURITY = {
  // false: legacy tokens that never registered a device keep working unsigned
  // (grace). true: they are refused until they enroll. Flip with the CLI.
  enforce: false,
  defaultQuota: 3,
  inviteTtlDays: 7,
  maxDevices: 3,
  maxSkewSec: 90,
  operatorSlackId: null,
  // channel id (like C0C4279MKTL) where member-submitted emojis go for review
  reviewChannel: null,
  notifyOwners: false,
}

const NOT_FOUND = () => new Response('Not found', { status: 404 })

const encoder = new TextEncoder()
const TOKEN_RE = /^[0-9a-f]{48}$/
const SLACK_ID_RE = /^[UW][A-Z0-9]{6,20}$/
const NONCE_RE = /^[A-Za-z0-9_-]{16,64}$/

// ---------------------------------------------------------------- helpers

function b64u(bytes) {
  let bin = ''
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function unb64u(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function sha256(input) {
  const data = typeof input === 'string' ? encoder.encode(input) : input
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data))
}

const toHex = (bytes) =>
  [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

async function tidOf(token) {
  return `t_${toHex(await sha256(token)).slice(0, 10)}`
}

function randomHex(bytes) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)))
}

// No 0/O/1/I/L: the code is read off a screen and typed by hand sometimes.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  const chars = [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length])
  return `hm-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      ...extra,
    },
  })
}

const fail = (status, error, extra = {}) => json(status, { ok: false, error, ...extra })

function clientInfo(request, env) {
  const ip = request.headers.get('cf-connecting-ip') ?? ''
  const asn = request.cf?.asn ?? null
  return {
    ip: ip || 'unknown',
    asn,
    country: request.cf?.country ?? null,
    ua: (request.headers.get('user-agent') ?? '').slice(0, 120),
  }
}

// ---------------------------------------------------------------- config

let securityCache = { at: 0, value: DEFAULT_SECURITY }
async function getSecurity(env) {
  const now = Date.now()
  if (now - securityCache.at < 30_000) return securityCache.value
  let stored = {}
  try {
    stored = (await env.HMOJI_CONFIG.get('security', 'json')) ?? {}
  } catch {}
  securityCache = { at: now, value: { ...DEFAULT_SECURITY, ...stored } }
  return securityCache.value
}

// ---------------------------------------------------------------- records
//
// Records written before this feature are just {name, slackUserId}. They are
// "legacy": active, no device, allowed unsigned while security.enforce is
// false. Everything this server creates has v: 2.

async function getRecord(env, token) {
  if (!TOKEN_RE.test(token)) return null
  const raw = await env.HMOJI_TOKENS.get(token)
  if (!raw) return null
  let parsed = {}
  try {
    const value = JSON.parse(raw)
    if (value && typeof value === 'object') parsed = value
  } catch {}
  const id = await tidOf(token)
  return {
    kind: 'legacy',
    status: 'active',
    identity: parsed.slackUserId ? 'admin' : 'unverified',
    everBound: false,
    devices: [],
    name: '(unnamed)',
    slackUserId: null,
    ...parsed,
    id,
  }
}

function recordMetadata(rec) {
  return {
    id: rec.id,
    n: String(rec.name ?? '').slice(0, 60),
    u: rec.slackUserId ?? null,
    k: rec.kind,
    s: rec.status,
    p: rec.invitedBy?.id ?? null,
    d: rec.devices?.length ?? 0,
    c: rec.createdAt ?? null,
  }
}

async function putRecord(env, token, rec, options = {}) {
  const { id: _id, ...stored } = rec
  await env.HMOJI_TOKENS.put(token, JSON.stringify({ v: 2, ...stored }), {
    metadata: recordMetadata(rec),
    ...options,
  })
}

const isGraceEligible = (rec) =>
  rec.kind === 'legacy' && !rec.everBound && rec.devices.length === 0

// ---------------------------------------------------------------- audit, flags, limits

async function logEvent(env, tid, type, detail = {}) {
  try {
    await env.HMOJI_TOKENS.put(
      `~ev:${tid}:${Date.now().toString(36)}:${randomHex(3)}`,
      JSON.stringify({ t: Date.now(), type, ...detail }),
      { expirationTtl: 90 * 86400 }
    )
  } catch {}
}

async function raiseFlag(env, tid, type, detail = {}, sev = 'warn') {
  try {
    const key = `~flag:${tid}:${type}`
    const cur = await env.HMOJI_TOKENS.get(key, 'json')
    const now = Date.now()
    // throttled: a hammering client must not turn into a KV write storm
    if (cur && now - cur.last < 60_000) return
    await env.HMOJI_TOKENS.put(
      key,
      JSON.stringify({
        type,
        sev,
        count: (cur?.count ?? 0) + 1,
        first: cur?.first ?? now,
        last: now,
        detail,
      }),
      { expirationTtl: 90 * 86400 }
    )
  } catch {}
}

/** Fixed-window counter. Returns false once the limit is hit (and stops writing). */
async function hit(env, scope, key, limit, windowSec) {
  const window = Math.floor(Date.now() / (windowSec * 1000))
  const k = `~rl:${scope}:${key}:${window}`
  const n = Number((await env.HMOJI_TOKENS.get(k)) ?? 0)
  if (n >= limit) return false
  await env.HMOJI_TOKENS.put(k, String(n + 1), {
    expirationTtl: Math.max(60, windowSec * 2),
  })
  return true
}

const tooMany = () => fail(429, 'rate_limited', { retryAfter: 60 })

// ---------------------------------------------------------------- Slack

async function slackCall(env, method, params = {}) {
  if (!env.HMOJI_SLACK_BOT_TOKEN) throw new SlackError('slack_not_configured')
  const base = env.HMOJI_SLACK_API_BASE || 'https://slack.com/api'
  let res
  try {
    res = await fetch(`${base}/${method}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.HMOJI_SLACK_BOT_TOKEN}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    })
  } catch {
    throw new SlackError('slack_unreachable')
  }
  if (res.status === 429) throw new SlackError('slack_rate_limited')
  const data = await res.json().catch(() => null)
  if (!data?.ok) throw new SlackError(data?.error ?? 'slack_error')
  return data
}

class SlackError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

async function getBotUserId(env) {
  const cached = await env.HMOJI_TOKENS.get('~cfg:bot')
  if (cached) return cached
  const me = await slackCall(env, 'auth.test')
  await env.HMOJI_TOKENS.put('~cfg:bot', me.user_id, { expirationTtl: 86400 })
  return me.user_id
}

/**
 * Reads the DM the plugin says it posted the code in and returns who Slack
 * says wrote it. The channel id is the client's claim and is not trusted: the
 * bot can only read conversations it is part of, the channel must be an IM,
 * and the author comes from the message's own `user` field.
 */
async function readProof(env, channel, code, sinceMs) {
  if (!/^D[A-Z0-9]{6,20}$/.test(channel)) return { status: 'invalid_channel' }
  const [info, botId] = await Promise.all([
    slackCall(env, 'conversations.info', { channel }),
    getBotUserId(env),
  ])
  if (!info.channel?.is_im) return { status: 'invalid_channel' }
  const history = await slackCall(env, 'conversations.history', {
    channel,
    oldest: String((sinceMs - 5000) / 1000),
    limit: '30',
  })
  const matches = (history.messages ?? [])
    .filter(
      (m) =>
        typeof m.text === 'string' &&
        m.text.includes(code) &&
        !m.bot_id &&
        !m.subtype &&
        m.user &&
        m.user !== botId
    )
    .sort((a, b) => Number(a.ts) - Number(b.ts))
  if (!matches.length) return { status: 'not_found' }
  const authors = new Set(matches.map((m) => m.user))
  if (authors.size > 1) return { status: 'ambiguous' }
  const author = matches[0].user
  if (info.channel.user && info.channel.user !== author) {
    return { status: 'channel_mismatch' }
  }
  return { status: 'ok', author, ts: matches[0].ts }
}

/** Best-effort DM from the bot; needs chat:write, silently skipped without it. */
async function notifySlack(env, userId, text) {
  if (!userId || !env.HMOJI_SLACK_BOT_TOKEN) return
  try {
    await slackCall(env, 'chat.postMessage', { channel: userId, text })
  } catch {}
}

// ---------------------------------------------------------------- keys and signatures

function cleanJwk(jwk) {
  if (
    !jwk ||
    jwk.kty !== 'EC' ||
    jwk.crv !== 'P-256' ||
    typeof jwk.x !== 'string' ||
    typeof jwk.y !== 'string' ||
    jwk.x.length !== 43 ||
    jwk.y.length !== 43 ||
    !/^[A-Za-z0-9_-]+$/.test(jwk.x + jwk.y)
  ) {
    return null
  }
  return { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y }
}

async function keyIdOf(jwk) {
  return b64u(await sha256(`${jwk.x}.${jwk.y}`)).slice(0, 22)
}

const importedKeys = new Map()
async function importVerifyKey(keyId, jwk) {
  let key = importedKeys.get(keyId)
  if (!key) {
    key = await crypto.subtle.importKey(
      'jwk',
      { ...jwk, ext: true },
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    )
    if (importedKeys.size > 500) importedKeys.clear()
    importedKeys.set(keyId, key)
  }
  return key
}

/**
 * Checks the request's signature against `jwk`. The signed string is
 * "HM1\n<METHOD>\n<path+query>\n<ts ms>\n<nonce>\n<sha256 hex of body or empty>".
 * Returns null when valid, or {error, extra} (see sigResponse).
 */
const sigError = (error, extra = {}) => ({ error, extra })
const sigResponse = (e) => fail(401, e.error, e.extra)

async function checkSignature(request, env, url, bodyText, jwk, keyId) {
  const sec = await getSecurity(env)
  const ts = Number(request.headers.get('x-hm-ts'))
  const nonce = request.headers.get('x-hm-nonce') ?? ''
  const sig = request.headers.get('x-hm-sig') ?? ''
  if (!Number.isFinite(ts) || !NONCE_RE.test(nonce) || !sig) {
    return sigError('bad_signature_headers')
  }
  const now = Date.now()
  if (Math.abs(now - ts) > sec.maxSkewSec * 1000) {
    return sigError('stale_timestamp', { serverTime: now })
  }
  let valid = false
  try {
    const bodyHash = bodyText ? toHex(await sha256(bodyText)) : ''
    const signed = ['HM1', request.method, url.pathname + url.search, ts, nonce, bodyHash].join('\n')
    valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      await importVerifyKey(keyId, jwk),
      unb64u(sig),
      encoder.encode(signed)
    )
  } catch {}
  if (!valid) return sigError('bad_signature')

  // Replay: a nonce is accepted once per colo. Cache API, not KV, because images
  // are signed too and KV writes are metered; a cross-colo replay is bounded by
  // the timestamp window above.
  const nonceUrl = `https://nonce.hmojis.invalid/${keyId}/${nonce}`
  try {
    if (await caches.default.match(nonceUrl)) return sigError('replay')
    await caches.default.put(
      nonceUrl,
      new Response('1', {
        headers: { 'cache-control': `public, max-age=${sec.maxSkewSec * 2 + 30}` },
      })
    )
  } catch {}
  return null
}

// ---------------------------------------------------------------- authentication

async function readBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return ''
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_BODY_BYTES) return null
  const text = await request.text()
  return text.length > MAX_BODY_BYTES ? null : text
}

function bearer(request) {
  const [scheme, token] = (request.headers.get('authorization') ?? '').split(' ')
  return scheme === 'Bearer' && TOKEN_RE.test(token ?? '') ? token : undefined
}

function unknownToken(env, ctx, ci) {
  // Uniform 404, but cap how fast one address may probe.
  return hit(env, 'authfail', ci.ip, 60, 300).then((ok) =>
    ok ? NOT_FOUND() : tooMany()
  )
}

/**
 * Authenticates a token holder that must already be active.
 *   allowGrace: legacy tokens with no device may pass unsigned (bootstrap and
 *   images only, and only while security.enforce is off).
 * Returns {rec, token, keyId, grace} or {res} with the error to send.
 */
async function authenticate(request, env, ctx, url, bodyText, { allowGrace }) {
  const ci = clientInfo(request, env)
  const token = bearer(request)
  if (!token) return { res: await unknownToken(env, ctx, ci) }
  const rec = await getRecord(env, token)
  if (!rec || rec.status !== 'active') {
    return { res: await unknownToken(env, ctx, ci) }
  }
  const sec = await getSecurity(env)
  const keyId = request.headers.get('x-hm-key') ?? ''
  const signed = request.headers.has('x-hm-sig')
  const bound = rec.devices.length > 0 || rec.everBound

  if (!bound) {
    if (allowGrace && isGraceEligible(rec) && !sec.enforce) {
      ctx.waitUntil(trackSeen(env, rec, null, ci))
      return { rec, token, keyId: null, grace: true, ci }
    }
    return { res: fail(401, 'enrollment_required') }
  }

  if (!signed) {
    ctx.waitUntil(
      raiseFlag(env, rec.id, 'unsigned_on_bound', { ip: ci.ip, asn: ci.asn }, 'high')
    )
    return { res: fail(401, 'signature_required') }
  }
  const device = rec.devices.find((d) => d.keyId === keyId)
  if (!device) {
    ctx.waitUntil(
      raiseFlag(env, rec.id, 'unknown_device', { keyId, ip: ci.ip, asn: ci.asn }, 'high')
    )
    return { res: fail(401, 'unknown_device') }
  }
  const bad = await checkSignature(request, env, url, bodyText, device.jwk, keyId)
  if (bad) {
    // a stale clock is not an attack; a wrong signature or a replay is
    if (bad.error !== 'stale_timestamp') {
      ctx.waitUntil(
        raiseFlag(env, rec.id, bad.error === 'replay' ? 'replay' : 'bad_signature', { keyId, ip: ci.ip, asn: ci.asn }, 'high')
      )
    }
    return { res: sigResponse(bad) }
  }
  ctx.waitUntil(trackSeen(env, rec, keyId, ci))
  return { rec, token, keyId, grace: false, ci }
}

/** Notes where a token is used from; flags overlapping devices or networks. */
async function trackSeen(env, rec, keyId, ci) {
  try {
    const key = `~seen:${rec.id}`
    const cur = await env.HMOJI_TOKENS.get(key, 'json')
    const now = Date.now()
    const changed =
      !cur || cur.keyId !== keyId || cur.ip !== ci.ip || cur.asn !== ci.asn
    if (cur && changed && now - cur.ts < 20 * 60_000) {
      // null -> key is the same machine finishing enrollment, not a second device
      if (cur.keyId && keyId && cur.keyId !== keyId) {
        await raiseFlag(env, rec.id, 'two_devices_overlap', { from: cur, to: { keyId, ip: ci.ip, asn: ci.asn } })
      } else if (cur.keyId !== keyId) {
        // enrollment moved from unsigned to signed; nothing suspicious
      } else if (cur.asn !== ci.asn) {
        await raiseFlag(env, rec.id, 'concurrent_asn', { from: cur, to: { ip: ci.ip, asn: ci.asn } }, 'info')
      } else {
        await raiseFlag(env, rec.id, 'concurrent_ip', { from: cur.ip, to: ci.ip }, 'info')
      }
    }
    // writes are metered: refresh an unchanged record only every 10 minutes
    if (!cur || changed || now - cur.ts > 10 * 60_000) {
      await env.HMOJI_TOKENS.put(
        key,
        JSON.stringify({ keyId, ip: ci.ip, asn: ci.asn, ts: now }),
        { expirationTtl: 3600 }
      )
    }
  } catch {}
}

// ---------------------------------------------------------------- image + bootstrap routes

async function handleBootstrap(request, env, ctx, url) {
  const auth = await authenticate(request, env, ctx, url, '', { allowGrace: true })
  if (auth.res) return auth.res
  const config = await env.HMOJI_CONFIG.get('config')
  if (!config) return NOT_FOUND()
  // never cached anywhere: this response is the group key and secret catalog
  return new Response(config, {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

async function handlePlugin(env) {
  // Deliberately not token-gated: it is only the plugin's code, and it has to
  // be pasteable into Taut's "Import URL" field, which cannot send headers.
  const plugin = await env.HMOJI_ASSETS.get('plugin.js', 'arrayBuffer')
  if (!plugin) return NOT_FOUND()
  return new Response(plugin, {
    headers: { 'content-type': 'application/javascript', 'cache-control': 'no-store' },
  })
}

async function handleImage(request, env, ctx, url, id) {
  const auth = await authenticate(request, env, ctx, url, '', { allowGrace: true })
  if (auth.res) return auth.res

  const ext = id.slice(id.lastIndexOf('.') + 1).toLowerCase()
  const contentType = HMOJI_CONTENT_TYPES[ext]

  if (request.method === 'PUT') {
    // Off by default; see wrangler.jsonc. Note PUT bodies are not covered by the
    // signature (the signed body hash is for small JSON bodies), so this stays off.
    if (env.HMOJI_ALLOW_TOKEN_UPLOAD !== 'true') {
      return new Response('Uploads are disabled', { status: 403 })
    }
    if (!contentType) return new Response('Unsupported file extension', { status: 400 })
    const body = await request.arrayBuffer()
    if (body.byteLength === 0 || body.byteLength > HMOJI_MAX_UPLOAD_BYTES) {
      return new Response('Bad file size', { status: 413 })
    }
    await env.HMOJI_IMAGES.put(id, body)
    return new Response('Uploaded', { status: 201 })
  }
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const image = await env.HMOJI_IMAGES.get(id, 'arrayBuffer')
  if (!image) return NOT_FOUND()
  return new Response(image, {
    headers: {
      'content-type': contentType ?? 'application/octet-stream',
      'cache-control': 'private, max-age=3600',
    },
  })
}

// ---------------------------------------------------------------- api: whoami

async function describe(env, rec, sec, extra = {}) {
  const outstanding = await countInvites(env, rec.id)
  return {
    ok: true,
    id: rec.id,
    ownerSlackId: rec.slackUserId,
    identity: rec.identity,
    canInvite: canInvite(rec),
    quota: { max: rec.quota ?? sec.defaultQuota, outstanding },
    invitedBySlackId: rec.invitedBy?.slackUserId ?? null,
    activatedAt: rec.activatedAt ?? null,
    devices: rec.devices.map((d) => ({ keyId: d.keyId, addedAt: d.addedAt })),
    serverTime: Date.now(),
    ...extra,
  }
}

const canInvite = (rec) =>
  rec.status === 'active' &&
  rec.canInvite !== false &&
  !!rec.slackUserId &&
  rec.devices.length > 0 &&
  (rec.identity === 'verified' || rec.identity === 'admin')

const canSubmit = (rec) =>
  rec.status === 'active' &&
  !!rec.slackUserId &&
  rec.devices.length > 0 &&
  (rec.identity === 'verified' || rec.identity === 'admin')

async function readGroupConfig(env) {
  const raw = await env.HMOJI_CONFIG.get('config')
  if (!raw) return { groupKey: undefined, emojis: {} }
  try {
    const parsed = JSON.parse(raw)
    return { groupKey: parsed.groupKey, emojis: parsed.emojis ?? {} }
  } catch {
    return { groupKey: undefined, emojis: {} }
  }
}

async function handleWhoami(request, env, ctx, url) {
  const ci = clientInfo(request, env)
  const token = bearer(request)
  if (!token) return unknownToken(env, ctx, ci)
  if (!(await hit(env, 'whoami', ci.ip, 60, 60))) return tooMany()
  const rec = await getRecord(env, token)
  if (!rec || rec.status === 'revoked') {
    // Only the friendly whoami route says why; every other route returns the
    // uniform 404 so a guessed token learns nothing. Saying it here is safe:
    // whoever holds the token already possessed it, and the plugin needs the
    // signal to tell a removed/banned person why their plugin is dead.
    if (rec?.slackUserId) {
      const barred =
        (await env.HMOJI_TOKENS.get(`~banned:${rec.slackUserId}`)) ??
        (await env.HMOJI_TOKENS.get(`~removed:${rec.slackUserId}`))
      if (barred) {
        return json(403, {
          ok: false,
          state: 'removed',
          error: 'access_removed',
          serverTime: Date.now(),
        })
      }
    }
    return unknownToken(env, ctx, ci)
  }
  const sec = await getSecurity(env)
  const now = Date.now()

  if (rec.status === 'pending') {
    if (rec.expiresAt && rec.expiresAt < now) return unknownToken(env, ctx, ci)
    return json(200, {
      ok: true,
      state: 'pending',
      expiresAt: rec.expiresAt,
      invitedBySlackId: rec.invitedBy?.slackUserId ?? null,
      serverTime: now,
    })
  }

  const keyId = request.headers.get('x-hm-key') ?? ''
  const signed = request.headers.has('x-hm-sig')
  const device = rec.devices.find((d) => d.keyId === keyId)

  if (signed && device) {
    const bad = await checkSignature(request, env, url, '', device.jwk, keyId)
    if (bad) return sigResponse(bad)
    ctx.waitUntil(trackSeen(env, rec, keyId, ci))
    return json(200, await describe(env, rec, sec, { state: 'active' }))
  }

  // no device registered (never, or reset by the operator): bind this one
  if (rec.devices.length === 0) {
    if (isGraceEligible(rec) && !sec.enforce) {
      return json(200, { ok: true, state: 'grace', serverTime: now })
    }
    return json(200, { ok: true, state: 'enrollment_required', serverTime: now })
  }
  // bound, but this caller has no valid registered key
  let pending = false
  if (signed && keyId) {
    pending = !!(await env.HMOJI_TOKENS.get(`~devreq:${rec.id}:${keyId}`))
  }
  if (!signed) {
    ctx.waitUntil(raiseFlag(env, rec.id, 'unsigned_whoami_on_bound', { ip: ci.ip, asn: ci.asn }, 'info'))
  }
  return json(200, {
    ok: true,
    state: pending ? 'device_pending' : 'device_required',
    serverTime: now,
  })
}

// ---------------------------------------------------------------- api: verification

const CHALLENGE_TTL_SEC = 600
const MAX_WRONG_ATTEMPTS = 5
const MAX_POLLS = 40

async function handleVerifyStart(request, env, ctx, url, bodyText) {
  const ci = clientInfo(request, env)
  const token = bearer(request)
  if (!token) return unknownToken(env, ctx, ci)
  let body
  try {
    body = JSON.parse(bodyText)
  } catch {
    return fail(400, 'bad_json')
  }
  const jwk = cleanJwk(body?.publicKey)
  const purpose = body?.purpose
  if (!jwk || !['activate', 'bind', 'device'].includes(purpose)) return fail(400, 'bad_request')
  const keyId = await keyIdOf(jwk)
  if (request.headers.get('x-hm-key') !== keyId) return fail(400, 'key_mismatch')

  const rec = await getRecord(env, token)
  if (!rec || rec.status === 'revoked') return unknownToken(env, ctx, ci)
  if (
    !(await hit(env, 'vstart-ip', ci.ip, 20, 3600)) ||
    !(await hit(env, 'vstart-tok', rec.id, 6, 3600))
  ) {
    return tooMany()
  }
  // The candidate key signs the request: proves the caller holds the private half.
  const bad = await checkSignature(request, env, url, bodyText, jwk, keyId)
  if (bad) return sigResponse(bad)

  const now = Date.now()
  if (purpose === 'activate') {
    if (rec.status !== 'pending' || (rec.expiresAt && rec.expiresAt < now)) {
      return fail(409, 'not_pending')
    }
  } else {
    if (rec.status !== 'active') return fail(409, 'not_active')
    const hasDevices = rec.devices.length > 0
    if (purpose === 'bind' && hasDevices) return fail(409, 'already_bound')
    if (purpose === 'device') {
      if (!hasDevices) return fail(409, 'not_bound')
      if (rec.devices.some((d) => d.keyId === keyId)) return fail(409, 'already_registered')
    }
  }
  if (!env.HMOJI_SLACK_BOT_TOKEN) return fail(503, 'verification_unavailable')

  let botUserId
  try {
    botUserId = await getBotUserId(env)
  } catch (err) {
    return fail(502, 'slack_unavailable', { detail: err.code })
  }

  const code = newCode()
  const id = randomHex(16)
  await env.HMOJI_TOKENS.put(
    `~ch:${id}`,
    JSON.stringify({
      tid: rec.id,
      purpose,
      jwk,
      keyId,
      code,
      createdAt: now,
      attempts: 0,
      polls: 0,
      consumed: false,
      ip: ci.ip,
    }),
    { expirationTtl: CHALLENGE_TTL_SEC }
  )
  ctx.waitUntil(logEvent(env, rec.id, 'verify_start', { purpose, keyId, ip: ci.ip, asn: ci.asn }))
  return json(200, {
    ok: true,
    challengeId: id,
    code,
    text: `hmoji verify ${code}`,
    botUserId,
    expiresAt: now + CHALLENGE_TTL_SEC * 1000,
  })
}

async function handleVerifyConfirm(request, env, ctx, url, bodyText) {
  const ci = clientInfo(request, env)
  const token = bearer(request)
  if (!token) return unknownToken(env, ctx, ci)
  let body
  try {
    body = JSON.parse(bodyText)
  } catch {
    return fail(400, 'bad_json')
  }
  if (typeof body?.challengeId !== 'string' || !/^[0-9a-f]{32}$/.test(body.challengeId)) {
    return fail(400, 'bad_request')
  }
  const rec = await getRecord(env, token)
  if (!rec || rec.status === 'revoked') return unknownToken(env, ctx, ci)
  if (
    !(await hit(env, 'vconf-ip', ci.ip, 120, 3600)) ||
    !(await hit(env, 'vconf-tok', rec.id, 120, 3600))
  ) {
    return tooMany()
  }

  const chKey = `~ch:${body.challengeId}`
  const ch = await env.HMOJI_TOKENS.get(chKey, 'json')
  if (!ch || ch.tid !== rec.id) return fail(404, 'unknown_challenge')
  const bad = await checkSignature(request, env, url, bodyText, ch.jwk, ch.keyId)
  if (bad) return sigResponse(bad)
  if (ch.consumed) return fail(409, 'challenge_used')
  const ttlLeft = ch.createdAt + CHALLENGE_TTL_SEC * 1000 - Date.now()
  if (ttlLeft <= 0) return fail(410, 'challenge_expired')
  const keepTtl = { expirationTtl: Math.max(60, Math.ceil(ttlLeft / 1000)) }

  if (ch.polls >= MAX_POLLS) return tooMany()
  const channel = typeof body.channel === 'string' ? body.channel : ''

  let proof
  try {
    proof = await readProof(env, channel, ch.code, ch.createdAt)
  } catch (err) {
    return fail(502, 'slack_unavailable', { detail: err.code })
  }

  if (proof.status === 'not_found' || proof.status === 'invalid_channel') {
    ch.polls++
    if (proof.status === 'invalid_channel') ch.attempts++
    if (ch.attempts >= MAX_WRONG_ATTEMPTS) ch.consumed = true
    await env.HMOJI_TOKENS.put(chKey, JSON.stringify(ch), keepTtl)
    if (ch.consumed) {
      ctx.waitUntil(raiseFlag(env, rec.id, 'verify_locked', { purpose: ch.purpose, ip: ci.ip }))
      return fail(403, 'too_many_attempts')
    }
    if (proof.status === 'invalid_channel') return fail(400, 'invalid_channel')
    return json(202, { ok: true, status: 'waiting' })
  }
  if (proof.status !== 'ok') {
    ch.attempts++
    ch.consumed = ch.attempts >= MAX_WRONG_ATTEMPTS
    await env.HMOJI_TOKENS.put(chKey, JSON.stringify(ch), keepTtl)
    ctx.waitUntil(raiseFlag(env, rec.id, 'verify_anomaly', { status: proof.status, ip: ci.ip }))
    return fail(403, proof.status)
  }

  // Single use: burn the challenge before acting on it.
  ch.consumed = true
  await env.HMOJI_TOKENS.put(chKey, JSON.stringify(ch), keepTtl)
  return applyProof(request, env, ctx, token, rec, ch, proof.author, ci)
}

async function applyProof(request, env, ctx, token, rec, ch, author, ci) {
  const sec = await getSecurity(env)
  // A barred account can never re-verify, even if a fresh invite token exists.
  if (author) {
    const barred =
      (await env.HMOJI_TOKENS.get(`~banned:${author}`)) ??
      (await env.HMOJI_TOKENS.get(`~removed:${author}`))
    if (barred) {
      let kind = 'blocked'
      try {
        kind = JSON.parse(barred).kind ?? kind
      } catch {}
      ctx.waitUntil(logEvent(env, rec.id, 'verify_blocked', { author, kind, ip: ci.ip, asn: ci.asn }))
      return fail(403, 'access_removed')
    }
  }
  const now = Date.now()
  const device = {
    keyId: ch.keyId,
    jwk: ch.jwk,
    addedAt: now,
    ip: ci.ip,
    asn: ci.asn,
    country: ci.country,
    ua: ci.ua,
  }
  const attempt = { purpose: ch.purpose, author, keyId: ch.keyId, ip: ci.ip, asn: ci.asn }

  if (ch.purpose === 'activate') {
    // re-read: it may have been revoked or activated while the proof was pending
    const fresh = await getRecord(env, token)
    if (!fresh || fresh.status !== 'pending' || (fresh.expiresAt && fresh.expiresAt < now)) {
      return fail(409, 'not_pending')
    }
    const conflict = await ownerConflict(env, author, token)
    if (conflict) {
      ctx.waitUntil(logEvent(env, fresh.id, 'activate_refused', { ...attempt, reason: 'already_member' }))
      if (fresh.invitedBy) {
        ctx.waitUntil(logEvent(env, fresh.invitedBy.id, 'invite_refused_already_member', { invitee: fresh.id, author }))
      }
      return fail(409, 'already_member')
    }
    const hintMismatch = !!fresh.hint && fresh.hint !== author
    const next = {
      ...fresh,
      status: 'active',
      slackUserId: author,
      identity: 'verified',
      verifiedAt: now,
      activatedAt: now,
      expiresAt: undefined,
      devices: [device],
      everBound: true,
      hintMismatch,
    }
    await putRecord(env, token, next)
    await env.HMOJI_TOKENS.put(`~owner:${author}`, token)
    if (fresh.invitedBy) await env.HMOJI_TOKENS.delete(`~inv:${fresh.invitedBy.id}:${fresh.id}`)
    ctx.waitUntil(logEvent(env, fresh.id, 'activated', attempt))
    if (fresh.invitedBy) {
      ctx.waitUntil(logEvent(env, fresh.invitedBy.id, 'invite_activated', { invitee: fresh.id, author, hint: fresh.hint ?? null }))
    }
    if (hintMismatch) {
      const detail = { hint: fresh.hint, actual: author, inviter: fresh.invitedBy?.slackUserId }
      ctx.waitUntil(raiseFlag(env, fresh.id, 'hint_mismatch', detail))
      if (fresh.invitedBy) ctx.waitUntil(raiseFlag(env, fresh.invitedBy.id, 'invite_hint_mismatch', detail))
    }
    return json(200, { ok: true, status: 'activated', ownerSlackId: author, hintMismatch })
  }

  if (ch.purpose === 'bind') {
    const fresh = await getRecord(env, token)
    if (!fresh || fresh.status !== 'active' || fresh.devices.length > 0) return fail(409, 'not_bindable')
    if (fresh.slackUserId && fresh.slackUserId !== author) {
      ctx.waitUntil(logEvent(env, fresh.id, 'bind_wrong_account', attempt))
      ctx.waitUntil(raiseFlag(env, fresh.id, 'identity_mismatch', { expected: fresh.slackUserId, actual: author, ip: ci.ip }, 'high'))
      return fail(403, 'wrong_account')
    }
    const claimed = !fresh.slackUserId
    const next = {
      ...fresh,
      slackUserId: author,
      identity: claimed ? 'claimed' : fresh.identity === 'admin' ? 'admin' : 'verified',
      verifiedAt: now,
      devices: [device],
      everBound: true,
    }
    await putRecord(env, token, next)
    if (!(await env.HMOJI_TOKENS.get(`~owner:${author}`))) {
      await env.HMOJI_TOKENS.put(`~owner:${author}`, token)
    }
    ctx.waitUntil(logEvent(env, fresh.id, 'bound', attempt))
    // A legacy token with no recorded owner goes to whoever verifies first. It
    // is accepted (nobody is locked out) but stands out for the operator.
    if (claimed) ctx.waitUntil(raiseFlag(env, fresh.id, 'legacy_claim', { author, ip: ci.ip, asn: ci.asn }, 'info'))
    return json(200, { ok: true, status: 'bound', ownerSlackId: author })
  }

  // device: an additional machine. The owner's proof is necessary, never sufficient.
  const fresh = await getRecord(env, token)
  if (!fresh || fresh.status !== 'active') return fail(409, 'not_active')
  if (fresh.slackUserId !== author) {
    ctx.waitUntil(logEvent(env, fresh.id, 'device_request_wrong_account', attempt))
    ctx.waitUntil(raiseFlag(env, fresh.id, 'identity_mismatch', { expected: fresh.slackUserId, actual: author, ip: ci.ip }, 'high'))
    return fail(403, 'wrong_account')
  }
  await env.HMOJI_TOKENS.put(
    `~devreq:${fresh.id}:${ch.keyId}`,
    JSON.stringify({
      tid: fresh.id,
      name: fresh.name,
      owner: author,
      invitedBy: fresh.invitedBy ?? null,
      keyId: ch.keyId,
      jwk: ch.jwk,
      ip: ci.ip,
      asn: ci.asn,
      country: ci.country,
      ua: ci.ua,
      createdAt: now,
    }),
    { expirationTtl: 7 * 86400 }
  )
  ctx.waitUntil(logEvent(env, fresh.id, 'device_request', attempt))
  ctx.waitUntil(
    notifySlack(
      env,
      sec.operatorSlackId,
      `hmojis: ${fresh.name} (<@${author}>) asked to add a second device (key ${ch.keyId.slice(0, 8)}, ip ${ci.ip}, AS${ci.asn ?? '?'}). Review: bun scripts/hmoji.ts requests`
    )
  )
  return json(200, { ok: true, status: 'awaiting_approval', keyId: ch.keyId })
}

async function ownerConflict(env, slackId, exceptToken) {
  const other = await env.HMOJI_TOKENS.get(`~owner:${slackId}`)
  if (!other || other === exceptToken) return false
  const rec = await getRecord(env, other)
  return !!rec && rec.status === 'active'
}

// ---------------------------------------------------------------- api: invites

async function countInvites(env, tid) {
  const listed = await env.HMOJI_TOKENS.list({ prefix: `~inv:${tid}:`, limit: 100 })
  return listed.keys.length
}

async function handleInviteCreate(request, env, ctx, url, bodyText) {
  const auth = await authenticate(request, env, ctx, url, bodyText, { allowGrace: false })
  if (auth.res) return auth.res
  const { rec, ci } = auth
  const sec = await getSecurity(env)
  if (!canInvite(rec)) return fail(403, 'cannot_invite')
  const admin = rec.identity === 'admin'
  if (!admin && !(await hit(env, 'invite', rec.id, 10, 86400))) return tooMany()

  let body = {}
  try {
    body = bodyText ? JSON.parse(bodyText) : {}
  } catch {
    return fail(400, 'bad_json')
  }
  const hint = typeof body.friend === 'string' && SLACK_ID_RE.test(body.friend) ? body.friend : null
  const friendName = typeof body.friendName === 'string' ? body.friendName.slice(0, 60) : ''
  if (hint && hint === rec.slackUserId) return fail(400, 'cannot_invite_self')

  const quota = rec.quota ?? sec.defaultQuota
  const outstanding = await countInvites(env, rec.id)
  if (!admin && outstanding >= quota) return fail(429, 'quota_exceeded', { quota, outstanding })

  const now = Date.now()
  const ttlSec = Math.round(sec.inviteTtlDays * 86400)
  const newToken = randomHex(24)
  const child = {
    kind: 'invite',
    status: 'pending',
    identity: 'unverified',
    name: friendName || 'invitee',
    slackUserId: null,
    devices: [],
    everBound: false,
    invitedBy: { id: rec.id, slackUserId: rec.slackUserId },
    hint,
    createdAt: now,
    expiresAt: now + ttlSec * 1000,
    id: await tidOf(newToken),
  }
  await putRecord(env, newToken, child, { expirationTtl: ttlSec + 3600 })
  await env.HMOJI_TOKENS.put(`~inv:${rec.id}:${child.id}`, newToken, { expirationTtl: ttlSec })
  ctx.waitUntil(logEvent(env, rec.id, 'invite_created', { invitee: child.id, hint, ip: ci.ip }))
  return json(200, {
    ok: true,
    id: child.id,
    token: newToken,
    expiresAt: child.expiresAt,
    quota: { max: quota, outstanding: outstanding + 1 },
  })
}

async function handleInviteCancel(request, env, ctx, url, bodyText) {
  const auth = await authenticate(request, env, ctx, url, bodyText, { allowGrace: false })
  if (auth.res) return auth.res
  let body
  try {
    body = JSON.parse(bodyText)
  } catch {
    return fail(400, 'bad_json')
  }
  if (typeof body?.id !== 'string' || !/^t_[0-9a-f]{10}$/.test(body.id)) return fail(400, 'bad_request')
  const marker = `~inv:${auth.rec.id}:${body.id}`
  const childToken = await env.HMOJI_TOKENS.get(marker)
  if (!childToken) return fail(404, 'no_such_invite')
  const child = await getRecord(env, childToken)
  if (child?.status === 'pending') {
    await putRecord(env, childToken, {
      ...child,
      status: 'revoked',
      revokedAt: Date.now(),
      revokedReason: 'cancelled by inviter',
    })
  }
  await env.HMOJI_TOKENS.delete(marker)
  ctx.waitUntil(logEvent(env, auth.rec.id, 'invite_cancelled', { invitee: body.id }))
  return json(200, { ok: true })
}

async function handleInvites(request, env, ctx, url) {
  const auth = await authenticate(request, env, ctx, url, '', { allowGrace: false })
  if (auth.res) return auth.res
  const sec = await getSecurity(env)
  const listed = await env.HMOJI_TOKENS.list({ prefix: `~inv:${auth.rec.id}:`, limit: 100 })
  return json(200, {
    ok: true,
    outstanding: listed.keys.map((k) => k.name.split(':')[2]),
    quota: { max: auth.rec.quota ?? sec.defaultQuota, outstanding: listed.keys.length },
  })
}

// ---------------------------------------------------------------- review channel
//
// Any verified member can submit a new hidden emoji. It is not published: the
// image bytes and a "review:<id>" record are parked, and the bot posts a
// message with the preview + four buttons to whatever channel `security
// reviewChannel` points at. Only the operator (security.operatorSlackId,
// checked against the acting Slack user) can decide:
//   yes     -> published to the catalog for everyone
//   no      -> declined, submitter is told
//   ban     -> the submitter's ORIGINAL token(s) and everyone they invited are
//              revoked, and the Slack account is permanently barred
//   remove  -> only the submitter's own tokens are revoked (people they invited
//              keep working), and the account can't verify again until the
//              operator clears the ~removed marker (CLI: kv delete)
// The buttons are Slack block actions POSTed to /slack/hmojis/review. Slack
// button styles only support primary (green) and danger (red), so "ban" and
// "remove" are default-styled with a leading emoji rather than the blue/purple
// a full palette would allow. The same decisions exist on the CLI
// (bun scripts/hmoji.ts review <id> <yes|no|ban|remove>), which needs no
// Slack interactive request URL at all.

function sniffImage(bytes) {
  if (
    bytes.byteLength >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' }
  }
  if (bytes.byteLength >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return { ext: 'jpg', mime: 'image/jpeg' }
  }
  if (
    bytes.byteLength >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return { ext: 'gif', mime: 'image/gif' }
  }
  if (
    bytes.byteLength >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: 'webp', mime: 'image/webp' }
  }
  return null
}

function reviewBlocks(review) {
  const preview = `${HMOJI_ORIGIN}/slack/hmojis/review-image/${review.id}`
  const confirm = (title, text) => ({
    confirm: {
      title: { type: 'plain_text', text: title },
      text: { type: 'plain_text', text },
      style: 'danger',
      confirm: { type: 'plain_text', text: 'Confirm' },
      deny: { type: 'plain_text', text: 'Cancel' },
    },
  })
  return [
    { type: 'header', text: { type: 'plain_text', text: 'New HMojis submission' } },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<@${review.submitterSlackId}> wants to add <${preview}|::${review.name}::>`,
      },
    },
    { type: 'image', image_url: preview, alt_text: review.name },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `trigger \`::${review.name}::\`  ·  decoy ${review.decoy}` },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ Yes · approve', emoji: true },
          style: 'primary',
          value: `${review.id}:yes`,
          action_id: 'hm_review',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ No · decline', emoji: true },
          style: 'danger',
          value: `${review.id}:no`,
          action_id: 'hm_review',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '🚫 Ban', emoji: true },
          value: `${review.id}:ban`,
          action_id: 'hm_review',
          ...confirm('Ban this person?', 'Revokes their tokens and everyone they invited, and bars the account permanently.'),
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '♻️ Remove', emoji: true },
          value: `${review.id}:remove`,
          action_id: 'hm_review',
          ...confirm('Remove this person?', 'Revokes only their own tokens. People they invited keep working, but the plugin on their computer stops working and the account cannot verify again.'),
        },
      ],
    },
  ]
}

async function handleSubmit(request, env, ctx, url) {
  // The image arrives base64-encoded inside JSON, so the body can be a few MB:
  // read it raw instead of through readBody's 4 KiB cap, and cap the decoded
  // image. The signature covers the whole body, so nothing can be swapped.
  const raw = await request.text()
  if (raw.length > HMOJI_MAX_SUBMIT_BYTES * 2) return fail(413, 'too_large')
  const auth = await authenticate(request, env, ctx, url, raw, { allowGrace: false })
  if (auth.res) return auth.res
  const { rec } = auth
  const sec = await getSecurity(env)
  if (!canSubmit(rec)) return fail(403, 'cannot_submit')
  if (!sec.reviewChannel) return fail(409, 'review_not_configured')
  if (!(await hit(env, 'submit', rec.id, 5, 3600))) return tooMany()

  let body = {}
  try {
    body = JSON.parse(raw)
  } catch {
    return fail(400, 'bad_json')
  }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const decoy = typeof body.decoy === 'string' ? body.decoy.trim() : ''
  if (!SUBMIT_NAME_RE.test(name)) return fail(400, 'bad_name')
  if (decoy && !DECOY_RE.test(decoy)) return fail(400, 'bad_decoy')
  let bytes
  try {
    bytes = unb64u(typeof body.image === 'string' ? body.image : '')
  } catch {
    return fail(400, 'bad_image')
  }
  if (!bytes?.byteLength) return fail(400, 'bad_image')
  if (bytes.byteLength > HMOJI_MAX_SUBMIT_BYTES) return fail(413, 'too_large')
  const sniff = sniffImage(bytes)
  if (!sniff) return fail(400, 'unsupported_image')

  const group = await readGroupConfig(env)
  if (!group.groupKey) return fail(409, 'not_ready')
  if (group.emojis[name]) return fail(409, 'name_taken')

  const now = Date.now()
  // 8 hex chars: matches REVIEW_ID_RE everywhere (preview route, callback, CLI).
  const id = randomHex(4)
  const review = {
    id,
    tid: rec.id,
    name,
    decoy: decoy || DEFAULT_DECOY,
    ext: sniff.ext,
    imgType: sniff.mime,
    submitterSlackId: rec.slackUserId,
    submitterName: String(rec.name ?? 'someone'),
    status: 'pending',
    createdAt: now,
  }
  await env.HMOJI_IMAGES.put(`~review:${id}`, bytes)
  await env.HMOJI_CONFIG.put(`review:${id}`, JSON.stringify(review), {
    expirationTtl: REVIEW_TTL_SEC,
  })
  ctx.waitUntil(logEvent(env, rec.id, 'emoji_submitted', { review: id, name }))

  // Post the review-card to Slack. If that fails the submission still exists
  // (the operator can decide it with the CLI), we just tell the client no.
  let posted = false
  if (env.HMOJI_SLACK_BOT_TOKEN) {
    try {
      const message = await slackCall(env, 'chat.postMessage', {
        channel: sec.reviewChannel,
        blocks: JSON.stringify(reviewBlocks(review)),
        text: `HMojis review: ::${name}:: from <@${rec.slackUserId}>`,
      })
      posted = true
      await env.HMOJI_CONFIG.put(
        `review:${id}`,
        JSON.stringify({ ...review, posted: true, channel: message.channel, messageTs: message.ts }),
        { expirationTtl: REVIEW_TTL_SEC }
      )
    } catch (err) {
      ctx.waitUntil(
        logEvent(env, rec.id, 'emoji_submit_post_failed', { review: id, error: err.code ?? 'slack' })
      )
    }
  }
  return json(201, { ok: true, id, status: 'pending', posted })
}

/** Public by design: it is exactly what Slack renders inside the review card. */
async function handleReviewImage(request, env, ctx, url, id) {
  if (!REVIEW_ID_RE.test(id)) return NOT_FOUND()
  const ci = clientInfo(request, env)
  if (!(await hit(env, 'reviewimg', ci.ip, 120, 300))) return tooMany()
  const metaRaw = await env.HMOJI_CONFIG.get(`review:${id}`)
  const image = await env.HMOJI_IMAGES.get(`~review:${id}`, 'arrayBuffer')
  if (!image || !metaRaw) return NOT_FOUND()
  let mime = 'image/png'
  try {
    mime = JSON.parse(metaRaw).imgType || mime
  } catch {}
  return new Response(image, {
    headers: { 'content-type': mime, 'cache-control': 'private, max-age=300' },
  })
}

/** Slack interactive callback: /slack/hmojis/review (form field "payload"). */
async function handleReviewCallback(request, env, ctx, url) {
  if (request.method !== 'POST') return NOT_FOUND()
  const text = await request.text()
  let payload = null
  try {
    payload = JSON.parse(new URLSearchParams(text).get('payload') ?? '')
  } catch {}
  if (!payload || payload.type !== 'block_actions') {
    return new Response('ignored', { status: 200 })
  }
  const action = Array.isArray(payload.actions) ? payload.actions[0] : null
  const [id, verb] = String(action?.value ?? '').split(':')
  if (!action || action.action_id !== 'hm_review' || !REVIEW_ID_RE.test(id) || !REVIEW_VERBS.has(verb)) {
    return new Response('ignored', { status: 200 })
  }
  const sec = await getSecurity(env)
  const actor = payload.user?.id
  if (!actor || actor !== sec.operatorSlackId) {
    ctx.waitUntil(logEvent(env, id, 'review_nonoperator', { actor: actor ?? 'unknown', verb }))
    return new Response('Only the operator can act on reviews', { status: 200 })
  }
  const review = await env.HMOJI_CONFIG.get(`review:${id}`, 'json')
  if (!review) return new Response('This review is no longer pending', { status: 200 })
  if (review.status !== 'pending') return new Response('Already decided', { status: 200 })
  if (review.messageTs && payload.message?.ts && payload.message.ts !== review.messageTs) {
    return new Response('Message mismatch', { status: 200 })
  }
  try {
    await decideReview(env, ctx, sec, review, verb, actor)
  } catch (err) {
    console.error('hmojis review decide failed', err?.stack ?? err)
  }
  // Slack needs a fast ack; any failure above already leaves the review pending.
  return new Response('ok', { status: 200 })
}

async function decideReview(env, ctx, sec, review, verb, actor) {
  const outcome = await applyDecision(env, ctx, review, verb, actor)
  const summary = `Review #${review.id} (\`::${review.name}::\`) decided by <@${actor}>: ${outcome.title}`
  if (review.channel && review.messageTs && env.HMOJI_SLACK_BOT_TOKEN) {
    try {
      await slackCall(env, 'chat.update', {
        channel: review.channel,
        ts: review.messageTs,
        blocks: JSON.stringify(
          [
            { type: 'section', text: { type: 'mrkdwn', text: summary } },
            outcome.extra
              ? { type: 'section', text: { type: 'mrkdwn', text: outcome.extra } }
              : null,
          ].filter(Boolean)
        ),
        text: summary,
      })
    } catch {}
  }
}

async function applyDecision(env, ctx, review, verb, actor) {
  const decidedAt = Date.now()
  if (verb === 'yes') {
    const image = await env.HMOJI_IMAGES.get(`~review:${review.id}`, 'arrayBuffer')
    if (!image) {
      await env.HMOJI_CONFIG.put(
        `review:${review.id}`,
        JSON.stringify({ ...review, status: 'failed', decidedBy: actor, decidedAt }),
        { expirationTtl: REVIEW_TTL_SEC }
      )
      return { title: 'failed (image is gone)', extra: null }
    }
    const group = await readGroupConfig(env)
    if (group.emojis[review.name]) {
      await env.HMOJI_CONFIG.put(
        `review:${review.id}`,
        JSON.stringify({ ...review, status: 'conflict', decidedBy: actor, decidedAt }),
        { expirationTtl: REVIEW_TTL_SEC }
      )
      return { title: 'conflict (::name:: already published)', extra: null }
    }
    const finalId = `${review.name}.${review.ext}`
    await env.HMOJI_IMAGES.put(finalId, image)
    group.emojis[review.name] = { id: finalId, decoy: review.decoy }
    await env.HMOJI_CONFIG.put('config', JSON.stringify(group))
    await env.HMOJI_IMAGES.delete(`~review:${review.id}`)
    await env.HMOJI_CONFIG.put(
      `review:${review.id}`,
      JSON.stringify({ ...review, status: 'approved', decidedBy: actor, decidedAt }),
      { expirationTtl: REVIEW_TTL_SEC }
    )
    ctx.waitUntil(logEvent(env, review.tid, 'emoji_approved', { review: review.id, name: review.name, by: actor }))
    ctx.waitUntil(notifySlack(env, review.submitterSlackId, `Your ::${review.name}:: hmoji was approved and is live.`))
    return { title: '✅ approved', extra: `::${review.name}:: is now live for everyone in the group.` }
  }
  if (verb === 'no') {
    await env.HMOJI_CONFIG.delete(`review:${review.id}`)
    await env.HMOJI_IMAGES.delete(`~review:${review.id}`)
    ctx.waitUntil(logEvent(env, review.tid, 'emoji_declined', { review: review.id, name: review.name, by: actor }))
    ctx.waitUntil(notifySlack(env, review.submitterSlackId, `Your ::${review.name}:: hmoji submission was declined.`))
    return { title: '❌ declined', extra: null }
  }
  // ban vs remove both revoke; ban cascades down the invite subtree and is final.
  const banned = verb === 'ban'
  await revokeForSlack(env, ctx, {
    slackUserId: review.submitterSlackId,
    rootTid: review.tid,
    cascade: banned,
    kind: banned ? 'banned' : 'removed',
  })
  await env.HMOJI_CONFIG.put(
    `review:${review.id}`,
    JSON.stringify({ ...review, status: verb, decidedBy: actor, decidedAt }),
    { expirationTtl: REVIEW_TTL_SEC }
  )
  ctx.waitUntil(logEvent(env, review.tid, banned ? 'member_banned' : 'member_removed', { review: review.id, by: actor }))
  ctx.waitUntil(notifySlack(env, review.submitterSlackId, `Your HMojis access was ${banned ? 'removed and your account is banned' : 'removed'}.`))
  return {
    title: banned ? '🚫 banned' : '♻️ removed',
    extra: banned
      ? 'Their tokens and everyone they invited were revoked; the account cannot verify again.'
      : 'Only their own tokens were revoked; people they invited keep working.',
  }
}

/**
 * Revokes token(s). Called with cascade=true the whole invite subtree under
 * rootTid goes too. The Slack account gets a permanent marker so a fresh
 * invite can never re-verify it (see applyProof).
 */
async function revokeForSlack(env, ctx, { slackUserId, rootTid, cascade, kind }) {
  const marker = kind === 'banned' ? `~banned:${slackUserId}` : `~removed:${slackUserId}`
  await env.HMOJI_TOKENS.put(
    marker,
    JSON.stringify({ kind, at: Date.now(), root: rootTid ?? null })
  )
  const doomed = new Map() // tid -> token
  const frontier = new Set(rootTid ? [rootTid] : [])
  let cursor
  do {
    const page = await env.HMOJI_TOKENS.list({ limit: 1000, cursor })
    let added = false
    for (const key of page.keys) {
      if (!TOKEN_RE.test(key.name)) continue
      const rec = await getRecord(env, key.name)
      if (!rec || rec.status !== 'active' || doomed.has(rec.id)) continue
      if (rec.slackUserId === slackUserId || (cascade && frontier.has(rec.invitedBy?.id))) {
        doomed.set(rec.id, key.name)
        frontier.add(rec.id)
        added = true
      }
    }
    if (!added) break
    cursor = page.cursor
  } while (cursor)
  for (const [tid, token] of doomed) {
    const rec = await getRecord(env, token)
    await putRecord(env, token, {
      ...rec,
      status: 'revoked',
      revokedAt: Date.now(),
      revokedReason: kind,
    })
    const ownerKey = rec.slackUserId ? `~owner:${rec.slackUserId}` : null
    if (ownerKey && (await env.HMOJI_TOKENS.get(ownerKey)) === token) {
      await env.HMOJI_TOKENS.delete(ownerKey)
    }
    for (const prefix of [`~inv:${tid}:`, `~devreq:${tid}:`]) {
      const markers = await env.HMOJI_TOKENS.list({ prefix })
      for (const m of markers.keys) await env.HMOJI_TOKENS.delete(m.name)
    }
    ctx.waitUntil(logEvent(env, tid, kind, { by: 'review' }))
  }
}

// ---------------------------------------------------------------- api router

async function handleApi(request, env, ctx, url, name) {
  // Submissions carry a base64 image, far beyond readBody's 4 KiB cap; the
  // handler reads the raw body itself (the signed body is still verified).
  if (name === 'emoji/submit') return handleSubmit(request, env, ctx, url)
  const body = await readBody(request)
  if (body === null) return fail(413, 'too_large')
  switch (`${request.method} ${name}`) {
    case 'GET whoami':
      return handleWhoami(request, env, ctx, url)
    case 'GET invites':
      return handleInvites(request, env, ctx, url)
    case 'POST verify/start':
      return handleVerifyStart(request, env, ctx, url, body)
    case 'POST verify/confirm':
      return handleVerifyConfirm(request, env, ctx, url, body)
    case 'POST invite/create':
      return handleInviteCreate(request, env, ctx, url, body)
    case 'POST invite/cancel':
      return handleInviteCancel(request, env, ctx, url, body)
    default:
      return NOT_FOUND()
  }
}

// ---------------------------------------------------------------- entry

// The plugin fetches with the page's own native fetch(), so real CORS applies.
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, PUT, POST, OPTIONS',
  'access-control-allow-headers':
    'Authorization, Content-Type, X-Hm-Key, X-Hm-Ts, X-Hm-Nonce, X-Hm-Sig',
  'access-control-expose-headers': 'X-Hm-Server-Time',
  'access-control-max-age': '86400',
}

function withCors(response) {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value)
  headers.set('x-hm-server-time', String(Date.now()))
  return new Response(response.body, { status: response.status, headers })
}

export async function handleHmoji(request, env, ctx, pathname) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  const url = new URL(request.url)
  const rest = pathname.slice('/slack/hmojis/'.length)
  let response
  try {
    if (rest === 'bootstrap') {
      response = await handleBootstrap(request, env, ctx, url)
    } else if (rest === 'plugin.js') {
      response = await handlePlugin(env)
    } else if (rest === 'review') {
      // Slack interactive-callback POST (form-encoded "payload"). Non-POST
      // requests already get NOT_FOUND from the handler.
      response = await handleReviewCallback(request, env, ctx, url)
    } else if (rest.startsWith('review-image/')) {
      if (request.method !== 'GET') response = NOT_FOUND()
      else response = await handleReviewImage(request, env, ctx, url, rest.slice('review-image/'.length))
    } else if (rest.startsWith('api/')) {
      response = await handleApi(request, env, ctx, url, rest.slice(4))
    } else {
      const id = decodeURIComponent(rest)
      response =
        !id || id.includes('/') || id.includes('..')
          ? NOT_FOUND()
          : await handleImage(request, env, ctx, url, id)
    }
  } catch (err) {
    console.error('hmojis error', err?.stack ?? err)
    response = fail(500, 'internal_error')
  }
  return withCors(response)
}
