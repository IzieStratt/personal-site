// The online editor writes post sources and uploads straight to the repo with the GitHub contents API.
// Each save is one commit on the blog branch; the blog-build workflow then builds the pages and archives links.
// Needs a Cloudflare secret GITHUB_TOKEN (fine-grained token, Contents: read & write on this repo only).
const API = 'https://api.github.com'

async function gh(env, method, path, body) {
  return fetch(`${API}/repos/${env.BLOG_REPO}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'blog-editor',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const branch = (env) => env.BLOG_BRANCH || 'main'

// directory listing -> array of { name, path, sha }, [] when the folder doesn't exist yet
export async function listDir(env, dir) {
  const res = await gh(env, 'GET', `/contents/${dir}?ref=${branch(env)}`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`github listing failed (${res.status})`)
  return res.json()
}

export async function readText(env, path) {
  const res = await gh(env, 'GET', `/contents/${path}?ref=${branch(env)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`github read failed (${res.status})`)
  const data = await res.json()
  return new TextDecoder().decode(Uint8Array.from(atob(data.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)))
}

export async function fileSha(env, path) {
  const res = await gh(env, 'GET', `/contents/${path}?ref=${branch(env)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`github lookup failed (${res.status})`)
  return (await res.json()).sha
}

const toBase64 = (bytes) => {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

// returns the new commit sha
export async function putFile(env, path, bytes, message, sha) {
  const res = await gh(env, 'PUT', `/contents/${path}`, {
    message,
    content: toBase64(bytes),
    branch: branch(env),
    ...(sha ? { sha } : {}),
  })
  if (!res.ok) throw new Error(`github commit failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
  return (await res.json()).commit.sha
}

export async function deleteFile(env, path, message, sha) {
  const res = await gh(env, 'DELETE', `/contents/${path}`, { message, sha, branch: branch(env) })
  if (!res.ok) throw new Error(`github delete failed (${res.status})`)
  return (await res.json()).commit.sha
}

// git's blob id: sha1("blob <len>\0" + bytes). Tells "same file again" apart from "different file, same name".
export async function gitBlobSha(bytes) {
  const head = new TextEncoder().encode(`blob ${bytes.length}\0`)
  const all = new Uint8Array(head.length + bytes.length)
  all.set(head, 0)
  all.set(bytes, head.length)
  return [...new Uint8Array(await crypto.subtle.digest('SHA-1', all))].map((b) => b.toString(16).padStart(2, '0')).join('')
}
