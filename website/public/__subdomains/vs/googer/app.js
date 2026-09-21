const canvas = document.querySelector('#preview')
const ctx = canvas.getContext('2d')
const baseInput = document.querySelector('#base-file')
const overlayInput = document.querySelector('#overlay-file')
const messageInput = document.querySelector('#message')
const status = document.querySelector('#status')
const baseName = document.querySelector('#base-name')
const overlayName = document.querySelector('#overlay-name')
const textSize = document.querySelector('#text-size')
const opacity = document.querySelector('#opacity')
const overlayOpacity = document.querySelector('#overlay-opacity')
const textColor = document.querySelector('#text-color')
const coverOriginal = document.querySelector('#cover-original')
const coverColor = document.querySelector('#cover-color')

let baseImage = null
let overlayImage = null

function loadBuiltInImage() {
  const image = new Image()
  image.onload = () => {
    baseImage = image
    status.textContent = 'Built-in Googer image loaded. Add an overlay or message.'
    render()
  }
  image.src = 'goog-image.png'
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = URL.createObjectURL(file)
  })
}

function wrapLines(text, maxWidth) {
  const lines = []
  text.split('\n').forEach(paragraph => {
    if (!paragraph) {
      lines.push('')
      return
    }
    let line = ''
    paragraph.split(/\s+/).forEach(word => {
      const candidate = line ? `${line} ${word}` : word
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    })
    lines.push(line)
  })
  return lines
}

function render() {
  if (!baseImage) {
    canvas.width = 640
    canvas.height = 360
    ctx.fillStyle = '#30211c'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#bda18e'
    ctx.font = '16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Choose a base image to preview it here', 320, 180)
    return
  }

  canvas.width = baseImage.naturalWidth || baseImage.width
  canvas.height = baseImage.naturalHeight || baseImage.height
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height)

  if (overlayImage) {
    ctx.globalAlpha = Number(overlayOpacity.value) / 100
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
  }

  if (coverOriginal.checked && messageInput.value.trim()) {
    const size = Number(textSize.value)
    const padding = Math.max(12, size * .55)
    const lines = messageInput.value.split('\n')
    const coverHeight = padding + lines.length * size * 1.2 + padding * .4
    ctx.fillStyle = coverColor.value
    ctx.fillRect(0, canvas.height - coverHeight, canvas.width, coverHeight)
  }

  const size = Number(textSize.value)
  const padding = Math.max(3, size * .55)
  const maxWidth = canvas.width - padding * 2
  ctx.font = `700 ${size}px ui-monospace, monospace`
  const lines = wrapLines(messageInput.value, maxWidth)
  const lineHeight = size * 1.2
  const textWidth = Math.min(maxWidth, Math.max(...lines.map(line => ctx.measureText(line).width), 0))
  const coverHeight = lines.length * lineHeight + padding * .8
  const coverWidth = textWidth + padding * 1.5
  const coverX = padding * .4
  const coverY = canvas.height - coverHeight - padding * .2

  if (coverOriginal.checked && messageInput.value.trim()) {
    ctx.fillStyle = coverColor.value
    ctx.fillRect(coverX, coverY, coverWidth, coverHeight)
  }

  ctx.globalAlpha = Number(opacity.value) / 100
  ctx.fillStyle = textColor.value
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line, index) => ctx.fillText(line, padding, coverY + padding * .4 + index * lineHeight))
  ctx.globalAlpha = 1
}

async function acceptFile(input, kind) {
  const file = input.files[0]
  if (!file) return
  try {
    const image = await loadImage(file)
    if (kind === 'base') {
      baseImage = image
      baseName.textContent = `${file.name} (${image.width} x ${image.height})`
    } else {
      overlayImage = image
      overlayName.textContent = `${file.name} (${image.width} x ${image.height})`
    }
    status.textContent = 'Rendered locally. Nothing was uploaded.'
    render()
  } catch {
    status.textContent = 'That image could not be opened by this browser.'
  }
}

baseInput.addEventListener('change', () => acceptFile(baseInput, 'base'))
overlayInput.addEventListener('change', () => acceptFile(overlayInput, 'overlay'))
;[messageInput, textSize, opacity, overlayOpacity, textColor, coverOriginal, coverColor].forEach(input => input.addEventListener('input', () => {
  if (input === textSize) input.nextElementSibling.value = `${input.value}px`
  if (input === opacity || input === overlayOpacity) input.nextElementSibling.value = `${input.value}%`
  render()
}))

document.querySelectorAll('.dropzone').forEach(zone => {
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragging') })
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'))
  zone.addEventListener('drop', event => {
    event.preventDefault()
    zone.classList.remove('dragging')
    const input = zone.querySelector('input')
    if (event.dataTransfer.files[0]) {
      input.files = event.dataTransfer.files
      input.dispatchEvent(new Event('change'))
    }
  })
})

document.querySelector('#clear').addEventListener('click', () => {
  baseImage = null
  overlayImage = null
  baseInput.value = ''
  overlayInput.value = ''
  baseName.textContent = 'Built-in Googer image'
  overlayName.textContent = 'Optional'
  status.textContent = 'Built-in Googer image restored.'
  loadBuiltInImage()
})

document.querySelector('#download').addEventListener('click', () => {
  if (!baseImage) {
    status.textContent = 'Choose a base image before exporting.'
    return
  }
  const link = document.createElement('a')
  link.download = 'googer-overlay.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
  status.textContent = 'PNG exported locally.'
})

loadBuiltInImage()
