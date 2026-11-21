import { handleComments } from './comments.js'
import { handleSuggestions } from './suggestions.js'
export { ShiritoriLobby } from './shiritori-lobby.js'
import { handleHmoji } from './hmojis.js'
import { handleQuicklinks } from './quicklinks.js'
import { handleLostfm } from './lostfm.js'
export { LostfmStore } from './lostfm.js'
import { handleBlogAdmin, BLOG_ADMIN_PATHS } from './blog-admin.js'
import { handleAccount } from './account.js'
import { handleStatus, runChecks } from './status-core.js'
export { Vibetime } from './vibetime.js'
import { prefersMarkdown, AGENT_FILE_ALIAS, RL_LIMIT, RL_WINDOW, rateLimitHit } from './agent-core.js'

// sdmp and ReDocumented live in their own repo (IzieStratt/izie-datamine) and are served by a second static-assets worker;
// everything else is in this worker's own assets. Paths and routing are unchanged, only where the file comes from.
// vs/llms.txt and vs/index.html travel with ReDocumented because the daily sync rewrites the counts in them.
const DATAMINE_PATH = /^\/__subdomains\/(?:slackdatamineplus(?:\/|$)|vs\/(?:redocumented(?:\/|$)|llms\.txt$|index\.html$|$))/
function fetchAsset(env, input, init) {
  const path = new URL(input.url || input).pathname
  return (DATAMINE_PATH.test(path) ? env.DATAMINE : env.ASSETS).fetch(input, init)
}

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    // sdmp.izie.top is the main address for the Slack datamine pages; the long name redirects to it, keeping the path and query string
    // browsers fetch /favicon.ico unasked and refuse a favicon that redirects across origins, so the icon is served in place on both names
    if (url.pathname === '/favicon.ico') url.pathname = '/favicon.svg'
    const sharedPath = url.pathname === '/favicon.svg' || url.pathname.startsWith('/cdn/')
    if (url.hostname === 'slackdatamineplus.izie.top' && !sharedPath) {
      return new Response(null, {
        status: 302,
        headers: { Location: `https://sdmp.izie.top${url.pathname}${url.search}` },
      })
    }
    // fonts on the main cdn are loaded by every subdomain (account.izie.top etc.), and browsers need CORS for cross-origin fonts
    if (url.hostname === 'izie.top' && /^\/cdn\/.*\.(woff2?|ttf|otf)$/.test(url.pathname)) {
      const res = await fetchAsset(env, request)
      const headers = new Headers(res.headers)
      headers.set('Access-Control-Allow-Origin', '*')
      return new Response(res.body, { status: res.status, headers })
    }
    // uptime.izie.top moved to the status page
    if (url.hostname === 'uptime.izie.top') {
      return new Response(null, { status: 302, headers: { Location: `https://status.izie.top${url.pathname === '/' ? '' : url.pathname}${url.search}` } })
    }
    if (url.hostname === 'status.izie.top' && url.pathname.startsWith('/api/')) return handleStatus(request, env, url)
    const quicklinksResponse = handleQuicklinks(url)
    if (quicklinksResponse) return quicklinksResponse
    if (url.hostname === 'izie.top' && (url.pathname === '/redoc' || url.pathname.startsWith('/redoc/'))) {
      const rest = url.pathname.replace(/^\/redoc\/?/, '')
      return new Response(null, {
        status: 302,
        headers: { Location: `https://vs.izie.top/redocumented${rest ? `/${rest}` : ''}${url.search}` },
      })
    }
    if (url.hostname === 'vs.izie.top' && (url.pathname === '/redoc' || url.pathname.startsWith('/redoc/'))) {
      const rest = url.pathname.replace(/^\/redoc\/?/, '')
      return new Response(null, {
        status: 302,
        headers: { Location: `/redocumented${rest ? `/${rest}` : ''}${url.search}` },
      })
    }
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/slackapi/')) {
      const target = url.pathname.replace(/^\/slackapi/, '/redocumented')
      return new Response(null, {
        status: 302,
        headers: { Location: `${target}${url.search}` },
      })
    }
    // agents guess at agents.txt / AGENTS.md / .well-known/llms.txt; answer every guess with the matching llms.txt
    if (url.hostname === 'vs.izie.top') {
      const alias = url.pathname.match(AGENT_FILE_ALIAS)
      if (alias) return serveAgentFile(env, url, alias[1] ? '/redocumented/llms.txt' : '/llms.txt')
    }
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/redocumented')) {
      return handleRedocumented(request, env, url)
    }
    if (url.hostname === 'vs.izie.top') {
      const agentResponse = handleVsAgentPaths(request, url)
      if (agentResponse) return agentResponse
    }
    if (url.hostname === 'vs.izie.top' && url.pathname === '/dgd/api/ngram') return handleDgdNgram(request, url)
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/slack/hmojis/')) {
      return handleHmoji(request, env, ctx, url.pathname)
    }
    // the blog editor and comment moderation (passkey sign-in; see blog-admin.js)
    if (url.hostname === 'blog.izie.top' && BLOG_ADMIN_PATHS(url.pathname)) return handleBlogAdmin(request, env, url)
    // izie accounts (passkeys, domain verification, linked services; see account.js)
    if (url.hostname === 'account.izie.top' && url.pathname.startsWith('/api/')) return handleAccount(request, env, url)
    if (url.pathname === '/api/comments') return handleComments(request, env, url)
    if (url.hostname === 'vs.izie.top' && /^\/lostfm\/(api|1)\//.test(url.pathname)) return handleLostfm(request, env, url)
    if (url.hostname === 'vs.izie.top' && /^\/lostfm(\/|$)/.test(url.pathname)) return withLostfmHeaders(await serveSubdomain(request, env, url))
    if (url.hostname === 'vs.izie.top' && url.pathname === '/shatori/api/suggest') return handleSuggestions(request, env)
    if (url.pathname.startsWith('/vibetime/app/')) { // vibetime server (DO). Path-gated, not host-gated: reachable on any izie.top host, but the DO enforces its own token auth and the OAuth redirect is pinned to vs.izie.top.
      // the vibetime server (Durable Object, SQLite-backed); one instance holds every account
      const sub = new URL(request.url)
      sub.pathname = url.pathname.slice('/vibetime/app'.length) || '/'
      return env.VIBETIME.get(env.VIBETIME.idFromName('main')).fetch(new Request(sub, request))
    }
    if (url.hostname === 'vs.izie.top' && url.pathname === '/shatori/ws') {
      // one hub holds every lobby and game (see shiritori-lobby.js)
      return env.LOBBY.get(env.LOBBY.idFromName('hub')).fetch(request)
    }
    if (url.pathname.startsWith('/api/graphs/')) {
      const response = await fetch(`https://botme.dunkirk.sh${url.pathname}${url.search}`, request)
      const headers = new Headers(response.headers)
      headers.set('cache-control', 'no-store')
      headers.set('access-control-allow-origin', '*')
      return new Response(response.body, { status: response.status, headers })
    }
    if (url.pathname === '/api/leaderboard') {
      const response = await fetch('https://botme.dunkirk.sh/api/leaderboard', request)
      const headers = new Headers(response.headers)
      headers.set('cache-control', 'no-store')
      headers.set('access-control-allow-origin', '*')
      return new Response(response.body, { status: response.status, headers })
    }
    const match = url.hostname.match(/^([a-z0-9-]+)\.izie\.top$/)
    const prefix = match ? `/__subdomains/${SUBDOMAIN_ALIASES[match[1]] || match[1]}` : null
    // shared root assets (fonts, buttons, favicon) are served as-is on every subdomain
    const sharedAsset = url.pathname.startsWith('/cdn/') || url.pathname === '/favicon.svg'

    if (prefix && !sharedAsset) {
      const originalPath = url.pathname
      url.pathname = `${prefix}${url.pathname}`
      const response = await fetchAsset(env, new Request(url, request))
      // subdomains without their own stylesheet (e.g. a bare 404 page) fall back to the root one
      if (response.status === 404 && originalPath === '/style.css') return fetchAsset(env, request)
      const location = response.headers.get('Location')

      if (location?.startsWith(prefix)) {
        const headers = new Headers(response.headers)
        headers.set('Location', `${location.slice(prefix.length) || '/'}`)
        return new Response(response.body, { status: response.status, headers })
      }

      // plain-text lists (e.g. sdmp's platforms/*.txt) are UTF-8; without a charset browsers guess and garble curly quotes
      if (response.ok && /\.txt$/.test(url.pathname) && response.headers.get('Content-Type') === 'text/plain') {
        const headers = new Headers(response.headers)
        headers.set('Content-Type', 'text/plain; charset=utf-8')
        return new Response(response.body, { status: response.status, headers })
      }

      if (match[1] === 'vs') return vsForAgents(request, env, url, originalPath, response)
      return response
    }

    return fetchAsset(env, new Request(url, request))
  },

  // every 5 minutes (wrangler.jsonc triggers.crons): run the status checks
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runChecks(env, (req) => worker.fetch(req, env, ctx)))
  },
}
export default worker

