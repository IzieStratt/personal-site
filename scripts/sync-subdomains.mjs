import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const sourceRoot = join(root, 'subdomains')
const outputRoot = join(root, 'website', 'public', '__subdomains')

await rm(outputRoot, { recursive: true, force: true })
await mkdir(outputRoot, { recursive: true })

for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const source = join(sourceRoot, entry.name, 'public')
  await cp(source, join(outputRoot, entry.name), { recursive: true })
  await cp(join(source, 'index.html'), join(outputRoot, `${entry.name}-index.html`))
}
