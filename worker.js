export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const match = url.hostname.match(/^([a-z0-9-]+)\.izie\.top$/)
    const prefix = match ? `/__subdomains/${match[1]}` : null

    if (prefix) {
      url.pathname = `${prefix}${url.pathname}`
      return env.ASSETS.fetch(new Request(url, request))
    }

    return env.ASSETS.fetch(request)
  }
}
