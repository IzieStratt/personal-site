// lostfm (vs.izie.top/lostfm): public listening stats. The music-stalker bot POSTs a stats snapshot
// with LOSTFM_TOKEN; the page GETs it. One KV key, overwritten each push.
const MAX_BYTES = 2_000_000

export async function handleLostfm(request, env) {
  if (request.method === 'GET') {
    const body = await env.LOSTFM.get('stats')
    return new Response(body || '{}', {
      status: body ? 200 : 404,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
    })
  }
  if (request.method === 'POST') {
    const auth = request.headers.get('authorization') || ''
    if (!env.LOSTFM_TOKEN || !(await sameText(auth, `Bearer ${env.LOSTFM_TOKEN}`))) {
      return new Response('unauthorized', { status: 401 })
    }
    const text = await request.text()
    if (text.length > MAX_BYTES) return new Response('too large', { status: 413 })
    try {
      const data = JSON.parse(text)
      if (typeof data !== 'object' || data === null || typeof data.total !== 'number') throw new Error('shape')
    } catch {
      return new Response('bad json', { status: 400 })
    }
    await env.LOSTFM.put('stats', text)
    return new Response('ok')
  }
  return new Response('method not allowed', { status: 405, headers: { allow: 'GET, POST' } })
}

// constant-time compare via hashing both sides
async function sameText(a, b) {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))))
  const x = new Uint8Array(ha), y = new Uint8Array(hb)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}
