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

let baseImage = null
let overlayImage = null
let renderVersion = 0

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
  return value ? `${value}...` : ''
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
    if (version !== renderVersion) return null
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
  let requestedSize = Number(textSize.value)
  const mask = document.createElement('canvas')
  mask.width = width * supersample
  mask.height = height * supersample
  const maskContext = mask.getContext('2d')
  await document.fonts.load(`900 ${requestedSize * supersample}px "Jost Black"`)
  if (version !== renderVersion) return
  maskContext.fillStyle = '#fff'
  maskContext.font = `900 ${requestedSize * supersample}px "Jost Black"`
  maskContext.textBaseline = 'alphabetic'
  maskContext.fillText(text, 16 * supersample, 118 * supersample)
  let bounds = findAlphaBounds(maskContext.getImageData(0, 0, mask.width, mask.height))
  while (bounds && bounds.width > 96 * supersample && requestedSize > 2) {
    requestedSize -= 1
    maskContext.clearRect(0, 0, mask.width, mask.height)
    maskContext.font = `900 ${requestedSize * supersample}px "Jost Black"`
    maskContext.fillText(text, 16 * supersample, 118 * supersample)
    bounds = findAlphaBounds(maskContext.getImageData(0, 0, mask.width, mask.height))
  }
  if (!bounds) return

  const targetWidth = Math.min(96, stripWidth - 4)
  const targetHeight = Math.max(1, Math.round(bounds.height / bounds.width * targetWidth))
  const textMask = document.createElement('canvas')
  textMask.width = targetWidth
  textMask.height = targetHeight
  const textMaskContext = textMask.getContext('2d')
  textMaskContext.imageSmoothingEnabled = true
  textMaskContext.imageSmoothingQuality = 'high'
  textMaskContext.drawImage(mask, bounds.left, bounds.top, bounds.width, bounds.height, 0, 0, targetWidth, targetHeight)

  const textLayer = document.createElement('canvas')
  textLayer.width = width
  textLayer.height = height
  const textContext = textLayer.getContext('2d')
  textContext.fillStyle = textColor.value
  textContext.fillRect(Math.round(width * 16 / 128), Math.round(height * 96 / 128), targetWidth, targetHeight)
  textContext.globalCompositeOperation = 'destination-in'
  textContext.drawImage(textMask, Math.round(width * 16 / 128), Math.round(height * 96 / 128), targetWidth, targetHeight)
  ctx.globalAlpha = Number(opacity.value) / 100
  ctx.drawImage(textLayer, 0, 0)
  ctx.globalAlpha = 1

  const strip = document.createElement('canvas')
  strip.width = stripWidth
  strip.height = stripHeight
  strip.getContext('2d').drawImage(canvas, stripX, stripY, stripWidth, stripHeight, 0, 0, stripWidth, stripHeight)
  const degraded = await degradeStrip(strip, version)
  if (degraded && version === renderVersion) ctx.drawImage(degraded, stripX, stripY, stripWidth, stripHeight)
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
;[messageInput, textSize, opacity, overlayOpacity, textColor, coverOriginal, crustPasses].forEach(input => input.addEventListener('input', () => {
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

document.fonts.load('900 224px "Jost Black"').then(fonts => {
  if (!fonts.length || !document.fonts.check('900 224px "Jost Black"')) {
    status.textContent = 'Jost Black failed to load; refusing to render a fallback font.'
    return
  }
  loadBuiltInImage()
})
