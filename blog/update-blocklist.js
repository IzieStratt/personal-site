// Rebuilds blog/blocklist.txt: the hosts that uBlock Origin's privacy list and EasyPrivacy block outright.
//   node blog/update-blocklist.js
// Only plain host rules (||host^) are used; anything with a path or a domain= condition is skipped,
// since those are about one page rather than a whole host.
import { writeFile } from 'node:fs/promises'

const LISTS = [
  'https://ublockorigin.github.io/uAssets/filters/privacy.txt',
  'https://easylist.to/easylist/easyprivacy.txt',
]
const hosts = new Set()
for (const url of LISTS) {
  const text = await (await fetch(url)).text()
  for (const line of text.split('\n')) {
    const m = line.trim().match(/^\|\|([a-z0-9.-]+\.[a-z]{2,})\^(\$([a-z0-9,-]+))?$/i)
    if (!m || /domain=|~/.test(m[3] || '')) continue
    hosts.add(m[1].toLowerCase())
  }
  console.log(url, hosts.size)
}
await writeFile(new URL('./blocklist.txt', import.meta.url), [...hosts].sort().join('\n') + '\n')
