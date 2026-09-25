import { handleHmoji } from './hmojis.js'
import { handleQuicklinks } from './quicklinks.js'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const quicklinksResponse = handleQuicklinks(url)
    if (quicklinksResponse) return quicklinksResponse
    if (url.hostname === 'izie.top' && ['/redoc', '/redoc/'].includes(url.pathname)) {
      return new Response(null, {
        status: 302,
        headers: { Location: `https://vs.izie.top/redocumented${url.search}` },
      })
    }
    if (url.hostname === 'vs.izie.top' && ['/redoc', '/redoc/'].includes(url.pathname)) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/redocumented${url.search}` },
      })
    }
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/slackapi/')) {
      const target = url.pathname.replace(/^\/slackapi/, '/redocumented')
      return new Response(null, {
        status: 302,
        headers: { Location: `${target}${url.search}` },
      })
    }
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/redocumented')) {
      return handleRedocumented(request, env, url)
    }
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/slack/hmojis/')) {
      return handleHmoji(request, env, ctx, url.pathname)
    }
    if (url.pathname.startsWith('/api/graphs/')) {
      const response = await fetch(`https://botme.idk.dunkirk.sh${url.pathname}${url.search}`, request)
      const headers = new Headers(response.headers)
      headers.set('cache-control', 'no-store')
      headers.set('access-control-allow-origin', '*')
      return new Response(response.body, { status: response.status, headers })
    }
    if (url.pathname === '/api/leaderboard') {
      const response = await fetch('https://botme.idk.dunkirk.sh/api/leaderboard', request)
      const headers = new Headers(response.headers)
      headers.set('cache-control', 'no-store')
      headers.set('access-control-allow-origin', '*')
      return new Response(response.body, { status: response.status, headers })
    }
    const match = url.hostname.match(/^([a-z0-9-]+)\.izie\.top$/)
    const prefix = match ? `/__subdomains/${match[1]}` : null
    // shared root assets (fonts, buttons, favicon) are served as-is on every subdomain
    const sharedAsset = url.pathname.startsWith('/cdn/') || url.pathname === '/favicon.svg'

    if (prefix && !sharedAsset) {
      url.pathname = `${prefix}${url.pathname}`
      const response = await env.ASSETS.fetch(new Request(url, request))
      const location = response.headers.get('Location')

      if (location?.startsWith(prefix)) {
        const headers = new Headers(response.headers)
        headers.set('Location', `${location.slice(prefix.length) || '/'}`)
        return new Response(response.body, { status: response.status, headers })
      }

      return response
    }

    return env.ASSETS.fetch(request)
  }
}

// ReDocumented: make the docs easy for agents to fetch.
// - `Accept: text/markdown` (or ?format=md) on the SPA root returns llms.txt instead of a JS shell
// - /redocumented/api/methods/<name> works without an extension (Accept picks .md or .json)
// - /redocumented/<method.name> jumps to that method's entry
// - unknown paths under /redocumented/api/ get a JSON 404 that says where to look
// - everything is CORS-open so browser agents can fetch it
const REDOC_PREFIX = '/__subdomains/vs'

async function handleRedocumented(request, env, url) {
  const accept = request.headers.get('Accept') || ''
  const wantsMarkdown = url.searchParams.get('format') === 'md'
    || (/text\/(markdown|plain)/.test(accept) && !accept.includes('text/html'))
  const wantsJson = url.searchParams.get('format') === 'json'
    || (accept.includes('application/json') && !accept.includes('text/html'))
  let path = url.pathname.replace(/\/+$/, '') || '/redocumented'

  if (path === '/redocumented' && (wantsMarkdown || wantsJson)) {
    path = wantsJson ? '/redocumented/api/index.json' : '/redocumented/llms.txt'
  }
  const isStaticFile = /\.(txt|json|md|js|css|html|svg|ico|png)$/.test(path)
  const method = path.match(/^\/redocumented\/(?:api\/methods\/|m\/)?([A-Za-z][\w-]*(?:\.[\w-]+)+?)(\.json|\.md)?$/)
  if (method && (path.startsWith('/redocumented/api/methods/') || !isStaticFile)) {
    return redocMethod(request, env, url, method[1], method[2] ? method[2] === '.md' : wantsMarkdown)
  }

  const target = new URL(url)
  target.pathname = `${REDOC_PREFIX}${path === '/redocumented' ? url.pathname : path}`
  let response = await env.ASSETS.fetch(new Request(target, request))

  if (response.status === 404 && path.startsWith('/redocumented/api/')) response = redocNotFound()

  const headers = new Headers(response.headers)
  const location = headers.get('Location')
  if (location?.startsWith(REDOC_PREFIX)) headers.set('Location', location.slice(REDOC_PREFIX.length) || '/')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Vary', 'Accept')
  if (/\.md$/.test(target.pathname)) headers.set('Content-Type', 'text/markdown; charset=utf-8')
  if (/\.txt$/.test(target.pathname)) headers.set('Content-Type', 'text/plain; charset=utf-8')
  if ((headers.get('Content-Type') || '').includes('text/html')) {
    headers.append('Link', '</redocumented/llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt"')
    headers.append('Link', '</redocumented/api/index.json>; rel="alternate"; type="application/json"')
  }
  return new Response(response.body, { status: response.status, headers })
}

