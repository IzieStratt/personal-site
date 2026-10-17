// Comments for the blog (blog.izie.top). Stored in D1 (binding COMMENTS); see blog/schema.sql.
// Public API only: read approved comments, add one. Moderation happens from the local editor
// through `wrangler d1`, so there are no admin endpoints here to protect.

const MODES = ['review', 'open', 'off']
const MAX_DEPTH = 4 // replies deeper than this attach to their depth-4 ancestor
const LIMITS = { name: 40, body: 2000, perMinute: 3, perDay: 20 }

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store' } })

const mode = async (db) =>
  (await db.prepare("SELECT value FROM settings WHERE key = 'mode'").first('value')) ?? 'review'

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
    const { results } = await db
      .prepare("SELECT id, parent, name, site, body, created FROM comments WHERE post = ? AND status = 'approved' ORDER BY created, id")
      .bind(post).all()
    return json({ mode: await mode(db), comments: results })
  }

  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // only our own pages may post
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return json({ error: 'bad origin' }, 403)

  let input
  try { input = await request.json() } catch { return json({ error: 'bad json' }, 400) }
  if (!input || typeof input !== 'object') return json({ error: 'bad json' }, 400)

  // a field real people never see; bots fill everything in. pretend it worked.
  if (input.website) return json({ ok: true, status: 'pending' })

  const post = String(input.post ?? '')
  const name = String(input.name ?? '').trim().replace(/\s+/g, ' ')
  const contact = String(input.contact ?? '')
  const body = String(input.body ?? '').replace(/\r\n/g, '\n').trim()
  let parent = input.parent == null || input.parent === '' ? null : Number(input.parent)

  if (!/^[a-z0-9-]{1,120}$/.test(post)) return json({ error: 'bad post' }, 400)
  if (!name || name.length > LIMITS.name) return json({ error: `name needs 1-${LIMITS.name} characters` }, 400)
  if (!body || body.length > LIMITS.body) return json({ error: `comment needs 1-${LIMITS.body} characters` }, 400)
  const email = contact.includes('@') ? cleanEmail(contact) : null
  const site = contact.includes('@') ? null : cleanDomain(contact)
  if (!email && !site) return json({ error: 'add a website domain (like example.com) or an email address' }, 400)

  const current = await mode(db)
  if (current === 'off') return json({ error: 'comments are turned off right now' }, 403)

  // the post has to exist, so nobody can park comments on made-up pages
  const page = await env.ASSETS.fetch(new URL(`/__subdomains/blog/post/${post}/`, url))
  if (!page.ok) return json({ error: 'no such post' }, 404)

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
    .prepare('INSERT INTO comments (post, parent, name, site, email, body, status, created, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(post, parent, name, site, email, body, status, now.toISOString(), ip).run()
  return json({ ok: true, status })
}
