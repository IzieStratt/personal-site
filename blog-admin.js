// Online blog editor + comment moderation for blog.izie.top (routed from worker.js).
// Sign-in is a passkey (blog-passkeys.js). Writes go to the repo through the GitHub API (blog-github.js);
// the blog-build workflow builds the pages and archives links after each push. Moderation reads D1 directly.
import { ORIGIN, creationOptions, createSession, endSession, finishLogin, finishRegistration, isSignedIn, newChallenge, passkeyCount, randomB64u, requestOptions, timingSafeEqual } from './blog-passkeys.js'
import { deleteFile, fileSha, gitBlobSha, listDir, putFile, readText } from './blog-github.js'
import { COMMENT_SETTINGS, parsePost, serializePost, slugify, tagSlug } from './blog/post-format.js'

const POSTS_DIR = 'blog/posts'
const CDN_DIR = 'website/public/cdn/blog'
const MAX_UPLOAD = 25 << 20 // GitHub's contents API takes files up to 100MB; keep uploads small for the editor
const MODES = ['review', 'open', 'off']
const STATUSES = ['pending', 'approved', 'hidden']
const SLUG = /^[\p{L}\p{N}-]+$/u

const json = (data, status = 200, extra = {}) => Response.json(data, { status, headers: { 'cache-control': 'no-store', ...extra } })

async function readBody(request, limit = 1 << 20) {
  const bytes = new Uint8Array(await request.arrayBuffer())
  if (bytes.length > limit) throw Object.assign(new Error('too big'), { status: 413 })
  return bytes
}
const readJson = async (request) => JSON.parse(new TextDecoder().decode(await readBody(request)) || '{}')

// state-changing requests must come from our own page (SameSite cookies + Origin + a header a cross-site form can't send)
const sameOrigin = (request) => request.headers.get('origin') === ORIGIN && request.headers.get('x-blog') === '1'

// ---- sign-in
async function setupOpen(env) {
  return (await passkeyCount(env)) === 0
}

function setupCodeOk(env, given) {
  return typeof env.BLOG_ADMIN_SETUP === 'string' && env.BLOG_ADMIN_SETUP.length >= 24 && timingSafeEqual(String(given || ''), env.BLOG_ADMIN_SETUP)
}

async function handleAuth(request, env, parts) {
  const [step, action] = parts
  if (step === 'status') {
    return json({ enrolled: (await passkeyCount(env)) > 0, signedIn: await isSignedIn(request, env) })
  }
  if (step === 'register' && action === 'options' && request.method === 'POST') {
    const body = await readJson(request)
    // the very first passkey needs the one-time setup code; after that only a signed-in session can add one
    const first = await setupOpen(env)
    if (first ? !setupCodeOk(env, body.setup) : !(await isSignedIn(request, env))) return json({ error: 'sign in first' }, 403)
    const { id, challenge } = await newChallenge(env, 'register')
    const existing = await env.COMMENTS.prepare('SELECT id FROM passkeys').all()
    return json({ challengeId: id, options: creationOptions(challenge, randomB64u(16), existing.results.map((r) => r.id)) })
  }
  if (step === 'register' && action === 'verify' && request.method === 'POST') {
    const body = await readJson(request)
    const first = await setupOpen(env)
    if (first ? !setupCodeOk(env, body.setup) : !(await isSignedIn(request, env))) return json({ error: 'sign in first' }, 403)
    await finishRegistration(env, body)
    if (!first) return json({ ok: true })
    // the setup code was just used, so the first passkey also signs this browser in
    const { cookie } = await createSession(env)
    return json({ ok: true }, 200, { 'set-cookie': cookie })
  }
  if (step === 'login' && action === 'options' && request.method === 'POST') {
    if ((await passkeyCount(env)) === 0) return json({ error: 'no passkey yet' }, 400)
    const { id, challenge } = await newChallenge(env, 'login')
    return json({ challengeId: id, options: requestOptions(challenge) })
  }
  if (step === 'login' && action === 'verify' && request.method === 'POST') {
    const { cookie } = await finishLogin(env, await readJson(request))
    return json({ ok: true }, 200, { 'set-cookie': cookie })
  }
  if (step === 'logout' && request.method === 'POST') {
    return json({ ok: true }, 200, { 'set-cookie': await endSession(request, env) })
  }
  return json({ error: 'not found' }, 404)
}