const REDOC_BASE = 'https://vs.izie.top/redocumented'
// keep in sync with is_write_shaped in scripts/build-redocumented-agent.py
const WRITE_VERBS = ['create', 'delete', 'remove', 'set', 'update', 'add', 'post', 'send', 'invite',
  'kick', 'archive', 'rename', 'leave', 'join', 'close', 'reset', 'revoke', 'upload',
  'edit', 'mark', 'clear', 'disable', 'enable', 'assign', 'approve', 'deny', 'restrict',
  'promote', 'demote', 'convert', 'move', 'save', 'unarchive', 'schedule', 'share']
let redocCatalog = null

async function loadRedocCatalog(env, url) {
  if (!redocCatalog) {
    const res = await env.ASSETS.fetch(new URL(`${REDOC_PREFIX}/redocumented/docs/data/methods.json`, url))
    const data = await res.json()
    const safety = data.safety_note_for_agents || data.schema?.safety_note_for_agents || ''
    redocCatalog = { safety, byName: new Map(data.methods.map((m) => [m.name, m])) }
  }
  return redocCatalog
}

function redocNotFound(name) {
  return Response.json({
    ok: false,
    error: name ? 'method_not_in_catalog' : 'not_found',
    method: name,
    hint: 'Method names are case-sensitive (e.g. chat.postMessage). A missing method is unknown to this catalog, not proof it does not exist.',
    index: `${REDOC_BASE}/api/index.json`,
    grep: `${REDOC_BASE}/api/methods.txt`,
    docs: `${REDOC_BASE}/llms.txt`,
  }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })
}

async function redocMethod(request, env, url, name, markdown) {
  const { safety, byName } = await loadRedocCatalog(env, url)
  const found = byName.get(name)
  if (!found) return redocNotFound(name)
  const verb = name.split('.').pop().toLowerCase()
  const m = { ...found, write_shaped: WRITE_VERBS.some((v) => verb.startsWith(v)) }
  const headers = { 'Access-Control-Allow-Origin': '*', 'Vary': 'Accept', 'Cache-Control': 'public, max-age=300' }
  if (!markdown) {
    return Response.json({ ...m, url: `${REDOC_BASE}/api/methods/${name}.json`, safety_note_for_agents: safety }, { headers })
  }
  return new Response(redocMethodMarkdown(m), { headers: { ...headers, 'Content-Type': 'text/markdown; charset=utf-8' } })
}

function redocMethodMarkdown(m) {
  const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
  const lines = [`# ${m.name}`, '',
    `- status: ${m.status}`,
    `- verified: ${m.verified}`,
    `- tokens: ${m.tokens || 'unknown'}`,
    `- write-shaped name: ${m.write_shaped ? 'yes, do not call without a human in the loop' : 'no'}`,
    `- source: ${m.source || 'unknown'}`,
    `- call: POST https://slack.com/api/${m.name}`, '']
  if (m.purpose) lines.push(m.purpose, '')
  lines.push('## Params')
  if (m.params_known && m.params) {
    lines.push('', '| name | required | type | description |', '|---|---|---|---|')
    for (const [k, v] of Object.entries(m.params)) {
      lines.push(`| \`${k}\` | ${v.required ? 'yes' : 'no'} | ${cell(v.type)} | ${cell(v.desc)} |`)
    }
    lines.push('', `Source: ${m.params_source}`)
  } else {
    lines.push('', 'Unknown. Nothing here is guessed; do not invent params for this method.')
  }
  lines.push('', '## Response')
  if (m.response) {
    lines.push('', '| field | type |', '|---|---|')
    for (const [k, v] of Object.entries(m.response)) lines.push(`| \`${k}\` | ${cell(v)} |`)
  }
  if (m.response_example) lines.push('', '```json', m.response_example, '```')
  if (!m.response_known) lines.push('', 'Unknown.')
  else if (m.response_source) lines.push('', `Source: ${m.response_source}`)
  lines.push('', '---', `JSON: ${REDOC_BASE}/api/methods/${m.name}.json · Full catalog: ${REDOC_BASE}/llms.txt`, '')
  return lines.join('\n')
}