// subdomains that serve another subdomain's files (sdmp is the main address for the slackdatamineplus folder; the long hostname redirects to it, see the top of fetch)
const SUBDOMAIN_ALIASES = { sdmp: 'slackdatamineplus' }

// ReDocumented: make the docs easy for agents to fetch.
// - `Accept: text/markdown` (or ?format=md) on the SPA root returns llms.txt instead of a JS shell
// - /redocumented/api/methods/<name> works without an extension (Accept picks .md or .json)
// - /redocumented/<method.name> jumps to that method's entry
// - unknown paths under /redocumented/api/ get a JSON 404 that says where to look
// - everything is CORS-open so browser agents can fetch it
const REDOC_PREFIX = '/__subdomains/vs'

async function handleRedocumented(request, env, url) {
  const accept = request.headers.get('Accept') || ''
  const wantsMarkdown = url.searchParams.get('format') === 'md' || prefersMarkdown(accept)
  const wantsJson = url.searchParams.get('format') === 'json'
    || (accept.includes('application/json') && !accept.includes('text/html'))
  // /redocumented/api/v1/... is the versioned name of /redocumented/api/... (see openapi-catalog.json)
  let path = url.pathname.replace(/\/+$/, '').replace(/^\/redocumented\/api\/v1(?=\/|$)/, '/redocumented/api') || '/redocumented'
  const isApi = path === '/redocumented/api' || path.startsWith('/redocumented/api/')
  const rl = isApi ? redocRateLimit(request) : null
  if (rl?.limited) return withRateLimit(redocError(429, 'rate_limited', `Over ${RL_LIMIT} requests per minute. Wait ${rl.reset}s, or download methods.json once instead of looping.`, { retry_after: rl.reset }), rl)
  if (isApi && request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    return withRateLimit(redocError(405, 'method_not_allowed', 'This API is read-only; use GET.'), rl)
  }
  const negotiated = path === '/redocumented' && wantsMarkdown && !wantsJson

  if (path === '/redocumented' && (wantsMarkdown || wantsJson)) {
    path = wantsJson ? '/redocumented/api/index.json' : '/redocumented/llms.txt'
  }
  const isStaticFile = /\.(txt|json|md|js|css|html|svg|ico|png)$/.test(path)
  const method = path.match(/^\/redocumented\/(?:api\/methods\/|m\/)?([A-Za-z][\w-]*(?:\.[\w-]+)+?)(\.json|\.md)?$/)
  if (method && (path.startsWith('/redocumented/api/methods/') || !isStaticFile)) {
    return withRateLimit(await redocMethod(request, env, url, method[1], method[2] ? method[2] === '.md' : wantsMarkdown), rl)
  }

  const target = new URL(url)
  target.pathname = `${REDOC_PREFIX}${path === '/redocumented' ? url.pathname : path}`
  let response = await fetchAsset(env, new Request(target, request))

  if (response.status === 404 && path.startsWith('/redocumented/api/')) response = redocNotFound()

  const headers = new Headers(response.headers)
  const location = headers.get('Location')
  if (location?.startsWith(REDOC_PREFIX)) headers.set('Location', location.slice(REDOC_PREFIX.length) || '/')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Vary', 'Accept')
  if (/\.md$/.test(target.pathname)) headers.set('Content-Type', 'text/markdown; charset=utf-8')
  if (/\.txt$/.test(target.pathname)) headers.set('Content-Type', `text/${negotiated ? 'markdown' : 'plain'}; charset=utf-8`)
  if ((headers.get('Content-Type') || '').includes('text/html')) {
    headers.append('Link', '</redocumented/llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt"')
    headers.append('Link', '</redocumented/api/index.json>; rel="alternate"; type="application/json"')
  }
  if (rl) setRateLimitHeaders(headers, rl)
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
    const res = await fetchAsset(env, new URL(`${REDOC_PREFIX}/redocumented/docs/data/methods.json`, url))
    const data = await res.json()
    const safety = data.safety_note_for_agents || data.schema?.safety_note_for_agents || ''
    redocCatalog = { safety, byName: new Map(data.methods.map((m) => [m.name, m])) }
  }
  return redocCatalog
}

