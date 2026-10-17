// Snapshot a web page into website/public/cdn/archives/websites/<site>_<utc date-time>/.
//
// The page is fetched, every stylesheet/script/image/font it references is
// downloaded next to it, and all references are rewritten to relative paths so
// the copy works from wherever the cdn is served. Same-site pages that the page
// links to (Nutshell pulls its expandable bits out of sibling .html files) are
// mirrored too, a couple of levels deep.
import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const UA = 'Mozilla/5.0 (compatible; izie-blog-archiver/1.0; +https://blog.izie.top)'
const LIMIT = { file: 25 << 20, total: 120 << 20, files: 250, pages: 30, depth: 2, timeout: 20000, parallel: 6 }

const TAG = /<script\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/script\s*>|<style\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const ATTR = /(\s)(src|href|poster|data|srcset|style)(\s*=\s*)("([^"]*)"|'([^']*)'|([^\s"'>]+))/gi
// analytics/ad/tracker hosts from uBlock Origin's privacy list + EasyPrivacy (blog/update-blocklist.js).
// copying their scripts would make every view of an archive report to them.
const BLOCKED = new Set(readFileSync(new URL('./blocklist.txt', import.meta.url), 'utf8').split('\n').filter(Boolean))
const isTracker = (host) => {
  for (let h = host.toLowerCase(); h.includes('.'); h = h.slice(h.indexOf('.') + 1)) if (BLOCKED.has(h)) return true
  return false
}
// returned by the rewrite pass for urls on the tracker list: the whole tag is removed
const DROP = Symbol('drop')
// tags whose src/href/etc. point at things to copy; any other tag only has its style attribute looked at
const URL_TAGS = new Set(['img', 'link', 'source', 'video', 'audio', 'track', 'embed', 'object', 'iframe', 'frame', 'a', 'input', 'script'])
const LINK_RELS = /stylesheet|icon|apple-touch|preload|modulepreload|image_src/i

const unescapeAttr = (s) => s.replace(/&amp;/g, '&').replace(/&#38;/g, '&')
const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const short = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8)

function resolve(raw, base) {
  raw = raw.trim()
  if (!raw || raw.startsWith('#') || /^(data|mailto|tel|javascript|blob|about):/i.test(raw)) return null
  try {
    const u = new URL(raw, base)
    return /^https?:$/.test(u.protocol) ? u : null
  } catch { return null }
}

const noHash = (u) => { const c = new URL(u); c.hash = ''; return c.href }

