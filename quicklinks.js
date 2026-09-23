export const QUICKLINKS = {
  github: 'https://github.com/iziestratt',
  gh: 'https://github.com/iziestratt',
}

const QUICKLINK_DIRECTORY_PATHS = ['/q', '/q/', '/quicklinks', '/quicklinks/']

function isRootHost(url) {
  return (
    url.hostname === 'izie.top'
  )
}

function quicklinkTarget(pathname) {
  const match = pathname.match(/^\/(?:q|quicklinks)\/([^/]+)\/?(.*)$/)
  if (!match) return null
  const [, key, rest] = match
  const base = QUICKLINKS[key]
  if (!base) return null
  return rest ? `${base}/${rest}` : base
}

function quicklinkDirectory() {
  const rows = Object.entries(QUICKLINKS)
    .map(
      ([key, base]) =>
        `\n        <li><code>/q/${key}/…</code> → <code>${base}/…</code></li>`
    )
    .join('')
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