function redocNotFound(name) {
  return redocError(404, name ? 'method_not_in_catalog' : 'not_found',
    'Method names are case-sensitive (e.g. chat.postMessage). A missing method is unknown to this catalog, not proof it does not exist.',
    { method: name })
}

// every API error has the same shape: Error in redocumented/openapi-catalog.json
function redocError(status, error, hint, extra = {}) {
  const headers = { 'Access-Control-Allow-Origin': '*' }
  if (extra.retry_after) headers['Retry-After'] = String(extra.retry_after)
  return Response.json({
    ok: false, error, hint, ...extra,
    index: `${REDOC_BASE}/api/index.json`,
    grep: `${REDOC_BASE}/api/methods.txt`,
    docs: `${REDOC_BASE}/llms.txt`,
  }, { status, headers })
}

const rlBuckets = new Map()
function redocRateLimit(request) {
  return rateLimitHit(rlBuckets, request.headers.get('CF-Connecting-IP') || 'unknown', Math.floor(Date.now() / 1000))
}
function setRateLimitHeaders(headers, rl) {
  headers.set('RateLimit-Policy', `"default";q=${RL_LIMIT};w=${RL_WINDOW}`)
  headers.set('RateLimit', `"default";r=${rl.remaining};t=${rl.reset}`)
}
function withRateLimit(response, rl) {
  if (!rl) return response
  const headers = new Headers(response.headers)
  setRateLimitHeaders(headers, rl)
  return new Response(response.body, { status: response.status, headers })
}

