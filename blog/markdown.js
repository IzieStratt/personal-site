// A small markdown renderer: just what a blog post needs, nothing executes, raw html is escaped.
//
// ctx.onLink(url) is called for every external http(s) link; return an archive path
// to have it shown as a superscript next to the link. The same hook doubles as the
// way to find out which links a post contains (see externalLinks).

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const safeUrl = (u) => (/^\s*(javascript|data|vbscript):/i.test(u) ? '#' : u)
const VIDEO = /\.(mp4|webm|mov|m4v)(\?|$)/i
const AUDIO = /\.(mp3|ogg|wav|m4a|flac|opus)(\?|$)/i

function media(alt, url) {
  const src = esc(safeUrl(url))
  if (VIDEO.test(url)) return `<video src="${src}" controls preload="metadata"></video>`
  if (AUDIO.test(url)) return `<audio src="${src}" controls preload="none"></audio>`
  return `<img src="${src}" alt="${esc(alt)}" loading="lazy">`
}

// Nutshell embeds these itself (youtube player, wikipedia api), so a copy of the page would only get in its way
const NUTSHELL_NATIVE = /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|wikipedia\.org)$/i

function anchor(inner, url, ctx, expandable) {
  const external = /^https?:\/\//i.test(url)
  const archive = external && ctx.onLink ? ctx.onLink(url.split('#')[0]) : null
  if (!archive) return `<a href="${esc(safeUrl(url))}">${inner}</a>`
  const sup = (href, label, title) => `<sup class="archive"><a href="${esc(href)}" title="${title}">${label}</a></sup>`
  let native = false
  try { native = NUTSHELL_NATIVE.test(new URL(url).hostname) } catch {}
  if (expandable && !native) {
    // A :nutshell link reads the page it points at, so point it at our copy: no cross-site fetch
    // (slow, and blocked by a lot of sites) and it keeps working if the original disappears.
    // data-source lets nutshell still credit the real site; the superscript goes to the original.
    const hash = url.includes('#') ? url.slice(url.indexOf('#')) : ''
    return `<a href="${esc(archive + hash)}" data-source="${esc(url)}">${inner}</a>${sup(url, 'original', 'the live page')}`
  }
  return `<a href="${esc(safeUrl(url))}">${inner}</a>${sup(archive, 'archive', 'archived copy')}`
}

function inline(src, ctx, plain = false) {
  const stash = []
  const hold = (html) => `\u0000${stash.push(html) - 1}\u0000`
  let s = src
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => hold(`<code>${esc(code.trim())}</code>`))
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt, url) => hold(media(alt, url)))
  if (!plain) {
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, text, url) => hold(anchor(inline(text, ctx, true), url, ctx, text.startsWith(':'))))
  }
  s = esc(s)
  if (!plain) {
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<>]+)/g, (whole, lead, raw) => {
      let url = raw.replace(/&amp;/g, '&')
      let tail = ''
      const trim = url.match(/[.,;:!?'")\]]+$/)
      if (trim && !(trim[0].startsWith(')') && url.includes('('))) { tail = trim[0]; url = url.slice(0, -tail.length) }
      return lead + hold(anchor(esc(url), url, ctx, false)) + esc(tail)
    })
  }
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?=\S)([^*]*?\S)\*(?![\w*])/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
  // restore (stashed pieces can contain other placeholders)
  while (/\u0000\d+\u0000/.test(s)) s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[i])
  return s
}

const BLOCK_START = /^(```|#{1,6}\s|>|\s*([-*]|\d+\.)\s+|(-{3,}|\*{3,}|_{3,})\s*$)/
const indentOf = (l) => l.match(/^\s*/)[0].replace(/\t/g, '  ').length

export function render(md, ctx = {}) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  if (!ctx.minHeading) {
    const depths = lines.filter((l) => /^#{1,6}\s/.test(l)).map((l) => l.match(/^#+/)[0].length)
    ctx = { ...ctx, minHeading: depths.length ? Math.min(...depths) : 1 }
  }
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    let m
    if (!line.trim()) { i++; continue }

    if ((m = line.match(/^```\s*([\w-]*)/))) {
      const code = []
      for (i++; i < lines.length && !/^```\s*$/.test(lines[i]); i++) code.push(lines[i])
      i++
      out.push(`<pre><code${m[1] ? ` class="language-${esc(m[1])}"` : ''}>${esc(code.join('\n'))}</code></pre>`)
    } else if ((m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) {
      // the post title is the h1, so the shallowest heading in a post becomes an h2
      const level = Math.min(6, m[1].length - (ctx.minHeading || 1) + 2)
      const id = m[2].toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
      out.push(`<h${level}${id ? ` id="${esc(id)}"` : ''}>${inline(m[2], ctx)}</h${level}>`)
      i++
    } else if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr>'); i++
    } else if (line.startsWith('>')) {
      const quote = []
      for (; i < lines.length && lines[i].startsWith('>'); i++) quote.push(lines[i].replace(/^>\s?/, ''))
      out.push(`<blockquote>${render(quote.join('\n'), ctx)}</blockquote>`)
    } else if ((m = line.match(/^(\s*)([-*]|\d+\.)\s+/))) {
      const base = indentOf(line)
      const ordered = /\d/.test(m[2])
      const items = []
      for (; i < lines.length; i++) {
        const l = lines[i]
        const marker = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/)
        if (marker && indentOf(l) === base) items.push({ text: marker[3], rest: [] })
        else if (l.trim() && indentOf(l) > base) items[items.length - 1].rest.push(l.slice(Math.min(indentOf(l), base + 2)))
        else if (!l.trim() && lines[i + 1] && indentOf(lines[i + 1]) > base) items[items.length - 1].rest.push('')
        else break
      }
      const tag = ordered ? 'ol' : 'ul'
      out.push(`<${tag}>${items.map((it) => `<li>${inline(it.text, ctx)}${it.rest.length ? render(it.rest.join('\n'), ctx) : ''}</li>`).join('')}</${tag}>`)
    } else {
      const para = []
      for (; i < lines.length && lines[i].trim() && (!para.length || !BLOCK_START.test(lines[i])); i++) para.push(lines[i])
      out.push(`<p>${inline(para.join('\n'), ctx)}</p>`)
    }
  }
  return out.join('\n')
}

const SKIP_HOST = /(^|\.)(izie\.top|youtube\.com|youtu\.be)$/i

// external links in a post that are worth archiving (our own site isn't going anywhere,
// and a youtube page is just a player shell)
export function externalLinks(md) {
  const found = new Set()
  render(md, {
    onLink(url) {
      try { if (!SKIP_HOST.test(new URL(url).hostname)) found.add(url.split('#')[0]) } catch {}
    },
  })
  return [...found]
}
