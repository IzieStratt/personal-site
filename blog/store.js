// where things live + reading/writing posts (blog/posts/<slug>.md with a little front matter)
import { readFile, writeFile, readdir, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// per-post comment setting: on (accept comments even if the blog-wide mode is off), locked (show the
// existing ones, accept none) or off (no comment section at all). Empty follows the blog-wide mode.
export const COMMENT_SETTINGS = ['on', 'locked', 'off']

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PUBLIC = path.join(REPO, 'website/public')
export const SITE = process.env.BLOG_SITE || path.join(PUBLIC, '__subdomains/blog')
export const CDN = path.join(PUBLIC, 'cdn')
export const ARCHIVES = process.env.BLOG_ARCHIVES_DIR || path.join(CDN, 'archives', 'websites')
export const POSTS = process.env.BLOG_POSTS || path.join(REPO, 'blog/posts')
const ARCHIVE_INDEX = process.env.BLOG_ARCHIVES || path.join(REPO, 'blog/archives.json')

export const tagSlug = (t) => t.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '').replace(/^-+|-+$/g, '')
export const slugify = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'post'

export function parsePost(slug, text) {
  const m = text.replace(/\r\n?/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta = {}
  for (const line of (m ? m[1] : '').split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].trim()
  }
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    tags: (meta.tags || '').split(',').map(tagSlug).filter(Boolean),
    draft: meta.draft === 'true',
    comments: COMMENT_SETTINGS.includes(meta.comments) ? meta.comments : '',
    body: (m ? m[2] : text).replace(/^\n+/, ''),
  }
}

export function serializePost(p) {
  const head = [`title: ${p.title.replace(/\n/g, ' ')}`, `date: ${p.date}`, `tags: ${p.tags.join(', ')}`]
  if (p.draft) head.push('draft: true')
  if (COMMENT_SETTINGS.includes(p.comments)) head.push(`comments: ${p.comments}`)
  return `---\n${head.join('\n')}\n---\n\n${p.body.replace(/\s+$/, '')}\n`
}

export async function listPosts() {
  await mkdir(POSTS, { recursive: true })
  const files = (await readdir(POSTS)).filter((f) => f.endsWith('.md'))
  const posts = await Promise.all(files.map(async (f) => parsePost(f.slice(0, -3), await readFile(path.join(POSTS, f), 'utf8'))))
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getPost(slug) {
  return parsePost(slug, await readFile(path.join(POSTS, `${slug}.md`), 'utf8'))
}

export async function savePost(p) {
  await mkdir(POSTS, { recursive: true })
  await writeFile(path.join(POSTS, `${p.slug}.md`), serializePost(p))
}

export const deletePost = (slug) => rm(path.join(POSTS, `${slug}.md`))

// url -> { href, at }: every link we have already archived, so a link is only fetched once
export async function readArchives() {
  try { return JSON.parse(await readFile(ARCHIVE_INDEX, 'utf8')) } catch { return {} }
}
export const writeArchives = (a) => writeFile(ARCHIVE_INDEX, JSON.stringify(a, null, 2) + '\n')
