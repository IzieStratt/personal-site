// Comments for the blog (blog.izie.top). Stored in D1 (binding COMMENTS); see blog/schema.sql.
// Public API only: read approved comments, add one. Moderation lives in the blog editor (blog-admin.js),
// behind a passkey sign-in, so there are no admin endpoints here.
// Signed-in izie accounts (account.js) comment as themselves. A domain verified by an account can only be used
// by that account, and the blog can be set to take comments only from verified accounts (settings key 'who').
import { currentAccount, domainOwner, isVerified, verifiedDomains } from './account.js'

const MODES = ['review', 'open', 'off']
const MAX_DEPTH = 4 // replies deeper than this attach to their depth-4 ancestor
const LIMITS = { name: 40, body: 2000, perMinute: 3, perDay: 20 }

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store' } })

// each built post page says what its author wants in <meta name="comments">: default | on | locked | off
async function postSetting(env, url, post) {
  const page = await env.ASSETS.fetch(new URL(`/__subdomains/blog/post/${post}/`, url))
  if (!page.ok) return null
  return (await page.text()).match(/<meta name="comments" content="(\w+)">/)?.[1] ?? 'default'
}

// the blog-wide mode, adjusted by the post: off and locked win; "on" opens a post even when the blog is off
// (its comments are held for review then)
const effective = (blog, setting) =>
  setting === 'off' || setting === 'locked' ? setting : setting === 'on' && blog === 'off' ? 'review' : blog

const mode = async (db) =>
  (await db.prepare("SELECT value FROM settings WHERE key = 'mode'").first('value')) ?? 'review'

// anyone | verified
const who = async (db) =>
  (await db.prepare("SELECT value FROM settings WHERE key = 'who'").first('value')) ?? 'anyone'

// what the comment form needs to know about whoever is looking at it
async function viewer(request, env) {
  const a = await currentAccount(request, env)
  if (!a) return null
  return { handle: a.handle, name: a.display_name, domains: await verifiedDomains(env, a.id), verified: await isVerified(env, a) }
}

// "https://www.Example.com/about" -> "example.com"; null when it isn't a domain
function cleanDomain(raw) {
  const host = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0]
  return /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ? host : null
}

const cleanEmail = (raw) => {
  const e = raw.trim().toLowerCase()
  return e.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(e) ? e : null
}

