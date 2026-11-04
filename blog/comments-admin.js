// Moderation for blog comments. Runs `wrangler d1 execute` as you (your own wrangler login), so there is
// no admin endpoint on the public site. Env for testing against a local database:
//   COMMENTS_LOCAL=<persist dir>  COMMENTS_WRANGLER_CONFIG=<wrangler.jsonc>  COMMENTS_DB=<name>
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { REPO } from './store.js'

const run = promisify(execFile)
const DB = process.env.COMMENTS_DB || 'izie-blog'
const LOCAL = process.env.COMMENTS_LOCAL
const CONFIG = process.env.COMMENTS_WRANGLER_CONFIG

export const MODES = ['review', 'open', 'off']
export const STATUSES = ['pending', 'approved', 'hidden']

async function sql(command) {
  const args = ['d1', 'execute', DB, ...(LOCAL ? ['--local', '--persist-to', LOCAL] : ['--remote']), ...(CONFIG ? ['-c', CONFIG] : []), '--json', '--command', command]
  try {
    const { stdout } = await run('wrangler', args, { cwd: REPO, maxBuffer: 16 << 20 })
    return JSON.parse(stdout)[0].results
  } catch (e) {
    throw new Error(`wrangler d1 failed: ${(e.stderr || e.message).toString().trim().split('\n').slice(-3).join(' ')}`)
  }
}

const int = (n) => {
  if (!Number.isSafeInteger(Number(n))) throw Object.assign(new Error('bad id'), { status: 400 })
  return Number(n)
}

export const getMode = async () => (await sql("SELECT value FROM settings WHERE key = 'mode'"))[0]?.value ?? 'review'

export async function setMode(mode) {
  if (!MODES.includes(mode)) throw Object.assign(new Error('bad mode'), { status: 400 })
  await sql(`INSERT INTO settings (key, value) VALUES ('mode', '${mode}') ON CONFLICT (key) DO UPDATE SET value = excluded.value`)
}

// newest first; includes the private email, so only ever call this from the local editor
export const listComments = (status) =>
  sql(`SELECT id, post, parent, name, site, email, body, status, created FROM comments ${STATUSES.includes(status) ? `WHERE status = '${status}'` : ''} ORDER BY created DESC LIMIT 200`)

export async function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw Object.assign(new Error('bad status'), { status: 400 })
  await sql(`UPDATE comments SET status = '${status}' WHERE id = ${int(id)}`)
}

// replies go with it (ON DELETE CASCADE needs foreign keys, which D1 enforces)
export const removeComment = (id) => sql(`DELETE FROM comments WHERE id = ${int(id)}`)