// vs.izie.top agent surfaces that are not files: the API catalog and a root alias for the ReDocumented API spec
const VS_API_CATALOG = {
  linkset: [{
    anchor: 'https://vs.izie.top/redocumented/api/v1',
    'service-desc': [{ href: 'https://vs.izie.top/redocumented/openapi-catalog.json', type: 'application/openapi+json' }],
    'service-doc': [{ href: 'https://vs.izie.top/redocumented/llms.txt', type: 'text/markdown' }],
    status: [{ href: 'https://vs.izie.top/redocumented/api/v1/index.json', type: 'application/json' }],
  }],
}
function handleVsAgentPaths(request, url) {
  if (url.pathname === '/.well-known/api-catalog') {
    return new Response(JSON.stringify(VS_API_CATALOG, null, 1), {
      headers: { 'Content-Type': 'application/linkset+json', 'Access-Control-Allow-Origin': '*',
        Link: '</.well-known/api-catalog>; rel="api-catalog"' },
    })
  }
  if (url.pathname === '/openapi.json') {
    return Response.redirect('https://vs.izie.top/redocumented/openapi-catalog.json', 302)
  }
  return null
}

async function serveAgentFile(env, url, file) {
  const res = await fetchAsset(env, new URL(`/__subdomains/vs${file}`, url))
  return new Response(res.body, { status: res.status, headers: {
    'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300',
    'Content-Location': file, Link: `<${file}>; rel="canonical"`,
  } })
}

const VS_LINKS = [
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</redocumented/openapi-catalog.json>; rel="service-desc"; type="application/openapi+json"',
  '</redocumented/>; rel="service-doc"',
]

// vs.izie.top pages: Markdown for agents that ask for it (home and 404), JSON 404s for API-shaped requests, Vary: Accept
async function vsForAgents(request, env, url, originalPath, response) {
  const accept = request.headers.get('Accept') || ''
  const type = response.headers.get('Content-Type') || ''
  const isHtml = type.includes('text/html')
  if (!isHtml && response.status !== 404) return response
  const markdown = prefersMarkdown(accept)
  const json = !markdown && accept.includes('application/json') && !accept.includes('text/html')
  const base = { 'Vary': 'Accept', 'Access-Control-Allow-Origin': '*' }

  if (response.status === 404) {
    if (json || /\/api(\/|$)/.test(originalPath)) {
      return Response.json({ ok: false, error: 'not_found', hint: `Nothing at ${originalPath}. See the docs or the sitemap.`,
        docs: 'https://vs.izie.top/llms.txt', sitemap: 'https://vs.izie.top/sitemap.xml', api: 'https://vs.izie.top/redocumented/openapi-catalog.json' },
      { status: 404, headers: base })
    }
    if (markdown) {
      return new Response(`# 404: not found\n\nThere is no page at \`${originalPath}\` on vs.izie.top.\n\n- Index of everything here: [llms.txt](https://vs.izie.top/llms.txt)\n- Sitemap: [sitemap.xml](https://vs.izie.top/sitemap.xml)\n- Slack API reference: [ReDocumented](https://vs.izie.top/redocumented/llms.txt)\n`,
        { status: 404, headers: { ...base, 'Content-Type': 'text/markdown; charset=utf-8' } })
    }
  }

  if (markdown && response.ok && (originalPath === '/' || originalPath === '/index.html')) {
    const md = await fetchAsset(env, new URL('/__subdomains/vs/llms.txt', url))
    return new Response(md.body, { headers: { ...base, 'Content-Type': 'text/markdown; charset=utf-8', Link: VS_LINKS.join(', ') } })
  }

  const headers = new Headers(response.headers)
  headers.set('Vary', 'Accept')
  if (originalPath === '/') for (const l of VS_LINKS) headers.append('Link', l)
  let out = new Response(response.body, { status: response.status, headers })
  // DeGoogledDict is a client-rendered Next export; give readers without JavaScript a description (see DGD_ABOUT)
  if (response.ok && /^\/dgd\/?$/.test(originalPath)) {
    out = new HTMLRewriter().on('body', { element(el) { el.append(DGD_ABOUT, { html: true }) } }).transform(out)
  }
  return out
}

