/**
 * Profile Card Generator for Segun Bangla Studio
 * Supports multiple templates with full color customization.
 *
 * Templates:
 *   Template 1 (segun-profile):  Centered portrait + name card on green bg
 *   Template 2 (mirror-quote):    Asymmetric quote card with subject on right
 */

export type ProfileCardFormat = 'portrait' | 'story' | 'square'
export type CardTemplateType = 'segun-profile' | 'mirror-quote'

const FORMAT_DIMENSIONS: Record<ProfileCardFormat, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
}

export interface ProfileCardColors {
  backgroundColor: string
  patternColor: string
  patternOpacity: number
  dateBadgeBg: string
  dateBadgeText: string
  portraitBorder: string
  nameColor: string
  designationColor: string
  constituencyColor: string
  partyColor: string
  quoteColor: string
  quoteSourceColor: string
  accentLineColor: string
  brandBarTop: string
  brandBarBottom: string
  brandTextColor: string
  newsBadgeBg: string
  newsBadgeText: string
  taglineBarBg: string
  taglineTextColor: string
  watermarkColor: string
  watermarkOpacity: number
  // Mirror template specific
  mirrorBgColor?: string        // #F2F2F2
  mirrorQuoteColor?: string     // #000000
  mirrorQuoteIconColor?: string // #E50000
  mirrorContentWidth?: number   // 60% of canvas
}

export const DEFAULT_COLORS_T1: ProfileCardColors = {
  backgroundColor: '#006747',
  patternColor: '#FFFFFF',
  patternOpacity: 0.035,
  dateBadgeBg: '#000000',
  dateBadgeText: '#FFFFFF',
  portraitBorder: '#FFFFFF',
  nameColor: '#FFFFFF',
  designationColor: '#FFFFFF',
  constituencyColor: '#FFFFFF',
  partyColor: '#FFD700',
  quoteColor: '#FFFFFF',
  quoteSourceColor: '#FFFFFF',
  accentLineColor: '#FFD700',
  brandBarTop: '#8B0000',
  brandBarBottom: '#6B0000',
  brandTextColor: '#FFFFFF',
  newsBadgeBg: '#FF0000',
  newsBadgeText: '#FFFFFF',
  taglineBarBg: '#004F35',
  taglineTextColor: '#FFFFFF',
  watermarkColor: '#FFFFFF',
  watermarkOpacity: 0.035,
}

export const DEFAULT_COLORS_T2: ProfileCardColors = {
  backgroundColor: '#F2F2F2',
  patternColor: '#CCCCCC',
  patternOpacity: 0.15,
  dateBadgeBg: '#000000',
  dateBadgeText: '#FFFFFF',
  portraitBorder: '#FFFFFF',
  nameColor: '#000000',
  designationColor: '#333333',
  constituencyColor: '#555555',
  partyColor: '#E50000',
  quoteColor: '#000000',
  quoteSourceColor: '#444444',
  accentLineColor: '#000000',
  brandBarTop: '#8B0000',
  brandBarBottom: '#6B0000',
  brandTextColor: '#FFFFFF',
  newsBadgeBg: '#E50000',
  newsBadgeText: '#FFFFFF',
  taglineBarBg: '#004F35',
  taglineTextColor: '#FFFFFF',
  watermarkColor: '#000000',
  watermarkOpacity: 0.06,
}

export function getDefaultColors(template: CardTemplateType): ProfileCardColors {
  return template === 'segun-profile' ? { ...DEFAULT_COLORS_T1 } : { ...DEFAULT_COLORS_T2 }
}

