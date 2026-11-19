// Pure helpers for vibetime (no Cloudflare imports) so they can be unit-tested with node.
export const STREAK_MIN = 15 * 60 // seconds/day to keep a streak
export const CAPS = { prompts: 6, ai_lines: 2000, human_edits: 30 } // per-minute, self-reported
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n | 0))

export function streaks(days) {
  const ok = (d) => d.seconds >= STREAK_MIN
  let run = 0, longest = 0
  for (const d of days) { if (ok(d)) { run++; longest = Math.max(longest, run) } else run = 0 }
  let i = days.length - 1, current = 0
  if (i >= 0 && !ok(days[i])) i-- // today isn't over yet, so it doesn't break a streak
  for (; i >= 0 && ok(days[i]); i--) current++
  return [current, longest]
}

// dayParts: { key: 'YYYY-MM-DD', start: ms at local midnight } for date in loc.
export function dayParts(date, loc) {
  const key = new Intl.DateTimeFormat('en-CA', { timeZone: loc, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
  const [y, m, d] = key.split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d)
  const asLocal = new Date(guess).toLocaleString('en-US', { timeZone: loc })
  const off = guess - new Date(asLocal + ' UTC').getTime()
  return { key, start: guess + off }
}

export function validTZ(tz) {
  if (tz === 'UTC') return true
  try { new Intl.DateTimeFormat('en-CA', { timeZone: tz }); return true } catch { return false }
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
