export const QUICKLINKS = {
  github: 'https://github.com/iziestratt',
  gh: 'https://github.com/iziestratt',
  itch: 'https://iziestratt.itch.io/',
  itchio: 'https://iziestratt.itch.io/',
}

const QUICKLINK_DIRECTORY_PATHS = ['/q', '/q/', '/quicklinks', '/quicklinks/']

function isRootHost(url) {
  return (
    url.hostname === 'izie.top'
  )
}

// trailing slash on a base is dropped so `/q/itch/game/` -> `https://iziestratt.itch.io/game/`, not `//game/`
const quicklinkBase = (base) => base.replace(/\/$/, '')

function quicklinkTarget(pathname) {
  const match = pathname.match(/^\/(?:q|quicklinks)\/([^/]+)\/?(.*)$/)
  if (!match) return null
  const [, key, rest] = match
  // own keys only: `/q/constructor/x` must not reach Object.prototype
  if (!Object.hasOwn(QUICKLINKS, key)) return null
  const base = QUICKLINKS[key]
  return rest ? `${quicklinkBase(base)}/${rest}` : base
}

function quicklinkDirectory() {
  const rows = Object.entries(QUICKLINKS)
    .map(
      ([key, base]) =>
        `\n        <li><code>/q/${key}/…</code> → <code>${quicklinkBase(base)}/…</code></li>`
    )
    .join('')
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>quicklinks · izie.top</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <h1>quicklinks</h1>
    <ul>${rows}
    </ul>
  </body>
</html>`
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export function handleQuicklinks(url) {
  if (!isRootHost(url)) return null
  if (QUICKLINK_DIRECTORY_PATHS.includes(url.pathname)) {
    return quicklinkDirectory()
  }
  if (url.pathname.startsWith('/q/') || url.pathname.startsWith('/quicklinks/')) {
    const target = quicklinkTarget(url.pathname)
    if (target) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${target}${url.search}` },
      })
    }
    return new Response('Not found', { status: 404 })
  }
  return null
}
