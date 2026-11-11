// where things live + reading/writing posts (blog/posts/<slug>.md with a little front matter)
import { readFile, writeFile, readdir, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parsePost, serializePost } from './post-format.js'

export * from './post-format.js'

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PUBLIC = path.join(REPO, 'website/public')
export const SITE = process.env.BLOG_SITE || path.join(PUBLIC, '__subdomains/blog')
export const CDN = path.join(PUBLIC, 'cdn')
export const ARCHIVES = process.env.BLOG_ARCHIVES_DIR || path.join(CDN, 'archives', 'websites')
export const POSTS = process.env.BLOG_POSTS || path.join(REPO, 'blog/posts')
export const ARCHIVE_INDEX = process.env.BLOG_ARCHIVES || path.join(REPO, 'blog/archives.json')


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
