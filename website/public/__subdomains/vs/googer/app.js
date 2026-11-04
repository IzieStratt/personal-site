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
const crustPasses = document.querySelector('#crust-passes')
const addEllipsis = document.querySelector('#add-ellipsis')

let baseImage = null
let overlayImage = null
let renderVersion = 0
// Text box in 128-unit image space. Drag it to move, drag a corner handle to resize.
const box = { x: 14, y: 91, w: 100, h: 35 }
// The text box UI is built here so the change lives in this one file.
const stage = document.createElement('div')
stage.id = 'stage'
stage.className = 'stage'
canvas.parentNode.insertBefore(stage, canvas)
stage.appendChild(canvas)
const boxEl = document.createElement('div')
boxEl.id = 'text-box'
boxEl.className = 'text-box'
boxEl.title = 'Drag to move, drag a corner to resize'
boxEl.dataset.handle = 'drag'
for (const corner of ['nw', 'ne', 'sw', 'se']) {
  const handleEl = document.createElement('i')
  handleEl.dataset.handle = corner
  boxEl.appendChild(handleEl)
}
stage.appendChild(boxEl)
const boxStyle = document.createElement('style')
boxStyle.textContent = `
.stage { position: relative; display: block; width: min(100%, 512px); margin: 0 auto; touch-action: none; }
.stage canvas { width: 100%; height: auto; image-rendering: pixelated; }
.text-box { position: absolute; border: 2px dashed #e374d6; cursor: move; touch-action: none; box-shadow: 0 0 0 1px rgba(0,0,0,.4); }
.text-box i { position: absolute; width: 14px; height: 14px; background: #e374d6; border: 2px solid #171211; border-radius: 3px; }
.text-box i[data-handle="nw"] { left: -8px; top: -8px; cursor: nwse-resize; }
.text-box i[data-handle="ne"] { right: -8px; top: -8px; cursor: nesw-resize; }
.text-box i[data-handle="sw"] { left: -8px; bottom: -8px; cursor: nesw-resize; }
.text-box i[data-handle="se"] { right: -8px; bottom: -8px; cursor: nwse-resize; }`
document.head.appendChild(boxStyle)
const hint = document.querySelector('.hint')
if (hint) hint.textContent = 'Drag the dashed text box to move it; drag a corner to resize. Text wraps and shrinks to fit inside it. ' + hint.textContent

function syncBox() {
  boxEl.style.left = `${box.x / 128 * 100}%`
  boxEl.style.top = `${box.y / 128 * 100}%`
  boxEl.style.width = `${box.w / 128 * 100}%`
  boxEl.style.height = `${box.h / 128 * 100}%`
}

function attachBoxDrag() {
  boxEl.addEventListener('pointerdown', event => {
    event.preventDefault()
    const handle = event.target.dataset.handle || 'drag'
    const rect = stage.getBoundingClientRect()
    const start = { ...box }
    const startX = event.clientX
    const startY = event.clientY
    boxEl.setPointerCapture(event.pointerId)
    const move = e => {
      const dx = (e.clientX - startX) / rect.width * 128
      const dy = (e.clientY - startY) / rect.height * 128
      let { x, y, w, h } = start
      if (handle === 'drag') { x += dx; y += dy }
      if (handle.includes('e')) w += dx
      if (handle.includes('s')) h += dy
      if (handle.includes('w')) { x += dx; w -= dx }
      if (handle.includes('n')) { y += dy; h -= dy }
      w = Math.max(8, w)
      h = Math.max(6, h)
      if (handle.includes('w')) x = start.x + start.w - w
      if (handle.includes('n')) y = start.y + start.h - h
      x = Math.min(Math.max(0, x), 128 - w)
      y = Math.min(Math.max(0, y), 128 - h)
      w = Math.min(w, 128 - x)
      h = Math.min(h, 128 - y)
      Object.assign(box, { x, y, w, h })
      syncBox()
      render()
    }
    const up = () => {
      boxEl.removeEventListener('pointermove', move)
      boxEl.removeEventListener('pointerup', up)
      boxEl.removeEventListener('pointercancel', up)
    }
    boxEl.addEventListener('pointermove', move)
    boxEl.addEventListener('pointerup', up)
    boxEl.addEventListener('pointercancel', up)
  })
}
syncBox()
attachBoxDrag()

function loadBuiltInImage() {
  const image = new Image()
  image.onload = () => {
    baseImage = image
    status.textContent = 'Built-in Goog image loaded. Add an overlay or message.'
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

function messageWithEllipsis() {
  const value = messageInput.value.replace(/\.+$/, '').trim()
  if (!value) return ''
  return addEllipsis.checked ? `${value}...` : value
}

function findAlphaBounds(imageData) {
  let left = imageData.width
  let top = imageData.height
  let right = 0
  let bottom = 0
  for (let y = 0; y < imageData.height; y += 1) {
    for (let x = 0; x < imageData.width; x += 1) {
      if (imageData.data[(y * imageData.width + x) * 4 + 3] > 0) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x + 1)
        bottom = Math.max(bottom, y + 1)
      }
    }
  }
  return right > left ? { left, top, width: right - left, height: bottom - top } : null
}