// ---- posts (source files in blog/posts, commits go to the blog branch)
async function listPostFiles(env) {
  const files = (await listDir(env, POSTS_DIR)).filter((f) => f.name.endsWith('.md'))
  return Promise.all(files.map(async (f) => ({ sha: f.sha, post: parsePost(f.name.slice(0, -3), (await readText(env, f.path)) ?? '') })))
}

async function handlePosts(request, env, parts, url) {
  const slug = parts[0]
  if (!slug && request.method === 'GET') {
    const list = await listPostFiles(env)
    return json(list.map(({ post: { body, ...p } }) => p).sort((a, b) => b.date.localeCompare(a.date)))
  }
  if (!SLUG.test(slug || '')) return json({ error: 'bad slug' }, 400)

  if (request.method === 'GET') {
    const text = await readText(env, `${POSTS_DIR}/${slug}.md`)
    if (text === null) return json({ error: 'not found' }, 404)
    return json(parsePost(slug, text))
  }

  if (request.method === 'DELETE') {
    const sha = await fileSha(env, `${POSTS_DIR}/${slug}.md`)
    if (!sha) return json({ error: 'not found' }, 404)
    const commit = await deleteFile(env, `${POSTS_DIR}/${slug}.md`, `blog: remove ${slug}`, sha)
    return json({ ok: true, commit: commit.slice(0, 7) })
  }

  if (request.method === 'PUT') {
    const data = await readJson(request)
    if (!data.title?.trim()) return json({ error: 'needs a title' }, 400)
    let finalSlug = slug
    const existing = await listPostFiles(env)
    if (slug === 'new') {
      const taken = new Set(existing.map((e) => e.post.slug))
      const base = slugify(data.title)
      finalSlug = base
      for (let n = 2; taken.has(finalSlug); n++) finalSlug = `${base}-${n}`
    }
    const post = {
      slug: finalSlug,
      title: data.title.trim(),
      date: data.date || new Date().toISOString().slice(0, 16),
      tags: [...new Set(String(data.tags || '').split(',').map(tagSlug).filter(Boolean))],
      draft: !!data.draft,
      comments: COMMENT_SETTINGS.includes(data.comments) ? data.comments : '',
      body: data.body || '',
    }
    const sha = existing.find((e) => e.post.slug === finalSlug)?.sha
    const commit = await putFile(env, `${POSTS_DIR}/${finalSlug}.md`, new TextEncoder().encode(serializePost(post)), `blog: ${post.title}`, sha)
    // links are archived and the pages rebuilt by the blog-build workflow, which runs on this commit
    return json({ slug: finalSlug, commit: commit.slice(0, 7), archived: { made: [], failed: [] }, queued: true })
  }
  return json({ error: 'method not allowed' }, 405)
}

