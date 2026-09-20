// Extension -> content-type for hmoji images. Add more if you upload other formats.
const HMOJI_CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

// Every response for a missing token and a missing image looks identical, so a
// request can't be used to probe which hmoji ids or tokens exist.
const HMOJI_NOT_FOUND = () => new Response('Not found', { status: 404 })
const HMOJI_MAX_UPLOAD_BYTES = 5 * 1024 * 1024

function checkHmojiToken(request) {
  const auth = request.headers.get('authorization') ?? ''
  const [scheme, token] = auth.split(' ')
  if (scheme !== 'Bearer' || !token) return undefined
  return token
}

async function handleHmojiBootstrap(request, env) {
  const token = checkHmojiToken(request)
  if (!token) return HMOJI_NOT_FOUND()
  if (!(await env.HMOJI_TOKENS.get(token))) return HMOJI_NOT_FOUND()

  const config = await env.HMOJI_CONFIG.get('config')
  if (!config) return HMOJI_NOT_FOUND()

  // never cached anywhere: this response is the group key and secret catalog
  return new Response(config, {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

async function handleHmojiPlugin(request, env) {
  // Deliberately not token-gated: this is just the plugin's code, no secrets
  // in it, and it needs to be pasteable straight into Taut's own "Import
  // URL" field, which can't attach an Authorization header.
  const plugin = await env.HMOJI_ASSETS.get('plugin.js', 'arrayBuffer')
  if (!plugin) return HMOJI_NOT_FOUND()

  return new Response(plugin, {
    headers: { 'content-type': 'application/javascript', 'cache-control': 'no-store' },
  })
}

async function handleHmojiImage(request, env, id) {
  const token = checkHmojiToken(request)
  if (!token) return HMOJI_NOT_FOUND()

  const grant = await env.HMOJI_TOKENS.get(token)
  if (!grant) return HMOJI_NOT_FOUND()

  const ext = id.slice(id.lastIndexOf('.') + 1).toLowerCase()
  const contentType = HMOJI_CONTENT_TYPES[ext]

  if (request.method === 'PUT') {
    // Off by default. Flip HMOJI_ALLOW_TOKEN_UPLOAD to "true" in wrangler.jsonc
    // (and redeploy) once you want any token holder to be able to upload,
    // not just you from the CLI.
    if (env.HMOJI_ALLOW_TOKEN_UPLOAD !== 'true') {
      return new Response('Uploads are disabled', { status: 403 })
    }
    if (!contentType) return new Response('Unsupported file extension', { status: 400 })
    const body = await request.arrayBuffer()
    if (body.byteLength === 0 || body.byteLength > HMOJI_MAX_UPLOAD_BYTES) {
      return new Response('Bad file size', { status: 413 })
    }
    await env.HMOJI_IMAGES.put(id, body)
    return new Response('Uploaded', { status: 201 })
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const image = await env.HMOJI_IMAGES.get(id, 'arrayBuffer')
  if (!image) return HMOJI_NOT_FOUND()

  return new Response(image, {
    headers: {
      'content-type': contentType ?? 'application/octet-stream',
      'cache-control': 'private, max-age=3600',
    },
  })
}

// Taut's desktop app routes plugin fetch() calls through Electron's main
// process, which corrupts binary bodies (forces them through a lossy UTF-8
// string round-trip - fine for the JSON bootstrap response, not fine for
// image bytes). The plugin fetches images with the page's own native
// fetch() instead to avoid that, which means real CORS applies here, unlike
// the bridge-routed calls.
const HMOJI_CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, PUT, OPTIONS',
  'access-control-allow-headers': 'Authorization',
  'access-control-max-age': '86400',
}

function withHmojiCors(response) {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(HMOJI_CORS_HEADERS)) {
    headers.set(key, value)
  }
  return new Response(response.body, { status: response.status, headers })
}

async function handleHmoji(request, env, pathname) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: HMOJI_CORS_HEADERS })
  }

  const rest = pathname.slice('/hmojis/'.length)
  let response
  if (rest === 'bootstrap') {
    response = await handleHmojiBootstrap(request, env)
  } else if (rest === 'plugin.js') {
    response = await handleHmojiPlugin(request, env)
  } else {
    const id = decodeURIComponent(rest)
    response =
      !id || id.includes('/') || id.includes('..')
        ? HMOJI_NOT_FOUND()
        : await handleHmojiImage(request, env, id)
  }
  return withHmojiCors(response)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/slackapi/')) {
      const target = url.pathname.replace(/^\/slackapi/, '/redocumented')
      return new Response(null, {
        status: 302,
        headers: { Location: `${target}${url.search}` },
      })
    }
    if (url.hostname === 'vs.izie.top' && url.pathname.startsWith('/hmojis/')) {
      return handleHmoji(request, env, url.pathname)
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

    if (prefix) {
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
