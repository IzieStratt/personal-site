#!/usr/bin/env node
// Review word suggestions from the Shiritori game (vs.izie.top/shatori).
//   node scripts/review-shiritori-words.mjs list
//   node scripts/review-shiritori-words.mjs accept <word> [word ...]
//   node scripts/review-shiritori-words.mjs reject <word> [word ...]
// Reads and updates the word_suggestions table in D1 (izie-blog) through wrangler. Accepted words are
// appended to words-extra.txt; commit and push to publish them. Nothing is accepted unless you name it.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const gameDir = join(root, 'website/public/__subdomains/vs/shatori')
const DB = 'izie-blog'
const WORD = /^[a-z]{4,29}$/

function sql(command) {
  const out = execFileSync('wrangler', ['d1', 'execute', DB, '--remote', '--json', '--command', command], { encoding: 'utf8', cwd: root })
  return JSON.parse(out.slice(out.indexOf('[')))[0]?.results ?? []
}

function readWords(file) {
  const path = join(gameDir, file)
  return existsSync(path) ? readFileSync(path, 'utf8').split('\n').map((w) => w.trim()).filter(Boolean) : []
}

const [command, ...args] = process.argv.slice(2)
const known = new Set([...readWords('words.txt'), ...readWords('words-extra.txt')])

if (command === 'list') {
  const rows = sql("SELECT word, count, created FROM word_suggestions WHERE status = 'pending' ORDER BY count DESC, created LIMIT 200")
  if (!rows.length) console.log('No pending suggestions.')
  for (const r of rows) console.log(`${r.word.padEnd(20)} x${r.count}  ${r.created.slice(0, 10)}${known.has(r.word) ? '  (already in list)' : ''}`)
  process.exit(0)
}

if (command === 'accept' || command === 'reject') {
  const words = [...new Set(args.map((w) => w.trim().toLowerCase()))]
  const bad = words.filter((w) => !WORD.test(w))
  if (!words.length || bad.length) {
    console.error(`usage: ${command} <word> [word ...]${bad.length ? `  (not valid: ${bad.join(', ')})` : ''}`)
    process.exit(1)
  }
  // words are validated above, so the SQL list is safe to build
  const list = words.map((w) => `'${w}'`).join(', ')
  sql(`UPDATE word_suggestions SET status = '${command === 'accept' ? 'accepted' : 'rejected'}' WHERE word IN (${list})`)

  if (command === 'accept') {
    const extra = new Set(readWords('words-extra.txt'))
    for (const w of words) extra.add(w)
    writeFileSync(join(gameDir, 'words-extra.txt'), [...extra].sort().join('\n') + '\n')
    const added = words.filter((w) => !known.has(w))
    console.log(`accepted ${words.length} (${added.length} new to the game): ${words.join(', ')}`)
    console.log('words-extra.txt updated. Commit and push to publish.')
  } else {
    console.log(`rejected ${words.length}: ${words.join(', ')}`)
  }
  process.exit(0)
}

console.error('usage: review-shiritori-words.mjs list | accept <word...> | reject <word...>')
process.exit(1)