export const COLOR_PRESETS_T1: { name: string; colors: ProfileCardColors }[] = [
  { name: 'সেগুন সবুজ', colors: { ...DEFAULT_COLORS_T1 } },
  { name: 'নেভি ব্লু', colors: { ...DEFAULT_COLORS_T1, backgroundColor: '#1B2A4A', brandBarTop: '#0D1B3E', brandBarBottom: '#091430', taglineBarBg: '#0D1B3E' } },
  { name: 'কালো মার্জিত', colors: { ...DEFAULT_COLORS_T1, backgroundColor: '#1A1A2E', brandBarTop: '#16213E', brandBarBottom: '#0F172A', taglineBarBg: '#0F172A' } },
  { name: 'বারগান্ডি', colors: { ...DEFAULT_COLORS_T1, backgroundColor: '#4A1A2E', brandBarTop: '#6B1A3E', brandBarBottom: '#4A0F2A', taglineBarBg: '#2D1B2E', accentLineColor: '#C9A84C', partyColor: '#C9A84C' } },
  { name: 'ফরেস্ট', colors: { ...DEFAULT_COLORS_T1, backgroundColor: '#1B4A2E', brandBarTop: '#2E6B4A', brandBarBottom: '#1B4A2E', taglineBarBg: '#0F2E1B' } },
  { name: 'সানসেট অরেঞ্জ', colors: { ...DEFAULT_COLORS_T1, backgroundColor: '#4A2E1B', brandBarTop: '#6B3E1A', brandBarBottom: '#4A2E0F', taglineBarBg: '#2E1B0F' } },
]

export const COLOR_PRESETS_T2: { name: string; colors: ProfileCardColors }[] = [
  { name: 'মিরর ক্লাসিক', colors: { ...DEFAULT_COLORS_T2 } },
  { name: 'মিরর ডার্ক', colors: { ...DEFAULT_COLORS_T2, backgroundColor: '#1A1A1A', quoteColor: '#FFFFFF', nameColor: '#FFFFFF', designationColor: '#CCCCCC', constituencyColor: '#AAAAAA', quoteSourceColor: '#BBBBBB', watermarkColor: '#FFFFFF', patternColor: '#444444' } },
  { name: 'মিরর ব্লু', colors: { ...DEFAULT_COLORS_T2, backgroundColor: '#E8F0FE', nameColor: '#1A237E', designationColor: '#283593', quoteColor: '#1A237E', brandBarTop: '#283593', brandBarBottom: '#1A237E' } },
]

export interface ProfileCardData {
  personName: string
  designation: string
  constituency?: string
  party?: string
  portraitUrl?: string
  quote?: string
  quoteSource?: string
  showDate?: boolean
  date?: string
  sponsorName?: string
  sponsorLogoUrl?: string
  showWatermark?: boolean
  template?: CardTemplateType
  colors?: Partial<ProfileCardColors>
}

