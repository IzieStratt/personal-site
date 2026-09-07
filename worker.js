export default {
  async fetch(request, env) {
    const url = new URL(request.url)
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
