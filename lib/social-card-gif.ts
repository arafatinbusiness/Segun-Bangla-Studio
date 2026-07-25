/**
 * Social Card GIF Generator
 * Creates animated GIF versions of social cards with zoom/fade effects.
 */

export interface GifConfig {
  duration?: number      // Total duration in seconds (default 3)
  fps?: number          // Frames per second (default 10)
  zoom?: boolean        // Zoom in effect on image (default true)
  fadeIn?: boolean      // Fade in title (default true)
}

const DEFAULT_CONFIG: Required<GifConfig> = {
  duration: 3,
  fps: 10,
  zoom: true,
  fadeIn: true,
}

/**
 * Generate an animated social card GIF from canvas frames.
 * Renders the social card with animations and encodes as GIF.
 */
export async function generateSocialCardGif(
  canvas: HTMLCanvasElement,
  title: string,
  imageUrl: string | undefined,
  date: string,
  colors: {
    headerBg: string
    headerText: string
    brandingStripBg: string
    footerBg: string
    footerText: string
  },
  config: GifConfig = {}
): Promise<Blob> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const W = canvas.width
  const H = canvas.height

  const headerHeight = Math.round(H * 0.04)
  const imageHeight = Math.round(H * 0.55)
  const brandingStripHeight = Math.round(H * 0.05)
  const footerHeight = Math.round(H * 0.35)
  const paddingX = Math.round(W * 0.05)
  const brandFontSize = Math.round(H * 0.026)
  const dateFontSize = Math.round(H * 0.022)
  const titleFontSize = title.length > 80
    ? Math.round(H * 0.038)
    : title.length > 50
      ? Math.round(H * 0.042)
      : Math.round(H * 0.048)
  const ctaFontSize = Math.round(H * 0.024)

  // Load GIF.js dynamically
  const GIF = (await import('gif.js')).default

  const totalFrames = cfg.duration * cfg.fps
  const frameDelay = 1000 / cfg.fps

  // Create offscreen canvas for rendering
  const offscreen = document.createElement('canvas')
  offscreen.width = W
  offscreen.height = H
  const ctx = offscreen.getContext('2d')!

  // Pre-load image and icon
  let img: HTMLImageElement | null = null
  let iconImg: HTMLImageElement | null = null
  if (imageUrl) {
    try {
      img = await loadImage(imageUrl)
    } catch {}
  }
  try {
    iconImg = await loadImage('/favicon.png')
  } catch {}

  // Create GIF encoder
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: W,
    height: H,
    workerScript: '/gif.worker.js',
  })

  // Helper: draw a single static frame (non-animated parts)
  const drawBaseFrame = (frameIdx: number, totalFrames: number) => {
    const progress = frameIdx / totalFrames

    // Header
    ctx.fillStyle = colors.headerBg
    ctx.fillRect(0, 0, W, headerHeight)
    ctx.fillStyle = colors.headerText
    ctx.font = `bold ${brandFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('Segun Bangla', paddingX, headerHeight / 2)
    ctx.textAlign = 'right'
    ctx.font = `${dateFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
    ctx.fillText(date, W - paddingX, headerHeight / 2)

    // Image area with zoom effect
    const imageTop = headerHeight
    if (img) {
      const zoomScale = cfg.zoom ? 1 + (progress * 0.08) : 1
      const imgAspect = img.naturalWidth / img.naturalHeight
      const areaAspect = W / imageHeight
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      if (imgAspect > areaAspect) {
        sh = img.naturalHeight
        sw = sh * areaAspect
        sx = (img.naturalWidth - sw) / 2
      } else {
        sw = img.naturalWidth
        sh = sw / areaAspect
        sy = (img.naturalHeight - sh) / 2
      }

      const cw = W * zoomScale
      const ch = imageHeight * zoomScale
      const cx = (W - cw) / 2
      const cy = imageTop + (imageHeight - ch) / 2
      ctx.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch)
    } else {
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, imageTop, W, imageHeight)
    }

    // Draw overlapping icon at boundary between image and footer
    if (iconImg) {
      const overlapIconSize = Math.round(H * 0.065)
      const overlapIconWidth = Math.round(overlapIconSize * (iconImg.naturalWidth / iconImg.naturalHeight))
      const overlapIconX = Math.round((W - overlapIconWidth) / 2)
      const overlapIconY = Math.round(imageTop + imageHeight - overlapIconSize * 0.5)
      ctx.drawImage(iconImg, overlapIconX, overlapIconY, overlapIconWidth, overlapIconSize)
    }

    // Footer (no separate branding strip — icon overlaps)
    const footerTop = imageTop + imageHeight
    ctx.fillStyle = colors.footerBg
    ctx.fillRect(0, footerTop, W, footerHeight)

    // Title with fade-in effect
    if (cfg.fadeIn) {
      ctx.globalAlpha = Math.min(progress * 2, 1)
    }
    ctx.fillStyle = colors.footerText
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const titleAreaTop = footerTop + Math.round(H * 0.04)
    const titleMaxWidth = W - paddingX * 2
    ctx.font = `bold ${titleFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
    
    // Word wrap title
    const words = title.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word
      if (ctx.measureText(testLine).width > titleMaxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    
    const totalTextHeight = lines.length * titleFontSize * 1.4
    let ty = titleAreaTop + (Math.round(H * 0.35 - H * 0.08) - totalTextHeight) / 2
    lines.forEach(l => {
      ctx.fillText(l, W / 2, ty)
      ty += titleFontSize * 1.4
    })
    ctx.globalAlpha = 1

    // CTA text
    const ctaY = footerTop + footerHeight - Math.round(H * 0.045)
    ctx.fillStyle = colors.footerText + 'CC'
    ctx.font = `${ctaFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
    ctx.textBaseline = 'bottom'
    ctx.fillText('« বিস্তারিত কমেন্টে »', W / 2, ctaY)

    // Watermark
    const wmY = footerTop + footerHeight - Math.round(H * 0.012)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = `bold ${Math.round(H * 0.022)}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillText('www.segunbangla.com', paddingX, wmY)
    ctx.textAlign = 'right'
    ctx.fillText('সেগুন বাংলা', W - paddingX, wmY)
  }

  // Generate all frames
  for (let i = 0; i <= totalFrames; i++) {
    drawBaseFrame(i, totalFrames)
    gif.addFrame(ctx, { copy: true, delay: frameDelay })
  }

  // Render GIF
  return new Promise((resolve, reject) => {
    gif.on('progress', (p: number) => {})
    gif.on('finished', (blob: Blob) => resolve(blob))
    gif.on('error', (err: Error) => reject(err))
    gif.render()
  })
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      const img2 = new Image()
      img2.crossOrigin = 'anonymous'
      img2.onload = () => resolve(img2)
      img2.onerror = () => reject(new Error(`Failed: ${url}`))
      img2.src = url
    }
    img.src = proxyUrl
  })
}