async function hashIp(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const data = new TextEncoder().encode(`${env.COMMENT_SALT || 'blog'}:${ip}`)
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function handleComments(request, env, url) {
  const db = env.COMMENTS
  if (!db) return json({ error: 'comments are not set up yet' }, 503)

  if (request.method === 'GET') {
    const post = url.searchParams.get('post') || ''
    if (!/^[a-z0-9-]{1,120}$/.test(post)) return json({ error: 'bad post' }, 400)
    const setting = await postSetting(env, url, post)
    if (setting === null) return json({ error: 'no such post' }, 404)
    const shown = effective(await mode(db), setting)
    const [whoCan, me] = await Promise.all([who(db), viewer(request, env)])
    if (shown === 'off') return json({ mode: 'off', who: whoCan, viewer: me, comments: [] })
    const { results } = await db
      .prepare("SELECT c.id, c.parent, c.name, c.site, c.body, c.created, a.handle AS account FROM comments c LEFT JOIN accounts a ON a.id = c.account_id WHERE c.post = ? AND c.status = 'approved' ORDER BY c.created, c.id")
      .bind(post).all()
    return json({ mode: shown, who: whoCan, viewer: me, comments: results })
  }

  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // only our own pages may post
  // (strict: the account cookie is shared across *.izie.top, so a missing Origin isn't trusted either)
  if (request.headers.get('origin') !== url.origin) return json({ error: 'bad origin' }, 403)

  let input
  try { input = await request.json() } catch { return json({ error: 'bad json' }, 400) }
  if (!input || typeof input !== 'object') return json({ error: 'bad json' }, 400)

  // a field real people never see; bots fill everything in. pretend it worked.
  if (input.website) return json({ ok: true, status: 'pending' })

  const post = String(input.post ?? '')
  let name = String(input.name ?? '').trim().replace(/\s+/g, ' ')
  const contact = String(input.contact ?? '')
  const body = String(input.body ?? '').replace(/\r\n/g, '\n').trim()
  let parent = input.parent == null || input.parent === '' ? null : Number(input.parent)

  if (!/^[a-z0-9-]{1,120}$/.test(post)) return json({ error: 'bad post' }, 400)
  if (!name || name.length > LIMITS.name) return json({ error: `name needs 1-${LIMITS.name} characters` }, 400)
  if (!body || body.length > LIMITS.body) return json({ error: `comment needs 1-${LIMITS.body} characters` }, 400)
  const account = await currentAccount(request, env)
  // signed-in comments always carry the account's own name, so nobody can post as someone else next to the ✓
  if (account) name = account.display_name
  let email = null
  let site = null
  if (account) {
    // signed in: the domain is optional, and has to be one of theirs
    if (contact.trim()) {
      site = cleanDomain(contact)
      if (!site) return json({ error: 'pick one of your verified domains, or leave it empty' }, 400)
    }
  } else {
    email = contact.includes('@') ? cleanEmail(contact) : null
    site = contact.includes('@') ? null : cleanDomain(contact)
    if (!email && !site) return json({ error: 'add a website domain (like example.com) or an email address' }, 400)
  }
  if (site) {
    const owner = await domainOwner(env, site)
    if (account && owner !== account.id) {
      return json({ error: `verify ${site} on your account first (account.izie.top), or leave the domain empty` }, 403)
    }
    if (!account && owner) return json({ error: `${site} is verified by an izie account. sign in at account.izie.top to use it` }, 403)
  }
  if ((await who(db)) === 'verified' && !(await isVerified(env, account))) {
    return json({ error: account
      ? 'comments are only open to verified accounts right now. verify a domain at account.izie.top'
      : 'comments are only open to verified accounts right now. sign in at account.izie.top' }, 403)
  }

  // the post has to exist, so nobody can park comments on made-up pages
  const setting = await postSetting(env, url, post)
  if (setting === null) return json({ error: 'no such post' }, 404)
  const current = effective(await mode(db), setting)
  if (current === 'locked') return json({ error: 'this post is closed to new comments' }, 403)
  if (current === 'off') return json({ error: 'comments are turned off right now' }, 403)

  if (parent !== null) {
    if (!Number.isInteger(parent)) return json({ error: 'bad parent' }, 400)
    const row = await db.prepare("SELECT id, parent, post FROM comments WHERE id = ? AND status = 'approved'").bind(parent).first()
    if (!row || row.post !== post) return json({ error: 'that comment is gone' }, 404)
    let depth = 1
    for (let up = row.parent; up !== null; depth++) {
      up = (await db.prepare('SELECT parent FROM comments WHERE id = ?').bind(up).first('parent'))
    }
    // already at the deepest level: reply next to it instead of under it
    if (depth >= MAX_DEPTH) parent = row.parent
  }

  const ip = await hashIp(request, env)
  const now = new Date()
  const minuteAgo = new Date(now - 60_000).toISOString()
  const dayAgo = new Date(now - 86_400_000).toISOString()
  const recent = await db
    .prepare('SELECT SUM(created > ?) AS minute, COUNT(*) AS day FROM comments WHERE ip_hash = ? AND created > ?')
    .bind(minuteAgo, ip, dayAgo).first()
  if ((recent?.minute ?? 0) >= LIMITS.perMinute || (recent?.day ?? 0) >= LIMITS.perDay) {
    return json({ error: 'slow down a little, then try again' }, 429)
  }

  const status = current === 'open' ? 'approved' : 'pending'
  await db
    .prepare('INSERT INTO comments (post, parent, name, site, email, body, status, created, ip_hash, account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(post, parent, name, site, email, body, status, now.toISOString(), ip, account?.id ?? null).run()
  return json({ ok: true, status })
}
