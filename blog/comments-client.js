// Comment section for a post: loads approved comments, shows them as threads, and posts new ones.
// Comment text is markdown, rendered here with everything escaped first (no raw html, no images).
(() => {
  const root = document.getElementById('comments')
  if (!root) return
  const post = root.dataset.post
  const list = root.querySelector('.comment-list')
  const form = root.querySelector('form')
  const status = root.querySelector('.comment-status')
  const note = root.querySelector('.comment-note')
  const cancel = root.querySelector('.cancel-reply')
  const formHome = form.parentElement
  const field = (name) => form.elements[name]
  let replyTo = null

  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

  function inline(text) {
    const code = []
    let out = esc(text).replace(/`([^`\n]+)`/g, (_, c) => `\u0000${code.push(c) - 1}\u0000`)
    out = out
      .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s()]+)\)/g, '<a href="$2" rel="nofollow ugc noopener" target="_blank">$1</a>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])_([^_\n]+)_(?![_\w])/g, '$1<em>$2</em>')
    return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${code[i]}</code>`)
  }

  function markdown(src) {
    return src.replace(/\r\n/g, '\n').trim().split(/\n{2,}/).map((block) => {
      const lines = block.split('\n')
      if (lines.every((l) => /^>\s?/.test(l))) return `<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join('\n')).replace(/\n/g, '<br>')}</blockquote>`
      if (lines.every((l) => /^[-*]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`
      if (lines.every((l) => /^\d+[.)]\s+/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`
      return `<p>${inline(block).replace(/\n/g, '<br>')}</p>`
    }).join('')
  }

  const day = (iso) => `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`

  function render(comments) {
    const kids = new Map()
    for (const c of comments) {
      const key = c.parent ?? 0
      if (!kids.has(key)) kids.set(key, [])
      kids.get(key).push(c)
    }
    const branch = (parent) => {
      const items = kids.get(parent)
      if (!items) return ''
      return `<ol class="${parent ? 'replies' : 'thread'}">${items.map((c) => `
        <li id="comment-${c.id}">
          <article class="comment">
            <header>
              <strong>${esc(c.name)}</strong>${c.site ? ` <a class="site" href="https://${esc(c.site)}" rel="nofollow ugc noopener" target="_blank">${esc(c.site)}</a>` : ''}
              <time datetime="${esc(c.created)}">${day(c.created)}</time>
            </header>
            <div class="text">${markdown(c.body)}</div>
            <button type="button" class="reply" data-id="${c.id}" aria-label="reply to ${esc(c.name)}">reply</button>
          </article>
          ${branch(c.id)}
        </li>`).join('')}</ol>`
    }
    list.innerHTML = branch(0) || '<p class="empty">no comments yet. you could be first!</p>'
  }

  function setMode(mode) {
    const closed = mode === 'off' || mode === 'locked'
    form.hidden = closed
    const closedNote = root.querySelector('.comments-off')
    closedNote.hidden = !closed
    closedNote.textContent = mode === 'locked' ? 'this post is closed to new comments.' : 'comments are turned off right now.'
    note.textContent = mode === 'review' ? 'comments are read by izie before they show up.' : ''
    root.dataset.mode = mode
  }

  async function load() {
    try {
      const res = await fetch(`/api/comments?post=${encodeURIComponent(post)}`)
      if (!res.ok) throw new Error(res.status)
      const data = await res.json()
      render(data.comments)
      setMode(data.mode)
    } catch {
      list.innerHTML = '<p class="empty">comments are not available right now.</p>'
      form.hidden = true
    }
  }

  function moveForm(under) {
    replyTo = under?.dataset.id ?? null
    if (under) under.closest('.comment').after(form)
    else formHome.append(form)
    cancel.hidden = !under
    form.querySelector('h3').textContent = under ? `reply to ${under.getAttribute('aria-label').slice(9)}` : 'leave a comment'
    field('body').focus()
  }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('button.reply')
    if (btn) moveForm(btn)
  })
  cancel.addEventListener('click', () => moveForm(null))

  try {
    field('name').value = localStorage.getItem('comment-name') || ''
    field('contact').value = localStorage.getItem('comment-contact') || ''
  } catch {}

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const send = form.querySelector('button[type=submit]')
    send.disabled = true
    status.className = 'comment-status'
    status.textContent = 'sending...'
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          post, parent: replyTo,
          name: field('name').value, contact: field('contact').value,
          body: field('body').value, website: field('website').value,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'something went wrong')
      try {
        localStorage.setItem('comment-name', field('name').value)
        localStorage.setItem('comment-contact', field('contact').value)
      } catch {}
      field('body').value = ''
      moveForm(null)
      status.textContent = data.status === 'approved' ? 'posted!' : 'thanks! it will show up once izie has read it.'
      if (data.status === 'approved') load()
    } catch (err) {
      status.className = 'comment-status bad'
      status.textContent = err.message
    } finally {
      send.disabled = false
    }
  })

  load()
})()
