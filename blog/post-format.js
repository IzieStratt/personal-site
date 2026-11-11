// Pure post helpers (no Node APIs) so the worker can use them too. store.js re-exports these.
// per-post comment setting: on (accept comments even if the blog-wide mode is off), locked (show the
// existing ones, accept none) or off (no comment section at all). Empty follows the blog-wide mode.
export const COMMENT_SETTINGS = ['on', 'locked', 'off']

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
