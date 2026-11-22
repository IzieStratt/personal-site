// node --test scripts/test_cdn_selects.mjs
// Keeps site pages on the shared dropdown (website/public/cdn/dropdown.js).
// Rules, for every static HTML page under website/public:
//   1. a <select> must say data-fancy (uses the site dropdown) or data-native (plain select, on purpose)
//   2. a page with a data-fancy <select> must load /cdn/dropdown.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = new URL('../website/public/', import.meta.url).pathname
const SKIP_DIRS = new Set(['cdn'])

async function htmlFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...await htmlFiles(path))
    } else if (entry.name.endsWith('.html')) {
      out.push(path)
    }
  }
  return out
}

// <select ...> opening tags, with their attribute text
const SELECT_TAG = /<select\b([^>]*)>/gi

const pages = await htmlFiles(ROOT)

test('every <select> is fancy or explicitly native', async () => {
  const bad = []
  for (const file of pages) {
    const html = await readFile(file, 'utf8')
    for (const [, attrs] of html.matchAll(SELECT_TAG)) {
      if (!/\bdata-(fancy|native)\b/.test(attrs)) bad.push(`${relative(ROOT, file)}: <select${attrs}>`)
    }
  }
  assert.deepEqual(bad, [], 'add data-fancy (site dropdown) or data-native (plain select) to these selects')
})

test('pages with data-fancy selects load /cdn/dropdown.js', async () => {
  const bad = []
  for (const file of pages) {
    const html = await readFile(file, 'utf8')
    const hasFancy = [...html.matchAll(SELECT_TAG)].some(([, attrs]) => /\bdata-fancy\b/.test(attrs))
    if (hasFancy && !html.includes('src="/cdn/dropdown.js"')) bad.push(relative(ROOT, file))
  }
  assert.deepEqual(bad, [], 'these pages have data-fancy selects but do not load /cdn/dropdown.js')
})
