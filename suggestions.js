// Word suggestions for the Shiritori game (vs.izie.top/shatori). Stored in D1 (binding COMMENTS,
// table word_suggestions; see suggestions-schema.sql). Nothing reaches the game until izie accepts
// a word with scripts/review-shiritori-words.js, which adds it to words-extra.txt.

// Hard caps, all server side. D1 free tier is 100k rows written and 5M rows read per day, shared with
// the blog comments, so the budget below stays far under that:
//   - DAILY_OPS: total D1 operations this endpoint may spend per UTC day (across all visitors)
//   - each request is charged its worst case up front (1 + 3 per word), so a request that would
//     overrun the budget is refused before it touches the database
const LIMITS = { words: 20, perDay: 60, dailyOps: 5000 }

// Charges `cost` against today's shared budget. Returns true if it fit, false if the day's budget is spent.
async function charge(db, cost) {
  const day = new Date().toISOString().slice(0, 10)
  const row = await db
    .prepare(
      'INSERT INTO suggestion_budget (day, ops) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET ops = ops + excluded.ops RETURNING ops',
    )
    .bind(day, cost)
    .first()
  return row.ops <= LIMITS.dailyOps
}

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store' } })

async function hashIp(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const data = new TextEncoder().encode(`${env.COMMENT_SALT || 'blog'}:${ip}`)
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function handleSuggestions(request, env) {
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405)
  const db = env.COMMENTS
  if (!db) return json({ error: 'suggestions are not set up yet' }, 503)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'send JSON: {"words": ["..."]}' }, 400)
  }
  if (!Array.isArray(body?.words)) return json({ error: 'send JSON: {"words": ["..."]}' }, 400)

  const words = [...new Set(body.words.map((w) => String(w).trim().toLowerCase()).filter(Boolean))].slice(0, LIMITS.words)
  // worst case for this request: 1 rate-limit count + per word a lookup and a write
  if (!(await charge(db, 1 + words.length * 3))) {
    return json({ error: 'Suggestions are paused for today. Try again tomorrow.' }, 429)
  }
  const ip = await hashIp(request, env)
  const since = new Date(Date.now() - 86400000).toISOString()
  const used = await db.prepare('SELECT COUNT(*) AS n FROM word_suggestions WHERE ip_hash = ? AND created > ?').bind(ip, since).first('n')
  let budget = LIMITS.perDay - (used ?? 0)

  const accepted = []
  const rejected = []
  for (const word of words) {
    if (!/^[a-z]{4,29}$/.test(word)) {
      rejected.push({ word, reason: 'Use 4 to 29 letters, a to z only.' })
      continue
    }
    const row = await db.prepare('SELECT id, status FROM word_suggestions WHERE word = ?').bind(word).first()
    if (row) {
      if (row.status === 'accepted') {
        rejected.push({ word, reason: 'Already in the list.' })
        continue
      }
      // already suggested by someone: bump the count, which helps the review queue sort by demand
      await db.prepare('UPDATE word_suggestions SET count = count + 1 WHERE id = ?').bind(row.id).run()
      accepted.push(word)
      continue
    }
    if (budget <= 0) {
      rejected.push({ word, reason: 'Daily limit reached, try again tomorrow.' })
      continue
    }
    budget -= 1
    await db.prepare("INSERT INTO word_suggestions (word, count, status, created, ip_hash) VALUES (?, 1, 'pending', ?, ?)")
      .bind(word, new Date().toISOString(), ip).run()
    accepted.push(word)
  }
  return json({ accepted, rejected })
}
