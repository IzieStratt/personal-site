// Turns blog/posts/*.md into the static pages in website/public/__subdomains/blog.
// Run directly (node blog/build.js) or via the editor, which calls build() after every save.
import { writeFile, mkdir, rm, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, esc } from './markdown.js'
import { SITE, listPosts, readArchives } from './store.js'

const ORIGIN = 'https://blog.izie.top'
// shown as MM/DD/YYYY; the datetime attribute keeps the ISO date
const day = (d) => `${d.slice(5, 7)}/${d.slice(8, 10)}/${d.slice(0, 4)}`

// Nutshell (ncase.me/nutshell, CC0) turns [:links](#Heading) into expandable in-place explanations.
// Self-hosted in /cdn/nutshell so posts don't depend on ncase.me staying up; only loaded when a post uses it.
const usesNutshell = (md) => /\[:[^\]]|^#+\s*:/m.test(md)
const NUTSHELL = `
    <script src="/cdn/nutshell/nutshell.js"></script>
    <script>
      Nutshell.setOptions({ dontEmbedHeadings: true, startOnLoad: false })
      // To recap an interrupted sentence nutshell needs plain text right after each :link, so the
      // archive superscripts sit out while it runs and then go back next to their links.
      addEventListener('DOMContentLoaded', () => {
        const held = [...document.querySelectorAll('sup.archive')].map((sup) => {
          const link = sup.previousElementSibling
          sup.remove()
          return [link, sup]
        })
        Nutshell.start()
        for (const [link, sup] of held) link.after(sup)
      })
      // nutshell's own decorative images (bubble tail etc.) ship without alt text; mark them decorative
      new MutationObserver(() => {
        for (const img of document.querySelectorAll('img:not([alt])')) img.alt = ''
      }).observe(document.documentElement, { childList: true, subtree: true })
    </script>`

// comments load from /api/comments (see ../comments.js); the form and list are filled in by comments.js
const commentsSection = (slug, setting) => `
      <section id="comments" class="comments" data-post="${slug}" data-setting="${setting || 'default'}" aria-labelledby="comments-title">
        <h2 id="comments-title">comments</h2>
        <div class="comment-list" aria-live="polite"><p class="empty">loading comments...</p></div>
        <noscript><p>comments need javascript, sorry.</p></noscript>
        <p class="comments-off" hidden>comments are turned off right now.</p>
        <div class="comment-form-home">
          <form novalidate>
            <h3>leave a comment</h3>
            <p class="comment-note"></p>
            <label><span>name</span><input name="name" type="text" maxlength="40" autocomplete="nickname" required></label>
            <label><span>website or email</span><input name="contact" type="text" maxlength="254" autocomplete="off" required aria-describedby="contact-help"></label>
            <p id="contact-help" class="hint">a website shows up as a link next to your name. an email is kept private and never shown. one or the other is needed.</p>
            <label><span>comment (markdown works: *italic*, **bold**, \`code\`, [links](https://example.com), &gt; quotes, - lists)</span><textarea name="body" rows="5" maxlength="2000" required></textarea></label>
            <div class="trap" aria-hidden="true"><label>leave this empty <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
            <div class="actions">
              <button type="submit">post comment</button>
              <button type="button" class="cancel-reply" hidden>cancel reply</button>
            </div>
            <p class="comment-status" role="status"></p>
          </form>
        </div>
      </section>
      <script src="/comments.js" defer></script>`