export async function generateAndDownloadProfileCard(
  data: ProfileCardData,
  filename: string = 'profile-card.png',
  format: ProfileCardFormat = 'portrait',
  onProgress?: (message: string) => void
): Promise<void> {
  const dims = FORMAT_DIMENSIONS[format]
  const W = dims.width
  const H = dims.height

  onProgress?.('প্রোফাইল কার্ড তৈরি হচ্ছে...')

  const template = data.template || 'segun-profile'
  
  if (template === 'mirror-quote') {
    await renderTemplateMirrorQuote(data, W, H, filename, onProgress)
  } else {
    await renderTemplateSegunProfile(data, W, H, filename, onProgress)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 1: Segun Profile — Centered portrait + name on green bg
// ═══════════════════════════════════════════════════════════════════════════
async function renderTemplateSegunProfile(
  data: ProfileCardData,
  W: number, H: number,
  filename: string,
  onProgress?: (message: string) => void
): Promise<void> {
  const C: ProfileCardColors = { ...DEFAULT_COLORS_T1, ...(data.colors || {}) }
  const FONT = '"Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif'

  const paddingX = Math.round(W * 0.06)
  const paddingY = Math.round(H * 0.035)
  const dateBadgeY = paddingY; const dateBadgeX = paddingX
  const portraitSize = Math.round(W * 0.40)
  const portraitCX = W / 2; const portraitCY = Math.round(H * 0.28)
  const textStartY = portraitCY + portraitSize / 2 + Math.round(H * 0.045)
  const quoteY = Math.round(H * 0.72)
  const footerBottom = Math.round(H * 0.11)
  const topBarH = Math.round(footerBottom * 0.65)
  const botBarH = footerBottom - topBarH

  const dateFS = Math.round(H * 0.022)
  const nameFS = data.personName.length > 12 ? Math.round(H * 0.042) : Math.round(H * 0.052)
  const desFS = Math.round(H * 0.028); const conFS = Math.round(H * 0.024)
  const partyFS = Math.round(H * 0.024); const quoteFS = Math.round(H * 0.025)
  const qSrcFS = Math.round(H * 0.02); const brandFS = Math.round(H * 0.028)
  const tagFS = Math.round(H * 0.02)

  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = C.backgroundColor; ctx.fillRect(0, 0, W, H)
  ctx.save(); ctx.globalAlpha = C.patternOpacity; ctx.strokeStyle = C.patternColor; ctx.lineWidth = 0.8
  const gs = 50
  for (let r = 0; r < H + gs; r += gs) for (let c = 0; c < W + gs; c += gs) {
    const x = c - (r % (gs*2))/2
    ctx.beginPath(); ctx.moveTo(x,r); ctx.lineTo(x+gs/2,r+gs/2); ctx.lineTo(x,r+gs); ctx.lineTo(x-gs/2,r+gs/2); ctx.closePath(); ctx.stroke()
  }
  ctx.restore()
  const vg = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.75)
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.12)')
  ctx.fillStyle = vg; ctx.fillRect(0,0,W,H)

  // Date
  if (data.showDate && data.date) {
    const bp = Math.round(H * 0.012)
    ctx.font = `bold ${dateFS}px ${FONT}`; const m = ctx.measureText(data.date)
    const bw = m.width + bp*4; const bh = dateFS*1.4 + bp*2; const br = bh/2
    ctx.fillStyle = C.dateBadgeBg
    ctx.beginPath(); ctx.moveTo(dateBadgeX+br,dateBadgeY); ctx.lineTo(dateBadgeX+bw-br,dateBadgeY)
    ctx.quadraticCurveTo(dateBadgeX+bw,dateBadgeY,dateBadgeX+bw,dateBadgeY+br)
    ctx.lineTo(dateBadgeX+bw,dateBadgeY+bh-br); ctx.quadraticCurveTo(dateBadgeX+bw,dateBadgeY+bh,dateBadgeX+bw-br,dateBadgeY+bh)
    ctx.lineTo(dateBadgeX+br,dateBadgeY+bh); ctx.quadraticCurveTo(dateBadgeX,dateBadgeY+bh,dateBadgeX,dateBadgeY+bh-br)
    ctx.lineTo(dateBadgeX,dateBadgeY+br); ctx.quadraticCurveTo(dateBadgeX,dateBadgeY,dateBadgeX+br,dateBadgeY); ctx.closePath(); ctx.fill()
    ctx.fillStyle = C.dateBadgeText; ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText(data.date, dateBadgeX+bw/2, dateBadgeY+bh/2)
  }

  // Portrait
  const bW = 5
  if (data.portraitUrl) {
    let img: HTMLImageElement|null = null; try { img = await loadImage(data.portraitUrl) } catch {}
    if (img) {
      ctx.save(); ctx.shadowColor='rgba(0,0,0,0.3)'; ctx.shadowBlur=25; ctx.shadowOffsetY=5
      ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2+bW,0,Math.PI*2); ctx.fillStyle=C.portraitBorder; ctx.fill(); ctx.restore()
      ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2+bW,0,Math.PI*2); ctx.fillStyle=C.portraitBorder; ctx.fill()
      ctx.save(); ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2,0,Math.PI*2); ctx.closePath(); ctx.clip()
      const md = Math.min(img.naturalWidth,img.naturalHeight)
      ctx.drawImage(img,(img.naturalWidth-md)/2,(img.naturalHeight-md)/2,md,md,portraitCX-portraitSize/2,portraitCY-portraitSize/2,portraitSize,portraitSize)
      ctx.restore()
    } else { ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2+bW,0,Math.PI*2); ctx.fillStyle=C.portraitBorder; ctx.fill()
      ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fill() }
  } else {
    ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2+bW,0,Math.PI*2); ctx.fillStyle=C.portraitBorder; ctx.fill()
    ctx.beginPath(); ctx.arc(portraitCX,portraitCY,portraitSize/2,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fill()
  }

  // Text
  const mW = W - paddingX*3; let ty = textStartY
  ctx.fillStyle=C.nameColor; ctx.font=`bold ${nameFS}px ${FONT}`; ctx.textAlign='center'; ctx.textBaseline='top'
  const nl = wrapText(ctx,data.personName,mW)
  nl.forEach((l,i)=>ctx.fillText(l,W/2,ty+i*nameFS*1.3)); ty += nl.length*nameFS*1.3 + H*0.01

  if (data.designation) {
    const lw = W*0.12; ctx.strokeStyle=C.accentLineColor; ctx.lineWidth=2.5
    ctx.beginPath(); ctx.moveTo(W/2-lw/2,ty); ctx.lineTo(W/2+lw/2,ty); ctx.stroke()
    ty += H*0.018
  }
  if (data.designation) {
    ctx.fillStyle=C.designationColor; ctx.globalAlpha=0.88
    ctx.font=`normal ${desFS}px ${FONT}`; ctx.textBaseline='top'
    const dl = wrapText(ctx,data.designation,mW)
    dl.forEach((l,i)=>ctx.fillText(l,W/2,ty+i*desFS*1.35)); ctx.globalAlpha=1; ty += dl.length*desFS*1.4
  }
  if (data.constituency) {
    ctx.fillStyle=C.constituencyColor; ctx.globalAlpha=0.7
    ctx.font=`normal ${conFS}px ${FONT}`; ctx.textBaseline='top'
    const cl = wrapText(ctx,data.constituency,mW)
    cl.forEach((l,i)=>ctx.fillText(l,W/2,ty+H*0.004+i*conFS*1.35)); ctx.globalAlpha=1; ty += cl.length*conFS*1.35
  }
  if (data.party) { ctx.fillStyle=C.partyColor; ctx.font=`bold ${partyFS}px ${FONT}`; ctx.textBaseline='top'
    ctx.fillText(`【${data.party}】`,W/2,ty+H*0.014) }

  // Quote
  if (data.quote) {
    let qy = quoteY; ctx.fillStyle=C.quoteColor; ctx.globalAlpha=0.85
    ctx.font=`normal ${quoteFS}px ${FONT}`; ctx.textAlign='center'; ctx.textBaseline='top'
    const ql = wrapText(ctx,data.quote,W-paddingX*4)
    ql.forEach(l=>{ctx.fillText(l,W/2,qy); qy+=quoteFS*1.4}); ctx.globalAlpha=1
    if (data.quoteSource) {
      ctx.fillStyle=C.quoteSourceColor; ctx.globalAlpha=0.55
      ctx.font=`normal ${qSrcFS}px ${FONT}`; ctx.textAlign='right'
      ctx.fillText(`— ${data.quoteSource}`,W-paddingX*2,qy+H*0.012); ctx.globalAlpha=1
    }
  }

  // Watermark
  if (data.showWatermark !== false) {
    ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(-Math.PI/6)
    ctx.fillStyle=C.watermarkColor; ctx.globalAlpha=C.watermarkOpacity
    ctx.font=`bold ${W*0.1}px ${FONT}`; ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText('সেগুন বাংলা',0,0); ctx.restore(); ctx.globalAlpha=1
  }

  // Footer
  const tby = H - footerBottom; const bby = tby + topBarH
  const bg = ctx.createLinearGradient(0,tby,0,tby+topBarH)
  bg.addColorStop(0,C.brandBarTop); bg.addColorStop(1,C.brandBarBottom)
  ctx.fillStyle=bg; ctx.fillRect(0,tby,W,topBarH)
  ctx.fillStyle=C.brandTextColor; ctx.font=`bold ${brandFS}px ${FONT}`; ctx.textAlign='left'; ctx.textBaseline='middle'
  ctx.fillText('Segun Bangla',paddingX,tby+topBarH/2)
  const nFS = Math.round(brandFS*0.75); ctx.font=`bold ${nFS}px Arial,sans-serif`
  const nw = ctx.measureText('NEWS').width; const np = Math.round(nFS*0.35)
  const nbx = paddingX+ctx.measureText('Segun Bangla ').width-np
  const nby = tby+Math.round((topBarH-nFS*1.2)/2)
  ctx.fillStyle=C.newsBadgeBg; ctx.fillRect(nbx,nby,nw+np*2,Math.round(nFS*1.2))
  ctx.fillStyle=C.newsBadgeText; ctx.fillText('NEWS',nbx+np,nby+Math.round(nFS*0.6))
  ctx.fillStyle=C.taglineBarBg; ctx.fillRect(0,bby,W,botBarH)
  ctx.fillStyle=C.taglineTextColor; ctx.font=`normal ${tagFS}px ${FONT}`; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('সেগুন বাংলা • সত্যের সন্ধানে',W/2,bby+botBarH/2)

  await openDownload(canvas, data.personName, filename, onProgress)
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2: Quote Card — Asymmetric layout with quote + speaker metadata
// ═══════════════════════════════════════════════════════════════════════════
async function renderTemplateMirrorQuote(
  data: ProfileCardData,
  W: number, H: number,
  filename: string,
  onProgress?: (message: string) => void
): Promise<void> {
  const C: ProfileCardColors = { ...DEFAULT_COLORS_T2, ...(data.colors || {}) }
  const FONT = '"Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif'

  // ─── Layout Grid ─────────────────────────────────────────────────────────
  // Quote text spans FULL width (flows behind image on right).
  // Metadata below divider stays in left ~60% column.
  const padX = Math.round(W * 0.04)       // horizontal padding
  const padY = Math.round(H * 0.035)      // vertical padding
  const leftW = Math.round(W * 0.60)      // left column for metadata
  const rightW = W - leftW                // right image column width
  const textX = padX                      // left edge of text
  const fullTextW = W - padX * 2          // quote uses FULL card width
  
  // Footer: solid black (#000000) top bar + dark green (#074723) bottom bar
  const footerTopBarH = Math.round(H * 0.065)
  const footerBotBarH = Math.round(H * 0.05)
  const footerTotalH = footerTopBarH + footerBotBarH


  // Divider line Y: ~52% from top (halfway through card)
  const dividerY = Math.round(H * 0.52)

  // ─── Dynamic Font Sizes ──────────────────────────────────────────────────
  const dateFS = Math.round(H * 0.022)                       // date badge
  const quoteFS = data.quote
    ? (data.quote.length > 60 ? Math.round(H * 0.06) : data.quote.length > 30 ? Math.round(H * 0.068) : Math.round(H * 0.076))
    : Math.round(H * 0.076)
  const conFS = Math.round(H * 0.022)       // constituency
  const partyFS = Math.round(H * 0.022)     // party badge
  const nameFS = data.personName.length > 20 ? Math.round(H * 0.032)
    : data.personName.length > 12 ? Math.round(H * 0.036) : Math.round(H * 0.04)
  const desFS = data.designation.length > 25 ? Math.round(H * 0.02) : Math.round(H * 0.024)
  const brandFS = Math.round(H * 0.026)
  const tagFS = Math.round(H * 0.018)

  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ─── 1. Background ─────────────────────────────────────────────────────
  ctx.fillStyle = C.backgroundColor  // #F2F2F2
  ctx.fillRect(0, 0, W, H)

  // Geometric pattern overlay (low-opacity lines + polygons)
  ctx.save(); ctx.globalAlpha = C.patternOpacity; ctx.strokeStyle = C.patternColor; ctx.lineWidth = 1
  const glines = [
    [0.05,0.1,0.3,0.4], [0.6,0.05,0.9,0.35], [0.1,0.5,0.4,0.7], [0.7,0.5,0.95,0.8],
    [0.2,0.8,0.5,0.95], [0.02,0.3,0.25,0.6], [0.5,0.1,0.7,0.4],
  ]
  glines.forEach(([x1,y1,x2,y2]) => { ctx.beginPath(); ctx.moveTo(W*x1,H*y1); ctx.lineTo(W*x2,H*y2); ctx.stroke() })
  const gpolys = [
    [[0.1,0.15],[0.25,0.1],[0.3,0.25],[0.15,0.3]],
    [[0.7,0.2],[0.85,0.15],[0.9,0.3],[0.75,0.35]],
    [[0.1,0.6],[0.2,0.55],[0.25,0.7],[0.15,0.75]],
  ]
  gpolys.forEach(pts => {
    ctx.beginPath(); ctx.moveTo(W*pts[0][0],H*pts[0][1])
    for(let i=1;i<pts.length;i++) ctx.lineTo(W*pts[i][0],H*pts[i][1])
    ctx.closePath(); ctx.stroke()
  })
  ctx.restore()

  // ─── 2. Date Badge (top-left) ──────────────────────────────────────────
  // Pill shape: black bg, white text, border-radius 50px
  if (data.showDate && data.date) {
    const bp = Math.round(H * 0.012)
    ctx.font = `bold ${dateFS}px ${FONT}`
    const dm = ctx.measureText(data.date)
    const bw = dm.width + bp * 4
    const bh = dateFS * 1.4 + bp * 2
    const br = bh / 2

    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(textX + br, padY); ctx.lineTo(textX + bw - br, padY)
    ctx.quadraticCurveTo(textX + bw, padY, textX + bw, padY + br)
    ctx.lineTo(textX + bw, padY + bh - br)
    ctx.quadraticCurveTo(textX + bw, padY + bh, textX + bw - br, padY + bh)
    ctx.lineTo(textX + br, padY + bh)
    ctx.quadraticCurveTo(textX, padY + bh, textX, padY + bh - br)
    ctx.lineTo(textX, padY + br)
    ctx.quadraticCurveTo(textX, padY, textX + br, padY)
    ctx.closePath(); ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(data.date, textX + bw / 2, padY + bh / 2)
  }

  // ─── 3. Opening + Closing Quote Marks ────────────────────────────────
  // Stylized red double-quotation marks — opening at start, closing at end
  const iconY = padY + Math.round(H * 0.08)  // extra space below date badge
  const rectW = Math.round(W * 0.018)
  const rectH = Math.round(H * 0.055)
  const rectGap = Math.round(W * 0.008)
  
  ctx.fillStyle = '#E50000'
  // Left rectangle
  ctx.fillRect(textX, iconY, rectW, rectH)
  // Right rectangle (with gap)
  ctx.fillRect(textX + rectW + rectGap, iconY, rectW, rectH)

  // ─── 4. Quote Text ──────────────────────────────────────────────────
  const quoteY = iconY + rectH + Math.round(H * 0.025)
  ctx.fillStyle = C.quoteColor  // #000000
  ctx.font = `bold ${quoteFS}px ${FONT}`
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'

  const quoteLines = wrapText(ctx, data.quote || 'বক্তব্য দিন', fullTextW)
  let qy = quoteY
  const qLineH = Math.round(quoteFS * 1.4)
  const lastLineIdx = quoteLines.length - 1
  
  // Draw the opening quote mark before the text begins (left of first line)
  ctx.fillStyle = C.quoteColor
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  
  // Opening quote at the start of the first line
  const openQuote = '"'
  const openQuoteW = ctx.measureText(openQuote).width
  ctx.fillText(openQuote, textX, qy)
  
  // Now draw the quote text itself
  quoteLines.forEach((l, i) => { 
    ctx.fillText(l, textX, qy + i * qLineH)
  })

  // Closing quote at the end of the last line
  if (quoteLines.length > 0) {
    const lastLine = quoteLines[lastLineIdx]
    const lastLineW = ctx.measureText(lastLine).width
    const closeQuoteX = textX + lastLineW + Math.round(W * 0.01)
    ctx.fillText('"', closeQuoteX, qy + lastLineIdx * qLineH)
  }
  
  qy += quoteFS * 1.4 * quoteLines.length

  // ─── 5. Diagonal Watermark ─────────────────────────────────────────────
  // Abছা "সেগুন বাংলা" in background, rotate -30deg
  if (data.showWatermark !== false) {
    ctx.save()
    ctx.translate(W * 0.35, H * 0.48)
    ctx.rotate(-0.5) // ~-30 degrees
    ctx.fillStyle = C.watermarkColor
    ctx.globalAlpha = C.watermarkOpacity  // ~0.05
    ctx.font = `bold ${Math.round(W * 0.1)}px ${FONT}`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('সেগুন বাংলা', 0, 0)
    ctx.restore()
    ctx.globalAlpha = 1
  }

  // ─── 6. Divider Line (Halfway Down) ────────────────────────────────────
  // Extends ~35-40% of card width, starts from left edge
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.5
  const divLen = Math.round(W * 0.35)
  ctx.beginPath()
  ctx.moveTo(textX, dividerY)
  ctx.lineTo(textX + divLen, dividerY)
  ctx.stroke()

  // ─── 7. Metadata Stack (Below Divider) ─────────────────────────────────
  // Order: Name → Designation → Constituency + Party
  const metaY = dividerY + Math.round(H * 0.025)
  let metaRowY = metaY

  // 7a. Person Name (bold, large) — top
  ctx.fillStyle = '#000000'
  ctx.font = `bold ${nameFS}px ${FONT}`
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  const nameLines = wrapText(ctx, data.personName, leftW - padX * 2)
  nameLines.forEach(l => { ctx.fillText(l, textX, metaRowY); metaRowY += nameFS * 1.3 })

  // 7b. Designation (smaller, regular weight) — middle
  if (data.designation) {
    ctx.fillStyle = '#333333'
    ctx.font = `normal ${desFS}px ${FONT}`
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    const desLines = wrapText(ctx, data.designation, leftW - padX * 2)
    desLines.forEach(l => { ctx.fillText(l, textX, metaRowY); metaRowY += desFS * 1.35 })
  }

  // 7c. Constituency + Party — bottom
  if (data.constituency || data.party) {
    ctx.fillStyle = '#555555'
    ctx.font = `normal ${conFS}px ${FONT}`
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    const conPartyParts: string[] = []
    if (data.constituency) conPartyParts.push(data.constituency)
    if (data.party) conPartyParts.push(`【${data.party}】`)
    ctx.fillText(conPartyParts.join(' • '), textX, metaRowY)
    metaRowY += conFS * 1.4
  }

  // ─── 8. Subject Image (Background-Removed Cutout) ─────────────────────
  // Automatically removes white/near-white background from the portrait image
  // so it blends seamlessly into the gray canvas — like a magnetic lasso cutout.
  // The bottom-right corner is anchored flush to the footer and right edge.
  if (data.portraitUrl) {
    let img: HTMLImageElement | null = null
    try { img = await loadImage(data.portraitUrl) } catch {}
    if (img) {
      // Step 1: Process image on a temp canvas to remove white background
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')!
      tempCanvas.width = img.naturalWidth
      tempCanvas.height = img.naturalHeight
      tempCtx.drawImage(img, 0, 0)

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const data = imageData.data
      
      // Threshold: any pixel with R>245, G>245, B>245 becomes transparent
      const threshold = 245
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // If pixel is near-white, make it fully transparent
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0 // alpha = 0 (transparent)
        }
      }
      tempCtx.putImageData(imageData, 0, 0)

      // Step 2: Calculate draw dimensions preserving natural aspect ratio
      const maxH = H - footerTotalH
      const maxW = W - leftW
      const aspect = img.naturalWidth / img.naturalHeight
      let drawW: number, drawH: number
      
      if (aspect > maxW / maxH) {
        drawW = maxW
        drawH = drawW / aspect
      } else {
        drawH = maxH
        drawW = drawH * aspect
      }
      
      // Position: bottom-right corner anchored flush to footer + right edge
      const drawX = W - drawW
      const drawY = (H - footerTotalH) - drawH

      // Step 3: Draw the processed cutout — no box, no clip, no border
      // White background is now transparent; gray canvas shows through
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, drawX, drawY, drawW, drawH)
    }
  }

  // ─── 9. Footer Architecture ────────────────────────────────────────────
  // Tier 1: Brand Bar — "Segun Bangla" + "NEWS" block
  const ftTopY = H - footerTotalH
  const ftBotY = ftTopY + footerTopBarH

  // Brand top bar (using configurable colors like Template 1)
  const bg = ctx.createLinearGradient(0, ftTopY, 0, ftTopY + footerTopBarH)
  bg.addColorStop(0, C.brandBarTop)
  bg.addColorStop(1, C.brandBarBottom)
  ctx.fillStyle = bg
  ctx.fillRect(0, ftTopY, W, footerTopBarH)

  // "Segun Bangla" white text (left side)
  ctx.fillStyle = C.brandTextColor
  ctx.font = `bold ${brandFS}px ${FONT}`
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText('Segun Bangla', padX, ftTopY + footerTopBarH / 2)

  // Red "NEWS" block (after Segun Bangla text)
  const segunW = ctx.measureText('Segun Bangla ').width
  const newsFS = Math.round(brandFS * 0.7)
  ctx.font = `bold ${newsFS}px Arial, sans-serif`
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  const newsStr = 'N  E  W  S'  // letter-spaced
  const nw = ctx.measureText(newsStr).width
  const npad = Math.round(newsFS * 0.35)
  const ny = ftTopY + Math.round((footerTopBarH - newsFS * 1.3) / 2)
  const nx = padX + segunW - npad

  ctx.fillStyle = C.newsBadgeBg
  ctx.fillRect(nx, ny, nw + npad * 2, Math.round(newsFS * 1.2))
  ctx.fillStyle = C.newsBadgeText
  ctx.fillText(newsStr, nx + npad, ny + Math.round(newsFS * 0.15))

  // Tier 2: Tagline Bar — centered tagline
  ctx.fillStyle = C.taglineBarBg
  ctx.fillRect(0, ftBotY, W, footerBotBarH)

  ctx.fillStyle = C.taglineTextColor
  ctx.font = `normal ${tagFS}px ${FONT}`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('সেগুন বাংলা • সত্যের সন্ধানে', W / 2, ftBotY + footerBotBarH / 2)

  await openDownload(canvas, data.personName, filename, onProgress)
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════════════════════════════════════════
async function openDownload(canvas: HTMLCanvasElement, personName: string, filename: string, onProgress?: (msg: string) => void) {
  onProgress?.('ছবি তৈরি হচ্ছে...')
  const dataUrl = canvas.toDataURL('image/png')
  const newWindow = window.open('', '_blank')
  if (!newWindow) {
    const link = document.createElement('a')
    link.download = filename.replace('.png','')+'.png'; link.href = dataUrl
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
    onProgress?.(''); return
  }
  newWindow.document.write(`<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Profile Card - segunbangla.com</title><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{display:flex;flex-direction:column;align-items:center;min-height:100vh;background:#222;font-family:'Hind Siliguri','Noto Sans Bengali',Arial,sans-serif;padding:20px}
  .card-image{max-width:100%;height:auto;box-shadow:0 4px 30px rgba(0,0,0,0.5);border-radius:4px;max-height:90vh;width:auto}
  .actions{margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
  .btn{padding:14px 40px;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer;transition:background .2s;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
  .btn-primary{background:#006747;color:#fff}.btn-primary:hover{background:#008B5E}
  .btn-secondary{background:#444;color:#fff}.btn-secondary:hover{background:#555}
  .instructions{margin-top:16px;color:#999;font-size:14px;text-align:center;max-width:500px;line-height:1.6}
</style></head><body>
  <img class="card-image" src="${dataUrl}" alt="Profile Card" />
  <div class="actions">
    <a class="btn btn-primary" href="${dataUrl}" download="${filename.replace('.png','')}.png">⬇️ ছবি ডাউনলোড করুন</a>
    <button class="btn btn-secondary" onclick="window.print()">🖨️ প্রিন্ট / PDF</button>
  </div>
  <div class="instructions">অথবা ছবিতে <strong>ডান-ক্লিক করে Save Image As...</strong> নির্বাচন করুন</div>
</body></html>`)
  newWindow.document.title = `Profile Card - ${personName}`
  newWindow.document.close()
  onProgress?.('')
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' '); const lines: string[] = []; let cur = ''
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w
    if (ctx.measureText(t).width > maxWidth && cur) { lines.push(cur); cur = w } else { cur = t }
  }
  if (cur) lines.push(cur)
  return lines.length > 0 ? lines : [text]
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`
  return new Promise((resolve, reject) => {
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Failed: ${url}`))
    img.src = proxyUrl
  })
}