async function jpegRound(source, quality) {
  const image = new Image()
  image.src = source.toDataURL('image/jpeg', quality / 100)
  await image.decode()
  return image
}

async function degradeStrip(strip, version) {
  // These are the exact values produced by random.seed(2) in the supplied
  // Python pipeline: randint(2, 3), then scale/ interpolation/ quality per pass.
  const passes = [
    [0.5774754362215221, 'bicubic', 38],
    [0.770790996720557, 'nearest', 47],
    [0.6254749892784898, 'bilinear', 30],
    [0.7243612051336009, 'bilinear', 55],
    [0.7415414014314081, 'nearest', 60],
  ].slice(0, Number(crustPasses.value))
  let current = strip
  for (const [scale, interpolation, quality] of passes) {
    if (version !== renderVersion) return
    const small = document.createElement('canvas')
    small.width = Math.max(1, Math.floor(strip.width * scale))
    small.height = Math.max(1, Math.floor(strip.height * scale))
    const smallContext = small.getContext('2d')
    smallContext.imageSmoothingEnabled = interpolation !== 'nearest'
    smallContext.imageSmoothingQuality = interpolation === 'bicubic' ? 'high' : 'low'
    smallContext.drawImage(current, 0, 0, small.width, small.height)
    const restored = document.createElement('canvas')
    restored.width = strip.width
    restored.height = strip.height
    const restoredContext = restored.getContext('2d')
    restoredContext.imageSmoothingEnabled = true
    restoredContext.imageSmoothingQuality = 'high'
    restoredContext.drawImage(small, 0, 0, restored.width, restored.height)
    current = await jpegRound(restored, quality)
  }
  return current
}

