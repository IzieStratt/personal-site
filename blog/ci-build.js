// Runs in GitHub Actions (blog-build workflow) after a post or upload lands on main:
// archives any external link not snapshotted yet, then rebuilds the static blog pages.
// Same steps the local editor does on save, minus the re-archive tick.
import { archiveUrl } from './archive.js'
import { build } from './build.js'
import { externalLinks } from './markdown.js'
import { ARCHIVES, listPosts, readArchives, writeArchives } from './store.js'

const archives = await readArchives()
for (const post of await listPosts()) {
  for (const url of externalLinks(post.body)) {
    if (archives[url]) continue
    try {
      const a = await archiveUrl(url, ARCHIVES)
      archives[url] = { href: a.href, at: a.at }
      await writeArchives(archives)
      console.log(`archived ${url} -> ${a.href}`)
    } catch (e) {
      console.error(`couldn't archive ${url}: ${e.message}`)
    }
  }
}
await build()
console.log('built blog pages')
// a link that fails to archive doesn't block the build; it's retried on the next push
