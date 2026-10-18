// Local blog editor: node blog/server.js  ->  http://localhost:4747/admin
// Serves the built blog (and the shared /cdn) for previewing, plus the editing API.
// It only listens on 127.0.0.1; publishing is the normal git push (scripts/deploy.fish).
import http from 'node:http'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { archiveUrl } from './archive.js'
import { build } from './build.js'
import { getMode, listComments, removeComment, setMode, setStatus } from './comments-admin.js'
import { externalLinks } from './markdown.js'
import { ARCHIVES, ARCHIVE_INDEX, CDN, COMMENT_SETTINGS, PUBLIC, REPO, SITE, deletePost, getPost, listPosts, readArchives, savePost, slugify, tagSlug, writeArchives } from './store.js'

const PORT = Number(process.env.PORT) || 4747
const ADMIN = path.join(path.dirname(fileURLToPath(import.meta.url)), 'admin')
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
}
const MAX_UPLOAD = 200 << 20

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' })
  res.end(type === 'application/json' ? JSON.stringify(body) : body)
}

async function readBody(req, limit = 1 << 20) {
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > limit) throw Object.assign(new Error('too big'), { status: 413 })
    chunks.push(c)
  }
  return Buffer.concat(chunks)
}

async function serveFile(res, root, rel) {
  let file = path.join(root, decodeURIComponent(rel))
  if (!file.startsWith(root + path.sep) && file !== root) return false
  try {
    let s = await stat(file)
    if (s.isDirectory()) {
      if (rel && !rel.endsWith('/')) { res.writeHead(301, { location: `/${rel}/` }); res.end(); return true }
      file = path.join(file, 'index.html')
      s = await stat(file)
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' })
    res.end(await readFile(file))
    return true
  } catch { return false }
}

// archive any links in the post we haven't snapshotted yet
async function archiveLinks(body, refresh) {
  const archives = await readArchives()
  const made = [], failed = []
  for (const url of externalLinks(body)) {
    if (archives[url] && !refresh) continue
    try {
      const a = await archiveUrl(url, ARCHIVES)
      archives[url] = { href: a.href, at: a.at }
      made.push({ url, href: a.href, files: a.files, skipped: a.skipped })
      await writeArchives(archives)
    } catch (e) { failed.push({ url, error: e.message }) }
  }
  return { made, failed }
}

async function uploadFile(req, url) {
  const raw = path.basename(url.searchParams.get('name') || 'file').normalize('NFC')
  const ext = path.extname(raw).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const stem = raw.slice(0, raw.length - path.extname(raw).length).replace(/[^\w.-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 80) || 'file'
  const buf = await readBody(req, MAX_UPLOAD)
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8)
  const dir = path.join(CDN, 'blog', String(new Date().getFullYear()))
  await mkdir(dir, { recursive: true })
  // same name + same bytes -> reuse; same name, different bytes -> keep both
  let name = `${stem}${ext}`
  const existing = await readdir(dir)
  if (existing.includes(name) && !(await readFile(path.join(dir, name))).equals(buf)) name = `${stem}-${hash}${ext}`
  await writeFile(path.join(dir, name), buf)
  const href = `/cdn/blog/${path.basename(dir)}/${encodeURIComponent(name)}`
  const media = /\.(png|jpe?g|gif|webp|svg|avif|mp4|webm|mov|mp3|ogg|wav|m4a)$/.test(ext)
  return { href, name, markdown: media ? `![${stem.replace(/-/g, ' ')}](${href})` : `[${raw}](${href})` }
}

// publishing = a git commit of the blog's files, then a push (GitHub deploys it). Only blog paths are
// touched, so anything else you have lying around uncommitted stays exactly as it is.
const git = (...args) => promisify(execFile)('git', args, { cwd: REPO, maxBuffer: 8 << 20 }).then((r) => r.stdout.trim())
const BLOG_PATHS = ['blog/posts', path.relative(REPO, SITE), path.relative(REPO, path.join(CDN, 'blog')), path.relative(REPO, ARCHIVES), path.relative(REPO, ARCHIVE_INDEX)]
let publishing = false

async function publish(title) {
  if (publishing) throw Object.assign(new Error('already publishing'), { status: 409 })
  publishing = true
  try {
    const exists = []
    for (const p of BLOG_PATHS) if (await stat(path.join(REPO, p)).then(() => true, () => false)) exists.push(p)
    // a path that was deleted is still worth staging, so also ask git about it
    await git('add', '-A', '--', ...exists)
    const changed = await git('status', '--porcelain', '--', ...exists)
    if (changed) await git('commit', '-m', `blog: ${title || 'update'}`, '--', ...exists)
    const branch = await git('branch', '--show-current')
    // a commit from an earlier failed push is still waiting; push it too
    const waiting = Number(await git('rev-list', '--count', '@{u}..HEAD').catch(() => '1'))
    if (!changed && !waiting) return { nothing: true, branch }
    try {
      await git('push', 'origin', 'HEAD')
    } catch (e) {
      throw new Error(`committed, but the push failed: ${String(e.stderr || e.message).trim().split('\n').slice(-2).join(' ')}`)
    }
    return { pushed: true, branch, commit: await git('rev-parse', '--short', 'HEAD') }
  } finally {
    publishing = false
  }
}

// previewing a post here can talk to a `wrangler dev` worker (COMMENTS_API=http://localhost:8787)
async function proxyComments(req, res, url) {
  if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return send(res, 403, { error: 'bad origin' })
  const upstream = await fetch(`${process.env.COMMENTS_API}/api/comments${url.search}`, {
    method: req.method,
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '127.0.0.1' },
    body: req.method === 'POST' ? await readBody(req) : undefined,
  })
  res.writeHead(upstream.status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(await upstream.text())
}

async function api(req, res, url) {
  const parts = url.pathname.split('/').slice(2)
  const body = () => readBody(req).then((b) => JSON.parse(b.toString() || '{}'))

  if (parts[0] === 'upload' && req.method === 'POST') return send(res, 200, await uploadFile(req, url))
  if (parts[0] === 'git' && req.method === 'GET') return send(res, 200, { branch: await git('branch', '--show-current').catch(() => '') })
  if (parts[0] === 'publish' && req.method === 'POST') {
    const slug = String((await body()).slug || '')
    const title = /^[\p{L}\p{N}-]+$/u.test(slug) ? (await getPost(slug).catch(() => null))?.title : ''
    return send(res, 200, await publish(title))
  }
  if (parts[0] === 'moderation') {
    if (parts[1] === 'mode') {
      if (req.method === 'PUT') await setMode((await body()).mode)
      return send(res, 200, { mode: await getMode() })
    }
    if (parts[1] === 'comments' && !parts[2] && req.method === 'GET') return send(res, 200, await listComments(url.searchParams.get('status')))
    if (parts[1] === 'comments' && req.method === 'PUT') { await setStatus(parts[2], (await body()).status); return send(res, 200, { ok: true }) }
    if (parts[1] === 'comments' && req.method === 'DELETE') { await removeComment(parts[2]); return send(res, 200, { ok: true }) }
    return send(res, 404, { error: 'not found' })
  }
  if (parts[0] !== 'posts') return send(res, 404, { error: 'not found' })

  if (!parts[1] && req.method === 'GET') return send(res, 200, (await listPosts()).map(({ body, ...p }) => p))
  const slug = parts[1]
  if (!/^[\p{L}\p{N}-]+$/u.test(slug || '')) return send(res, 400, { error: 'bad slug' })

  if (req.method === 'GET') return send(res, 200, await getPost(slug))
  if (req.method === 'DELETE') { await deletePost(slug); await build(); return send(res, 200, { ok: true }) }
  if (req.method === 'PUT') {
    const data = await body()
    if (!data.title?.trim()) return send(res, 400, { error: 'needs a title' })
    let finalSlug = slug
    if (slug === 'new') {
      const taken = new Set((await listPosts()).map((p) => p.slug))
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
    await savePost(post)
    const archived = await archiveLinks(post.body, !!data.refresh)
    await build()
    return send(res, 200, { slug: finalSlug, archived })
  }
  send(res, 405, { error: 'method not allowed' })
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    // this can write files and fetch arbitrary urls, so refuse anything not from this page itself
    const host = req.headers.host || ''
    if (host !== `localhost:${PORT}` && host !== `127.0.0.1:${PORT}`) return send(res, 403, { error: 'bad host' })
    if (url.pathname === '/api/comments' && process.env.COMMENTS_API) return await proxyComments(req, res, url)
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET' && (req.headers['x-blog'] !== '1' || (req.headers.origin && req.headers.origin !== `http://${host}`))) {
        return send(res, 403, { error: 'bad origin' })
      }
      return await api(req, res, url)
    }
    if (url.pathname === '/admin') { res.writeHead(301, { location: '/admin/' }); return res.end() }
    if (url.pathname.startsWith('/admin/')) {
      if (await serveFile(res, ADMIN, url.pathname.slice('/admin/'.length) || 'index.html')) return
    } else if (process.env.BLOG_ARCHIVES_DIR && url.pathname.startsWith('/cdn/archives/websites/') && await serveFile(res, ARCHIVES, url.pathname.slice('/cdn/archives/websites/'.length))) return
    else if (await serveFile(res, SITE, url.pathname.slice(1))) return
    else if ((url.pathname.startsWith('/cdn/') || url.pathname === '/favicon.svg') && await serveFile(res, PUBLIC, url.pathname.slice(1))) return
    send(res, 404, 'not found', 'text/plain; charset=utf-8')
  } catch (e) {
    send(res, e.status || 500, { error: e.code === 'ENOENT' ? 'not found' : e.message })
  }
}).listen(PORT, '127.0.0.1', () => {
  const editor = `http://localhost:${PORT}/admin/`
  console.log(`blog editor: ${editor}   preview: http://localhost:${PORT}/`)
  // open it in the browser (pass --no-open, or set BLOG_NO_OPEN=1, to skip)
  if (process.argv.includes('--no-open') || process.env.BLOG_NO_OPEN) return
  const [cmd, ...rest] = process.platform === 'darwin' ? ['open'] : process.platform === 'win32' ? ['cmd', '/c', 'start', ''] : ['xdg-open']
  execFile(cmd, [...rest, editor], () => {})
})