const page = ({ title, body, head = '', foot = '' }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/style.css">
    <link rel="alternate" type="application/atom+xml" title="blog" href="/feed.xml">${head}
  </head>
  <body>
    <main>
      <nav aria-label="Site navigation">
        <ul>
          <li><a href="/">all posts</a></li>
          <li><a href="https://izie.top">home</a></li>
          <li><a href="/feed.xml">feed</a></li>
        </ul>
      </nav>
${body}
    </main>${foot}
  </body>
</html>
`

// the front page's tag filter (see filter-client.js). The chips are ordinary links to the tag pages, so it
// still works without javascript; the script turns them into toggles and adds the open/close button.
const BARS = '<svg class="bars" viewBox="0 0 16 12" width="16" height="12" aria-hidden="true" focusable="false"><path d="M1 1.5h14" /><path d="M3.5 6h9" /><path d="M6 10.5h4" /></svg>'
const filterBox = (counts) => `<div class="filter" id="filter">
        <div class="filter-top">
          <button type="button" class="filter-toggle" id="filter-toggle" aria-expanded="false" aria-controls="filter-panel" hidden>${BARS}<span class="label">filter</span></button>
          <p id="filter-label" class="vh">filter by tag</p>
          <p id="filter-count" role="status"></p>
          <button type="button" class="filter-clear" hidden>clear filter</button>
        </div>
        <div id="filter-panel" class="filter-panel" data-open="true"><div>
          <ul class="tags cloud" aria-labelledby="filter-label">${counts.map(([t, n], i) => `<li style="--i:${i}"><a href="/tag/${encodeURIComponent(t)}/">${esc(t)} <span>${n}</span></a></li>`).join('')}</ul>
        </div></div>
      </div>`

const tagLinks = (tags) => tags.length
  ? `<ul class="tags">${tags.map((t) => `<li><a href="/tag/${encodeURIComponent(t)}/">${esc(t)}</a></li>`).join('')}</ul>`
  : ''

const postList = (posts) => `<ol class="posts" id="post-list">${posts.map((p) => `
        <li>
          <a class="card" href="/post/${p.slug}/">
            <time datetime="${esc(p.date)}">${day(p.date)}</time>
            <span class="title">${esc(p.title)}</span>
          </a>
          ${tagLinks(p.tags)}
        </li>`).join('')}
      </ol>`

export async function build() {
  const archives = await readArchives()
  const all = (await listPosts()).filter((p) => !p.draft)
  const ctx = { onLink: (url) => archives[url]?.href }

  await rm(path.join(SITE, 'post'), { recursive: true, force: true })
  await rm(path.join(SITE, 'tag'), { recursive: true, force: true })
  const write = async (rel, text) => {
    const file = path.join(SITE, rel)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, text)
  }

  const counts = new Map()
  for (const p of all) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1)
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  await write('index.html', page({
    title: 'blog',
    foot: all.length ? '\n    <script src="/filter.js" defer></script>' : '',
    body: `      <h1>BLOG</h1>
      ${all.length ? `${filterBox(sorted)}\n      ${postList(all)}` : "<p>huh, why's nothing here?</p>\n      <p>meoww mrrpp meoeweawww</p>"}`,
  }))

  for (const [t] of counts) {
    const posts = all.filter((p) => p.tags.includes(t))
    await write(`tag/${t}/index.html`, page({
      title: `${t} - blog`,
      body: `      <h1>#${esc(t)}</h1>
      <p class="subtitle">${posts.length} post${posts.length === 1 ? '' : 's'}, <a href="/">all of them</a></p>
      ${postList(posts)}`,
    }))
  }

  for (const p of all) {
    await write(`post/${p.slug}/index.html`, page({
      title: `${p.title} - blog`,
      head: `\n    <meta name="comments" content="${p.comments || 'default'}">${usesNutshell(p.body) ? NUTSHELL : ''}`,
      body: `      <article>
        <h1>${esc(p.title)}</h1>
        <p class="subtitle"><time datetime="${esc(p.date)}">${day(p.date)}</time></p>
        ${tagLinks(p.tags)}
        <div class="post">
${render(p.body, ctx)}
        </div>
      </article>${p.comments === 'off' ? '' : commentsSection(p.slug, p.comments)}`,
    }))
  }

  await copyFile(new URL('./comments-client.js', import.meta.url), path.join(SITE, 'comments.js'))
  await copyFile(new URL('./filter-client.js', import.meta.url), path.join(SITE, 'filter.js'))

  const updated = (all[0]?.date || new Date().toISOString())
  await write('feed.xml', `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Izie's blog</title>
  <id>${ORIGIN}/</id>
  <link href="${ORIGIN}/"/>
  <link rel="self" href="${ORIGIN}/feed.xml"/>
  <updated>${new Date(updated).toISOString()}</updated>
${all.slice(0, 30).map((p) => `  <entry>
    <title>${esc(p.title)}</title>
    <id>${ORIGIN}/post/${p.slug}/</id>
    <link href="${ORIGIN}/post/${p.slug}/"/>
    <updated>${new Date(p.date).toISOString()}</updated>
${p.tags.map((t) => `    <category term="${esc(t)}"/>`).join('\n')}
    <content type="html">${esc(render(p.body, { plainLinks: true, onLink: (u) => archives[u]?.href && ORIGIN + archives[u].href }).replace(/(src|href)="\//g, `$1="${ORIGIN}/`))}</content>
  </entry>`).join('\n')}
</feed>
`)
  return { posts: all.length, tags: counts.size }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(await build())