// walks every url in an html document; visit(raw, role) returns a replacement or undefined
function transformHtml(html, base, visit) {
  const baseTag = html.match(/<base\b[^>]*\shref\s*=\s*["']?([^"'\s>]+)/i)
  if (baseTag) { try { base = new URL(baseTag[1], base).href } catch {} }

  return html.replace(TAG, (whole, tag, attrs) => {
    if (whole.startsWith('<!--')) return whole
    if (/^<style/i.test(whole)) {
      return whole.replace(/^(<style[^>]*>)([\s\S]*?)(<\/style\s*>)$/i, (_, a, css, z) => a + transformCss(css, base, visit) + z)
    }
    if (/^<script/i.test(whole)) {
      const m = whole.match(/^(<script\b(?:[^>"']|"[^"]*"|'[^']*')*>)([\s\S]*)$/i)
      return rewriteTag('script', m[1].slice(7, -1), base, visit, m[2], '<script')
    }
    if (tag.toLowerCase() === 'base') return ''
    return rewriteTag(tag.toLowerCase(), attrs, base, visit)
  })
}

function rewriteTag(tag, attrs, base, visit, rest = '', open = `<${tag}`) {
  const rel = attrs.match(/\srel\s*=\s*["']?([^"'>]*)/i)?.[1] || ''
  attrs = attrs.replace(/\s(integrity|crossorigin|nonce)(\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/gi, '')
  let dropped = false
  attrs = attrs.replace(ATTR, (whole, sp, name, eq, val, dq, sq, bare) => {
    name = name.toLowerCase()
    if (name !== 'style' && !URL_TAGS.has(tag)) return whole
    const value = unescapeAttr(dq ?? sq ?? bare ?? '')
    let out
    if (name === 'style') out = transformCss(value, base, visit)
    else if (name === 'srcset') {
      out = value.split(',').map((part) => {
        const [u, ...desc] = part.trim().split(/\s+/)
        const out = visit(u, 'asset', base)
        if (out === DROP) dropped = true
        return [out === DROP ? u : out ?? u, ...desc].join(' ')
      }).join(', ')
    } else if (name === 'href' && tag === 'link') {
      out = LINK_RELS.test(rel) ? visit(value, 'asset', base) : visit(value, 'link', base)
    } else if (name === 'href') out = tag === 'a' ? visit(value, 'page', base) : undefined
    else if (name === 'src' && (tag === 'iframe' || tag === 'frame')) out = visit(value, 'page', base)
    else out = visit(value, 'asset', base)
    if (out === DROP) { dropped = true; return whole }
    return `${sp}${name}${eq}"${escapeAttr(out ?? value)}"`
  })
  return dropped ? '' : `${open}${attrs}>${rest}`
}

function transformCss(css, base, visit) {
  return css.replace(/url\(\s*(['"]?)([^)'"]*?)\1\s*\)|@import\s+(['"])([^'"]*)\3/gi, (whole, q, u1, q2, u2) => {
    const raw = u1 ?? u2
    let out = visit(raw, 'asset', base)
    if (out === undefined) return whole
    if (out === DROP) out = 'data:,'
    return u1 !== undefined ? `url("${out}")` : `@import "${out}"`
  })
}

function decode(buf, contentType) {
  let charset = contentType.match(/charset=["']?([\w-]+)/i)?.[1]
  charset ||= buf.subarray(0, 2048).toString('latin1').match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i)?.[1]
  try { return new TextDecoder(charset || 'utf-8').decode(buf) } catch { return buf.toString('utf8') }
}

async function get(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' },
    signal: AbortSignal.timeout(LIMIT.timeout),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (+res.headers.get('content-length') > LIMIT.file) throw new Error('file too large')
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > LIMIT.file) throw new Error('file too large')
  const type = res.headers.get('content-type') || ''
  return { buf, type, mime: type.split(';')[0].trim().toLowerCase(), url: res.url }
}

export async function archiveUrl(input, archivesDir) {
  const start = new URL(input)
  if (!/^https?:$/.test(start.protocol)) throw new Error('only http(s) links can be archived')

  const first = await get(start.href)
  const at = new Date()
  const stamp = at.toISOString().replace(/\.\d+Z$/, '').replace(/[-:]/g, '').replace('T', '-')
  const site = start.hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '-')
  let name = `${site}_${stamp}`
  await mkdir(archivesDir, { recursive: true })
  for (let n = 2; ; n++) {
    try { await mkdir(path.join(archivesDir, name)); break } catch (e) {
      if (e.code !== 'EEXIST') throw e
      name = `${site}_${stamp}-${n}`
    }
  }
  const outDir = path.join(archivesDir, name)

  const rootUrl = new URL(first.url)
  const root = { origin: rootUrl.origin, dir: rootUrl.pathname.replace(/[^/]*$/, '') }
  const isHtml = (m) => m === 'text/html' || m === 'application/xhtml+xml'

  // plain file (pdf, image, zip...): store it as-is, nothing to rewrite
  if (!isHtml(first.mime)) {
    const file = localRel(rootUrl, root, false).replace(/\/index\.html$/, '') || 'file'
    const fileName = path.posix.basename(file)
    await writeFile(path.join(outDir, fileName), first.buf)
    await writeFile(path.join(outDir, 'archive.json'), JSON.stringify({ source: input, finalUrl: first.url, at: at.toISOString(), files: [fileName] }, null, 2))
    return { name, href: `/cdn/archives/websites/${name}/${encodeURIComponent(fileName)}`, at: at.toISOString(), files: 1, skipped: 0 }
  }

  const stored = new Map()      // url (no hash) -> path inside the archive
  const used = new Set()
  const pages = new Set()       // stored paths that are html documents (referenced as dir/)
  const docs = []               // text documents needing a rewrite pass
  const binaries = []
  const skipped = []
  const seen = new Set()
  let total = 0

  function claim(rel) {
    let p = rel, n = 2
    while (used.has(p)) p = rel.replace(/(\.[^./]*)?$/, `~${n++}$1`)
    used.add(p)
    return p
  }

  const rootKey = noHash(rootUrl)
  stored.set(rootKey, claim('index.html'))
  pages.add('index.html')
  docs.push({ url: rootKey, base: rootKey, stored: 'index.html', kind: 'html', text: decode(first.buf, first.type) })
  seen.add(rootKey)
  const queue = []
  function scan(doc, depth) {
    const visit = (raw, role, base) => {
      const u = resolve(unescapeAttr(raw), base)
      if (!u) return undefined
      const key = noHash(u)
      if (seen.has(key)) return undefined
      if (role === 'link' || (role !== 'page' && isTracker(u.hostname))) return undefined
      if (role === 'page') {
        const ext = path.posix.extname(u.pathname).toLowerCase()
        const inSite = u.origin === root.origin && u.pathname.startsWith(root.dir) && (!ext || ext === '.html' || ext === '.htm')
        if (!inSite || depth >= LIMIT.depth) return undefined
      }
      seen.add(key)
      queue.push({ url: key, role, depth: depth + 1 })
      return undefined
    }
    if (doc.kind === 'html') transformHtml(doc.text, doc.base, visit)
    else transformCss(doc.text, doc.base, (raw, role, base) => visit(raw, 'asset', base))
  }

  scan(docs[0], 0)

  async function work() {
    while (queue.length) {
      const item = queue.shift()
      if (docs.length + binaries.length >= LIMIT.files || total >= LIMIT.total) { skipped.push(item.url); continue }
      if (item.role === 'page' && pages.size >= LIMIT.pages) { skipped.push(item.url); continue }
      try {
        const r = await get(item.url)
        const u = new URL(r.url)
        const html = isHtml(r.mime)
        // pages we crawl stay on the site
        if (html && !(u.origin === root.origin && u.pathname.startsWith(root.dir))) { skipped.push(`${item.url} (page is off-site)`); continue }
        total += r.buf.length
        const css = r.mime === 'text/css' || (/\.css$/i.test(u.pathname) && r.mime.startsWith('text/'))
        const rel = claim(localRel(new URL(item.url), root, html))
        stored.set(item.url, rel)
        if (r.url !== item.url) stored.set(noHash(r.url), rel)
        if (html) {
          pages.add(rel)
          const doc = { url: item.url, base: noHash(r.url), stored: rel, kind: 'html', text: decode(r.buf, r.type) }
          docs.push(doc); scan(doc, item.depth)
        } else if (css) {
          const doc = { url: item.url, base: noHash(r.url), stored: rel, kind: 'css', text: decode(r.buf, r.type) }
          docs.push(doc); scan(doc, item.depth)
        } else binaries.push({ stored: rel, buf: r.buf })
      } catch (e) { skipped.push(`${item.url} (${e.message})`) }
    }
  }
  // tiny worker pool; scanning a document can add to the queue while others are fetching
  for (let idle = 0; idle < 50; idle++) {
    await Promise.all(Array.from({ length: LIMIT.parallel }, work))
    if (!queue.length) break
  }

  // second pass: point every mirrored reference at its local copy
  const iso = at.toISOString()
  for (const doc of docs) {
    const visit = (raw, role, base) => {
      const u = resolve(unescapeAttr(raw), base)
      if (!u) return undefined
      if (role !== 'page' && role !== 'link' && isTracker(u.hostname)) return DROP
      const local = stored.get(noHash(u))
      if (local) {
        const target = pages.has(local) ? path.posix.dirname(local) : local
        let ref = path.posix.relative(path.posix.dirname(doc.stored), target)
        ref = ref.split('/').map(encodeURIComponent).join('/')
        if (pages.has(local)) ref = ref ? `${ref}/` : './'
        return ref + u.hash
      }
      // not mirrored: a relative reference would now point into the archive, so make it absolute
      return /^[a-z][a-z0-9+.-]*:|^\/\//i.test(raw.trim()) ? undefined : u.href
    }
    let text = doc.kind === 'html' ? transformHtml(doc.text, doc.base, visit) : transformCss(doc.text, doc.base, (raw, role, base) => visit(raw, 'asset', base))
    if (doc.kind === 'html') {
      text = text.replace(/(<meta[^>]+charset\s*=\s*["']?)[\w-]+/i, '$1utf-8')
      const note = `<!-- archived from ${input} on ${iso} -->`
      text = /<head[^>]*>/i.test(text) ? text.replace(/<head[^>]*>/i, (m) => `${m}\n${note}`) : `${note}\n${text}`
    }
    await put(outDir, doc.stored, Buffer.from(text, 'utf8'))
  }
  for (const b of binaries) await put(outDir, b.stored, b.buf)

  const files = docs.length + binaries.length
  await writeFile(path.join(outDir, 'archive.json'), JSON.stringify({ source: input, finalUrl: first.url, at: iso, files, skipped }, null, 2))
  return { name, href: `/cdn/archives/websites/${name}/`, at: iso, files, skipped: skipped.length }
}

async function put(dir, rel, buf) {
  const file = path.join(dir, ...rel.split('/'))
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, buf)
}

// where a url lives inside the archive: same-site urls under the page's folder keep
// their relative path, everything else goes in _ext/<host>/...; html becomes <dir>/index.html
function localRel(u, root, html) {
  let p = u.origin === root.origin && u.pathname.startsWith(root.dir)
    ? u.pathname.slice(root.dir.length)
    : `_ext/${u.host.replace(/:/g, '-')}${u.pathname}`
  try { p = decodeURIComponent(p) } catch {}
  const trailing = p === '' || p.endsWith('/')
  const segs = p.split('/').filter((s) => s && s !== '.' && s !== '..').map((s) => s.replace(/[^\w.\-+@~=, ]/g, '_'))
  if (u.search && segs.length) segs[segs.length - 1] = segs[segs.length - 1].replace(/(\.[^.]*)?$/, `~${short(u.search)}$1`)
  if (html) {
    if (segs.length && !trailing) segs[segs.length - 1] = segs[segs.length - 1].replace(/\.html?$/i, '')
    if (segs[segs.length - 1] === 'index') segs.pop()
    segs.push('index.html')
  } else if (trailing || !segs.length) segs.push('index.html')
  return segs.join('/')
}
