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
  const guess = Date.UTC(y, m - 1, d) // wall-clock midnight read as UTC
  // offset(ms) = (loc wall time at ms, read as UTC) - ms. Local-midnight instant = guess - offset(it).
  const localWallAsUTC = (ms) => new Date(new Date(ms).toLocaleString('en-US', { timeZone: loc }) + ' UTC').getTime()
  const offset = (ms) => localWallAsUTC(ms) - ms
  let start = guess - offset(guess)
  start = guess - offset(start) // refine so DST-change days are exact
  return { key, start }
}

// validDate rejects well-formed but impossible dates like 2026-13-45.
export function validDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false
  const t = new Date(s + 'T00:00:00Z')
  return !isNaN(t.getTime()) && t.toISOString().slice(0, 10) === s
}

export function validTZ(tz) {
  if (tz === 'UTC') return true
  try { new Intl.DateTimeFormat('en-CA', { timeZone: tz }); return true } catch { return false }
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
