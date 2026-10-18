// Light/dark theme. With no saved choice the page follows the browser (prefers-color-scheme);
// the toggle saves an override in a cookie on .izie.top so it carries across the main site and the blog.
// Loaded without defer in <head> so the saved theme applies before the first paint.
(() => {
  const root = document.documentElement
  const media = matchMedia('(prefers-color-scheme: dark)')
  const domain = /(^|\.)izie\.top$/.test(location.hostname) ? '; domain=izie.top' : ''

  const saved = () => document.cookie.match(/(?:^|; )theme=(dark|light)/)?.[1]
  const current = () => saved() || (media.matches ? 'dark' : 'light')
  const apply = () => {
    const s = saved()
    if (s) root.dataset.theme = s
    else delete root.dataset.theme
  }
  apply()

  const MOON = '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>'
  const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'

  const init = () => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'theme-toggle'
    button.innerHTML = '<span class="theme-face"><svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"></svg><span class="theme-label"></span></span>'
    const icon = button.querySelector('svg')
    const label = button.querySelector('.theme-label')
    const render = () => {
      const next = current() === 'dark' ? 'light' : 'dark'
      icon.innerHTML = next === 'dark' ? MOON : SUN
      label.textContent = `${next} mode`
    }
    button.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark'
      // picking what the browser already asks for goes back to following the browser
      const systemTheme = media.matches ? 'dark' : 'light'
      document.cookie = next === systemTheme
        ? `theme=; path=/; max-age=0${domain}`
        : `theme=${next}; path=/; max-age=31536000; samesite=lax${domain}`
      apply()
      render()
    })
    media.addEventListener('change', render)
    render()
    document.body.prepend(button)
  }

  if (document.body) init()
  else document.addEventListener('DOMContentLoaded', init)
})()