// ---- uploads (images/files for posts, into website/public/cdn/blog/<year>)
async function handleUpload(request, env, url) {
  const raw = (url.searchParams.get('name') || 'file').split(/[\\/]/).pop().normalize('NFC') || 'file'
  const ext = (raw.match(/\.[^.]*$/)?.[0] || '').toLowerCase().replace(/[^.a-z0-9]/g, '')
  const stem = raw.slice(0, raw.length - (raw.match(/\.[^.]*$/)?.[0].length || 0)).replace(/[^\w.-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 80) || 'file'
  const bytes = await readBody(request, MAX_UPLOAD)
  const year = String(new Date().getUTCFullYear())
  const dir = `${CDN_DIR}/${year}`
  const existing = await listDir(env, dir)
  const blob = await gitBlobSha(bytes)
  let name = `${stem}${ext}`
  const same = existing.find((f) => f.name === name)
  if (same && same.sha !== blob) name = `${stem}-${blob.slice(0, 8)}${ext}`
  if (!existing.some((f) => f.name === name)) {
    await putFile(env, `${dir}/${name}`, bytes, `blog: attach ${name}`)
  }
  const href = `/cdn/blog/${year}/${encodeURIComponent(name)}`
  const media = /\.(png|jpe?g|gif|webp|svg|avif|mp4|webm|mov|mp3|ogg|wav|m4a)$/.test(ext)
  return json({ href, name, markdown: media ? `![${stem.replace(/-/g, ' ')}](${href})` : `[${raw}](${href})` })
}

// ---- moderation (D1 direct; the public API in comments.js only reads approved comments)
async function handleModeration(request, env, parts, url) {
  const db = env.COMMENTS
  if (parts[0] === 'mode') {
    if (request.method === 'PUT') {
      const { mode } = await readJson(request)
      if (!MODES.includes(mode)) return json({ error: 'bad mode' }, 400)
      await db.prepare("INSERT INTO settings (key, value) VALUES ('mode', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").bind(mode).run()
    }
    const row = await db.prepare("SELECT value FROM settings WHERE key = 'mode'").first('value')
    return json({ mode: row ?? 'review' })
  }
  if (parts[0] === 'comments' && !parts[1] && request.method === 'GET') {
    // newest first; includes the private email, so this is only ever served to a signed-in session
    const status = url.searchParams.get('status')
    const filter = STATUSES.includes(status) ? 'WHERE status = ?' : ''
    const q = db.prepare(`SELECT id, post, parent, name, site, email, body, status, created FROM comments ${filter} ORDER BY created DESC LIMIT 200`)
    const { results } = await (filter ? q.bind(status) : q).all()
    return json(results)
  }
  const id = Number(parts[1])
  if (parts[0] === 'comments' && Number.isSafeInteger(id)) {
    if (request.method === 'PUT') {
      const { status } = await readJson(request)
      if (!STATUSES.includes(status)) return json({ error: 'bad status' }, 400)
      await db.prepare('UPDATE comments SET status = ? WHERE id = ?').bind(status, id).run()
      return json({ ok: true })
    }
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()
      return json({ ok: true })
    }
  }
  return json({ error: 'not found' }, 404)
}

// ---- entry point
const PROTECTED = ['posts', 'upload', 'publish', 'git', 'moderation']

export async function handleBlogAdmin(request, env, url) {
  const p = url.pathname
  if (p === '/admin') return Response.redirect(`${url.origin}/admin/`, 301)
  if (p === '/admin/' || p.startsWith('/admin/')) {
    // the editor page itself is public static HTML; everything it does goes through the signed-in API below
    const asset = p === '/admin/' ? 'index.html' : p.slice('/admin/'.length)
    if (asset.includes('..')) return json({ error: 'not found' }, 404)
    return env.ASSETS.fetch(new Request(new URL(`/__admin/blog/${asset}`, url), request))
  }
  if (p.startsWith('/api/auth/')) {
    if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'bad origin' }, 403)
    try {
      return await handleAuth(request, env, p.slice('/api/auth/'.length).split('/'))
    } catch (e) {
      return json({ error: e.message || 'sign-in failed' }, 400)
    }
  }

  const [, , head, ...rest] = p.split('/')
  if (!PROTECTED.includes(head)) return json({ error: 'not found' }, 404)
  if (!(await isSignedIn(request, env))) return json({ error: 'sign in with your passkey first' }, 401)
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'bad origin' }, 403)

  try {
    if (head === 'posts') return await handlePosts(request, env, rest, url)
    if (head === 'upload' && request.method === 'POST') return await handleUpload(request, env, url)
    if (head === 'git') return json({ branch: env.BLOG_BRANCH || 'main' })
    if (head === 'publish' && request.method === 'POST') {
      // saving already commits; the blog-build workflow does the rest after it lands on main
      return json({ nothing: true, branch: env.BLOG_BRANCH || 'main' })
    }
    if (head === 'moderation') return await handleModeration(request, env, rest, url)
    return json({ error: 'method not allowed' }, 405)
  } catch (e) {
    return json({ error: e.message || 'failed' }, e.status || 500)
  }
}

export const BLOG_ADMIN_PATHS = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/auth/')
  || PROTECTED.some((h) => pathname === `/api/${h}` || pathname.startsWith(`/api/${h}/`))