async function render() {
  const version = ++renderVersion
  if (!baseImage) return

  const width = baseImage.naturalWidth || baseImage.width
  const height = baseImage.naturalHeight || baseImage.height
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(baseImage, 0, 0, width, height)

  if (overlayImage) {
    ctx.globalAlpha = Number(overlayOpacity.value) / 100
    ctx.drawImage(overlayImage, 0, 0, width, height)
    ctx.globalAlpha = 1
  }

  const text = messageWithEllipsis()
  if (!text) return

  // Match the supplied generator: whiteout [14, 88, 124, 127], then render
  // Jost Black at 8x and scale the cropped mask to 96px wide.
  const stripX = Math.round(width * 14 / 128)
  const stripY = Math.round(height * 88 / 128)
  const stripWidth = Math.round(width * 110 / 128)
  const stripHeight = height - stripY
  if (coverOriginal.checked) {
    ctx.fillStyle = '#fff'
    // Pillow's [14, 88, 124, 127] rectangle includes both endpoints.
    ctx.fillRect(stripX, stripY, Math.round(width * 111 / 128), stripHeight)
  }

  const supersample = 8
  const unit = width / 128
  const boxPx = { x: box.x * unit, y: box.y * unit, w: box.w * unit, h: box.h * unit }
  const maxLineWidth = boxPx.w * supersample
  const maxBoxHeight = boxPx.h * supersample
  let requestedSize = Number(textSize.value) * unit
  await document.fonts.load(`900 ${requestedSize * supersample}px "Jost Black"`)
  if (version !== renderVersion) return
  const measure = document.createElement('canvas').getContext('2d')
  const setFont = size => { measure.font = `900 ${size * supersample}px "Jost Black"` }
  // Wrap inside the box: explicit newlines are kept, long lines break at spaces.
  // Start from the requested size and shrink until the wrapped block fits the box.
  const wrapLines = () => {
    const wrapped = []
    for (const paragraph of text.split(/\r?\n/)) {
      let line = ''
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word
        if (line && measure.measureText(candidate).width > maxLineWidth) {
          wrapped.push(line)
          line = word
        } else {
          line = candidate
        }
      }
      if (line) wrapped.push(line)
    }
    return wrapped
  }
  const fits = candidateLines => candidateLines.length * Math.round(requestedSize * supersample * 1.1) <= maxBoxHeight
    && candidateLines.every(line => measure.measureText(line).width <= maxLineWidth)
  let lines = []
  for (;;) {
    setFont(requestedSize)
    lines = wrapLines()
    if (fits(lines) || requestedSize <= 2) break
    requestedSize -= 1
  }
  if (!lines.length) return
  const lineHeight = Math.round(requestedSize * supersample * 1.1)
  const mask = document.createElement('canvas')
  mask.width = Math.ceil(maxLineWidth) + 16 * supersample
  mask.height = lineHeight * (lines.length + 1)
  const maskContext = mask.getContext('2d')
  maskContext.fillStyle = '#fff'
  maskContext.font = `900 ${requestedSize * supersample}px "Jost Black"`
  maskContext.textBaseline = 'alphabetic'
  lines.forEach((line, index) => {
    maskContext.fillText(line, 0, lineHeight * (index + 1))
  })
  const bounds = findAlphaBounds(maskContext.getImageData(0, 0, mask.width, mask.height))
  if (!bounds) return

  // Scale the ink to fill the box (keeping its shape), centered in the box.
  const fit = Math.min(boxPx.w / bounds.width, boxPx.h / bounds.height)
  const targetWidth = Math.max(1, Math.round(bounds.width * fit))
  const targetHeight = Math.max(1, Math.round(bounds.height * fit))
  const targetX = Math.round(boxPx.x + (boxPx.w - targetWidth) / 2)
  const targetY = Math.round(boxPx.y + (boxPx.h - targetHeight) / 2)
  const textMask = document.createElement('canvas')
  textMask.width = targetWidth
  textMask.height = targetHeight
  const textMaskContext = textMask.getContext('2d')
  textMaskContext.imageSmoothingEnabled = true
  textMaskContext.imageSmoothingQuality = 'high'
  textMaskContext.drawImage(mask, bounds.left, bounds.top, bounds.width, bounds.height, 0, 0, targetWidth, targetHeight)

  const strip = document.createElement('canvas')
  strip.width = stripWidth
  strip.height = stripHeight
  strip.getContext('2d').drawImage(canvas, stripX, stripY, stripWidth, stripHeight, 0, 0, stripWidth, stripHeight)
  const degraded = await degradeStrip(strip, version)
  if (degraded && version === renderVersion) ctx.drawImage(degraded, stripX, stripY, stripWidth, stripHeight)

  // Fry the text on its own, wherever the box sits, so the image under it is never touched:
  // render the ink black-on-white, run it through the same crunch, then use the result as the alpha.
  const pad = Math.ceil(3 * unit)
  const regionX = Math.max(0, targetX - pad)
  const regionY = Math.max(0, targetY - pad)
  const regionW = Math.min(width, targetX + targetWidth + pad) - regionX
  const regionH = Math.min(height, targetY + targetHeight + pad) - regionY
  if (regionW < 1 || regionH < 1) return
  const inkCanvas = document.createElement('canvas')
  inkCanvas.width = regionW
  inkCanvas.height = regionH
  const inkContext = inkCanvas.getContext('2d')
  inkContext.fillStyle = '#fff'
  inkContext.fillRect(0, 0, regionW, regionH)
  const blackInk = document.createElement('canvas')
  blackInk.width = targetWidth
  blackInk.height = targetHeight
  const blackInkContext = blackInk.getContext('2d')
  blackInkContext.fillStyle = '#000'
  blackInkContext.fillRect(0, 0, targetWidth, targetHeight)
  blackInkContext.globalCompositeOperation = 'destination-in'
  blackInkContext.drawImage(textMask, 0, 0)
  inkContext.drawImage(blackInk, targetX - regionX, targetY - regionY)
  const friedInk = await degradeStrip(inkCanvas, version)
  if (!friedInk || version !== renderVersion) return
  inkContext.drawImage(friedInk, 0, 0, regionW, regionH)
  const inkPixels = inkContext.getImageData(0, 0, regionW, regionH)
  const rgb = textColor.value.match(/[0-9a-f]{2}/gi).map(part => parseInt(part, 16))
  for (let i = 0; i < inkPixels.data.length; i += 4) {
    const luminance = (inkPixels.data[i] * 0.299 + inkPixels.data[i + 1] * 0.587 + inkPixels.data[i + 2] * 0.114)
    inkPixels.data[i] = rgb[0]
    inkPixels.data[i + 1] = rgb[1]
    inkPixels.data[i + 2] = rgb[2]
    inkPixels.data[i + 3] = Math.round(255 - luminance)
  }
  inkContext.putImageData(inkPixels, 0, 0)
  ctx.globalAlpha = Number(opacity.value) / 100
  ctx.drawImage(inkCanvas, regionX, regionY)
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
;[messageInput, textSize, opacity, overlayOpacity, textColor, coverOriginal, crustPasses, addEllipsis].forEach(input => input.addEventListener('input', () => {
  if (input === textSize) input.nextElementSibling.value = `${input.value}px`
  if (input === opacity || input === overlayOpacity) input.nextElementSibling.value = `${input.value}%`
  if (input === crustPasses) input.nextElementSibling.value = `${input.value} passes`
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
  baseName.textContent = 'Built-in Goog image'
  overlayName.textContent = 'Optional'
  status.textContent = 'Built-in Goog image restored.'
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

document.querySelector('#copy').addEventListener('click', async () => {
  if (!baseImage) {
    status.textContent = 'Choose a base image before copying.'
    return
  }
  if (!navigator.clipboard || !window.ClipboardItem) {
    status.textContent = 'This browser cannot copy images. Use Export PNG instead.'
    return
  }
  try {
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('no blob')), 'image/png'))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    status.textContent = 'Image copied to clipboard.'
  } catch {
    status.textContent = 'Copy failed (clipboard permission denied?). Use Export PNG instead.'
  }
})

document.fonts.load('900 224px "Jost Black"').then(fonts => {
  if (!fonts.length || !document.fonts.check('900 224px "Jost Black"')) {
    status.textContent = 'Jost Black failed to load; refusing to render a fallback font.'
    return
  }
  loadBuiltInImage()
})
