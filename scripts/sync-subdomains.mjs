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
  await cp(join(sourceRoot, entry.name, 'public'), join(outputRoot, entry.name), { recursive: true })
}