const DGD_ABOUT = `<footer style="max-width:42rem;margin:2rem auto;padding:0 1rem;font:14px/1.5 system-ui,sans-serif;opacity:.75">
<h2 style="font-size:1rem;margin:0 0 .5rem">About DeGoogledDict</h2>
<p>DeGoogledDict is a dictionary card in the style of Google's "define" search result, without any AI-generated text. Type a word to get its pronunciation, parts of speech, definitions and example sentences from Wiktionary (or Merriam-Webster), synonyms and related words from Datamuse, a usage-over-time chart from Google Books Ngram, and links to Wikipedia. Lookups go to those public sources (the Ngram chart through this site's relay, since Ngram sends no CORS headers).</p>
<p>Made by <a href="https://izie.top">izie</a>. More projects: <a href="/">vs.izie.top</a>.</p>
</footer>`

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
    ...(m.not_in_client ? [`- not in the current client: ${m.not_in_client_note || 'missing from recent web client builds'}`] : []),
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
  } else if (m.params_observed) {
    lines.push('', 'Not a schema. These argument names were seen at call sites in Slack\'s web client; the set is partial and says nothing about which are required.',
      '', '| name | type hint | call sites |', '|---|---|---|')
    for (const [k, v] of Object.entries(m.params_observed)) lines.push(`| \`${k}\` | ${cell(v.type)} | ${v.sites} |`)
    lines.push('', `Source: ${m.params_observed_source}`)
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

// DeGoogledDict (/dgd): Google Books Ngram sends no CORS headers, so the browser asks us and we relay the JSON.
async function handleDgdNgram(request, url) {
  if (request.method !== 'GET') return new Response('[]', { status: 405, headers: { 'content-type': 'application/json' } })
  const word = (url.searchParams.get('w') || '').trim()
  if (!word || word.length > 40 || /\s/.test(word)) return new Response('[]', { status: 400, headers: { 'content-type': 'application/json' } })
  const upstream = await fetch(
    `https://books.google.com/ngrams/json?content=${encodeURIComponent(word)}&year_start=1800&year_end=2019&corpus=en-2019&smoothing=3`,
    { cf: { cacheTtl: 604800, cacheEverything: true } },
  )
  return new Response(upstream.ok ? upstream.body : '[]', {
    status: upstream.ok ? 200 : 502,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
  })
}

// lostfm pages get a strict CSP: scripts only from us, network only to us and Spotify, images over https
const LOSTFM_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://i.scdn.co https://lastfm.freetls.fastly.net https://lastfm-img.freetls.fastly.net https://*.mzstatic.com https://coverartarchive.org https://archive.org https://*.archive.org",
  "connect-src 'self' https://api.spotify.com https://accounts.spotify.com",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

async function serveSubdomain(request, env, url) {
  const assetUrl = new URL(url)
  assetUrl.pathname = `/__subdomains/vs${url.pathname}`
  const response = await fetchAsset(env, new Request(assetUrl, request))
  const location = response.headers.get('Location')
  if (location?.startsWith('/__subdomains/vs')) {
    const headers = new Headers(response.headers)
    headers.set('Location', location.slice('/__subdomains/vs'.length) || '/')
    return new Response(response.body, { status: response.status, headers })
  }
  return response
}

function withLostfmHeaders(response) {
  const headers = new Headers(response.headers)
  headers.set('content-security-policy', LOSTFM_CSP)
  headers.set('x-content-type-options', 'nosniff')
  headers.set('referrer-policy', 'no-referrer')
  return new Response(response.body, { status: response.status, headers })
}
