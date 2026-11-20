// Pure helpers for the agent-facing parts of worker.js (tested in agent-core.test.mjs).

// q-value aware: true when the client ranks text/markdown (or text/plain) above text/html
export function prefersMarkdown(accept) {
  const q = (type) => {
    let best = -1
    for (const part of accept.toLowerCase().split(',')) {
      const [media, ...params] = part.trim().split(';')
      if (media.trim() !== type) continue
      const qp = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
      best = Math.max(best, qp ? Number(qp.slice(2)) || 0 : 1)
    }
    return best
  }
  const md = Math.max(q('text/markdown'), q('text/x-markdown'), q('text/plain'))
  return md > 0 && md > q('text/html')
}

// agents guess at agents.txt / AGENTS.md / .well-known/llms.txt; group 1 is set for ReDocumented's own copy
export const AGENT_FILE_ALIAS = /^(\/redocumented)?\/(?:agents?\.(?:txt|md)|ai\.txt|llms\.md|\.well-known\/(?:agents?|llms)\.(?:txt|md))$/i

// Soft per-IP limit for /redocumented/api. Counted per Worker isolate, so it is approximate across Cloudflare's edge.
export const RL_LIMIT = 120
export const RL_WINDOW = 60
export function rateLimitHit(buckets, ip, now) {
  let b = buckets.get(ip)
  if (!b || b.start + RL_WINDOW <= now) {
    if (buckets.size > 5000) buckets.clear()
    b = { start: now, count: 0 }
    buckets.set(ip, b)
  }
  b.count++
  return { remaining: Math.max(0, RL_LIMIT - b.count), reset: b.start + RL_WINDOW - now, limited: b.count > RL_LIMIT }
}
