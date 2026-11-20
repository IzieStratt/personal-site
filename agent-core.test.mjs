import { prefersMarkdown, AGENT_FILE_ALIAS, RL_LIMIT, RL_WINDOW, rateLimitHit } from './agent-core.js'
import assert from 'node:assert/strict'

// Markdown negotiation
assert.equal(prefersMarkdown('text/markdown'), true)
assert.equal(prefersMarkdown('text/plain'), true)
assert.equal(prefersMarkdown('text/markdown, text/html;q=0.9'), true)
assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false)
assert.equal(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8'), false)
assert.equal(prefersMarkdown('*/*'), false)
assert.equal(prefersMarkdown(''), false)
assert.equal(prefersMarkdown('text/markdown;q=0'), false)

// agents.txt-style aliases
const alias = (p) => { const m = p.match(AGENT_FILE_ALIAS); return m ? (m[1] ? 'redoc' : 'root') : null }
for (const p of ['/agents.txt', '/AGENTS.md', '/agent.txt', '/ai.txt', '/llms.md', '/.well-known/llms.txt', '/.well-known/agents.txt']) assert.equal(alias(p), 'root', p)
for (const p of ['/redocumented/agents.txt', '/redocumented/AGENTS.md', '/redocumented/.well-known/llms.txt']) assert.equal(alias(p), 'redoc', p)
for (const p of ['/llms.txt', '/redocumented/llms.txt', '/x/agents.txt', '/agents.txt.bak', '/dgd/']) assert.equal(alias(p), null, p)

// rate limit
const b = new Map()
let r
for (let i = 0; i < RL_LIMIT; i++) r = rateLimitHit(b, 'a', 1000)
assert.deepEqual(r, { remaining: 0, reset: RL_WINDOW, limited: false })
assert.equal(rateLimitHit(b, 'a', 1010).limited, true)
assert.equal(rateLimitHit(b, 'a', 1010).reset, RL_WINDOW - 10)
assert.equal(rateLimitHit(b, 'b', 1010).limited, false)
assert.equal(rateLimitHit(b, 'a', 1000 + RL_WINDOW).limited, false)

console.log('agent-core: ok')
