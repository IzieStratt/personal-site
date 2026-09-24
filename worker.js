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
