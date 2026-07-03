'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Download, Loader2, ImagePlus, Beaker, Save, Trash2, Palette } from 'lucide-react'
import Link from 'next/link'
import { generateAndDownloadProfileCard, type ProfileCardFormat, type ProfileCardColors, type CardTemplateType, getDefaultColors, COLOR_PRESETS_T1, COLOR_PRESETS_T2 } from '@/lib/profile-card-generator'

type ColorScheme = { name: string; colors: ProfileCardColors }
const STORAGE_KEY = 'segun-photocard-schemes'

function loadSavedSchemes(): ColorScheme[] {
  if (typeof window === 'undefined') return []
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveSchemes(schemes: ColorScheme[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes)) }

export default function PhotocardPage() {
  const [personName, setPersonName] = useState('')
  const [designation, setDesignation] = useState('')
  const [constituency, setConstituency] = useState('')
  const [party, setParty] = useState('')
  const [portraitUrl, setPortraitUrl] = useState('')
  const [quote, setQuote] = useState('')
  const [quoteSource, setQuoteSource] = useState('')
  const [format, setFormat] = useState<ProfileCardFormat>('portrait')
  const [showDate, setShowDate] = useState(true)
  const [dateText, setDateText] = useState('')
  useEffect(() => {
    if (!dateText) {
      const now = new Date()
      const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
      setDateText(`${now.getDate()} ${bnMonths[now.getMonth()]}, ${now.getFullYear()}`)
    }
  }, [dateText])
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')

  const [template, setTemplate] = useState<CardTemplateType>('segun-profile')
  const [colors, setColors] = useState<ProfileCardColors>(getDefaultColors('segun-profile'))
  const [savedSchemes, setSavedSchemes] = useState<ColorScheme[]>([])
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [schemeNameInput, setSchemeNameInput] = useState('')

  useEffect(() => { setSavedSchemes(loadSavedSchemes()) }, [])

  const updateColor = useCallback((key: keyof ProfileCardColors, value: string | number) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }, [])

  const applyPreset = useCallback((presetColors: ProfileCardColors) => {
    setColors({ ...presetColors })
  }, [])

  const saveCurrentScheme = useCallback(() => {
    const name = schemeNameInput.trim() || `স্কিম ${savedSchemes.length + 1}`
    const updated = [...savedSchemes, { name, colors: { ...colors } }]
    setSavedSchemes(updated); saveSchemes(updated); setSchemeNameInput('')
  }, [colors, savedSchemes, schemeNameInput])

  const deleteScheme = useCallback((index: number) => {
    const updated = savedSchemes.filter((_, i) => i !== index)
    setSavedSchemes(updated); saveSchemes(updated)
  }, [savedSchemes])

  const handleGenerate = useCallback(async () => {
    if (!personName.trim()) { alert('দয়া করে নাম লিখুন'); return }
    if (!designation.trim()) { alert('দয়া করে পদবী লিখুন'); return }
    setGenerating(true); setProgress('')
    try {
      await generateAndDownloadProfileCard(
        { personName: personName.trim(), designation: designation.trim(), constituency: constituency.trim() || undefined, party: party.trim() || undefined, portraitUrl: portraitUrl.trim() || undefined, quote: quote.trim() || undefined, quoteSource: quoteSource.trim() || undefined, showDate, date: showDate ? dateText : undefined, sponsorName: sponsorName.trim() || undefined, sponsorLogoUrl: sponsorLogoUrl.trim() || undefined, template, colors },
        `profile-${personName.trim().replace(/\s+/g, '-')}`, format, (msg) => setProgress(msg)
      )
    } catch (error) { console.error('Error:', error); alert('কার্ড তৈরি করতে ত্রুটি হয়েছে') }
    finally { setGenerating(false); setProgress('') }
  }, [personName, designation, constituency, party, portraitUrl, quote, quoteSource, showDate, dateText, sponsorName, sponsorLogoUrl, format, template, colors])

  const formatLabels: Record<ProfileCardFormat, { label: string; desc: string }> = {
    portrait: { label: 'পোর্ট্রেট', desc: '৪:৫ - ফেসবুক/ইনস্টাগ্রাম' },
    story: { label: 'স্টোরি', desc: '৯:১৬ - স্টোরি/রিলস' },
    square: { label: 'স্কয়ার', desc: '১:১ - প্রোফাইল ছবি' },
  }

  const testData = () => {
    setPersonName('মোহাম্মদ আরাফাত হোসেন'); setDesignation('সংসদ সদস্য')
    setConstituency('মুন্সীগঞ্জ-৩ (সদর ও গজারিয়া)'); setParty('বাংলাদেশ আওয়ামী লীগ')
    setPortraitUrl(''); setQuote('আমি আমার দেশকে সব সম্ভাব্য উপায়ে সাহায্য করব')
    setQuoteSource('নির্বাচনী জনসভা, ২০২৪'); setSponsorName(''); setSponsorLogoUrl('')
    setShowDate(true)
    const now = new Date()
    const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
    setDateText(`${now.getDate()} ${bnMonths[now.getMonth()]}, ${now.getFullYear()}`)
  }

  const colorFields: { key: keyof ProfileCardColors; label: string }[] = [
    { key: 'backgroundColor', label: 'পটভূমি' }, { key: 'patternColor', label: 'প্যাটার্ন রঙ' },
    { key: 'dateBadgeBg', label: 'তারিখ ব্যাজ পট' }, { key: 'dateBadgeText', label: 'তারিখ টেক্সট' },
    { key: 'portraitBorder', label: 'ছবির বর্ডার' }, { key: 'nameColor', label: 'নামের রঙ' },
    { key: 'designationColor', label: 'পদবীর রঙ' }, { key: 'constituencyColor', label: 'আসনের রঙ' },
    { key: 'partyColor', label: 'দলের রঙ' }, { key: 'accentLineColor', label: 'আন্ডারলাইন রঙ' },
    { key: 'quoteColor', label: 'উক্তির রঙ' }, { key: 'quoteSourceColor', label: 'উৎসের রঙ' },
    { key: 'brandBarTop', label: 'ব্র্যান্ড বার (উপরে)' }, { key: 'brandBarBottom', label: 'ব্র্যান্ড বার (নিচে)' },
    { key: 'brandTextColor', label: 'ব্র্যান্ড টেক্সট' }, { key: 'newsBadgeBg', label: 'NEWS ব্যাজ পট' },
    { key: 'newsBadgeText', label: 'NEWS টেক্সট' }, { key: 'taglineBarBg', label: 'ট্যাগলাইন বার' },
    { key: 'taglineTextColor', label: 'ট্যাগলাইন টেক্সট' }, { key: 'watermarkColor', label: 'ওয়াটারমার্ক রঙ' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-lg font-bold text-foreground">Profile Card Generator</h1><p className="text-xs text-muted-foreground">Segun Bangla Studio — 2 Templates</p></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Template Selector */}
        <div className="bg-card border border-border rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-foreground">টেমপ্লেট:</span>
            {(['segun-profile', 'mirror-quote'] as CardTemplateType[]).map(t => (
              <button key={t} type="button" onClick={() => { setTemplate(t); setColors(getDefaultColors(t)) }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${template === t ? 'bg-primary/20 border-primary text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}>
                {t === 'segun-profile' ? '🎯 প্রোফাইল কার্ড' : '📰 মিরর কোট'}
              </button>
            ))}
          </div>
        </div>

        {/* Color Presets */}
        <div className="bg-card border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">কালার স্কিম:</span>
              {(template === 'segun-profile' ? COLOR_PRESETS_T1 : COLOR_PRESETS_T2).map((preset, i) => (
                <button key={i} type="button" onClick={() => applyPreset(preset.colors)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-border hover:border-primary transition-colors">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: preset.colors.backgroundColor }} />{preset.name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowColorPanel(!showColorPanel)}
              className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors">
              {showColorPanel ? 'বন্ধ করুন' : 'কাস্টমাইজ করুন'}
            </button>
          </div>
          {savedSchemes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground">সংরক্ষিত:</span>
              {savedSchemes.map((scheme, i) => (
                <span key={i} onClick={() => applyPreset(scheme.colors)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-border hover:border-primary transition-colors cursor-pointer">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: scheme.colors.backgroundColor }} />{scheme.name}
                  <span onClick={(e) => { e.stopPropagation(); deleteScheme(i) }} className="text-red-500 hover:text-red-400 ml-0.5 cursor-pointer"><Trash2 className="w-2.5 h-2.5" /></span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Color Panel */}
        {showColorPanel && (
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">রঙ কাস্টমাইজেশন</h3>
              <div className="flex items-center gap-2">
                <input value={schemeNameInput} onChange={e => setSchemeNameInput(e.target.value)} placeholder="স্কিমের নাম" className="px-2 py-1 rounded text-xs border border-border bg-background text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="button" onClick={saveCurrentScheme} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"><Save className="w-3 h-3" /> সংরক্ষণ</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {colorFields.map(field => (
                <div key={field.key} className="flex items-center gap-2">
                  <input type="color" value={typeof colors[field.key] === 'string' ? colors[field.key] as string : '#000000'} onChange={e => updateColor(field.key, e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] text-muted-foreground truncate">{field.label}</label>
                    <span className="block text-[9px] text-muted-foreground truncate font-mono">{colors[field.key]}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-[9px] text-muted-foreground bg-background">%</div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] text-muted-foreground">প্যাটার্ন অস্বচ্ছতা</label>
                  <input type="range" min={0} max={10} value={Math.round(colors.patternOpacity * 100)} onChange={e => updateColor('patternOpacity', parseInt(e.target.value) / 100)} className="w-full h-1 accent-primary cursor-pointer" />
                  <span className="text-[9px] text-muted-foreground">{Math.round(colors.patternOpacity * 100)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-[9px] text-muted-foreground bg-background">W</div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] text-muted-foreground">ওয়াটারমার্ক অস্বচ্ছতা</label>
                  <input type="range" min={0} max={20} value={Math.round(colors.watermarkOpacity * 100)} onChange={e => updateColor('watermarkOpacity', parseInt(e.target.value) / 100)} className="w-full h-1 accent-primary cursor-pointer" />
                  <span className="text-[9px] text-muted-foreground">{Math.round(colors.watermarkOpacity * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-base font-semibold text-foreground">ব্যক্তির তথ্য</h2>
                <button type="button" onClick={testData} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"><Beaker className="w-3 h-3" /> টেস্ট ডেটা</button>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1">নাম *</label><input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="যেমন: মোহাম্মদ আরাফাত হোসেন" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">পদবী *</label><input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="যেমন: সংসদ সদস্য" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">আসন/এলাকা</label><input value={constituency} onChange={e => setConstituency(e.target.value)} placeholder="যেমন: মুন্সীগঞ্জ-৩ (সদর ও গজারিয়া)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">দল/পার্টি</label><input value={party} onChange={e => setParty(e.target.value)} placeholder="যেমন: বাংলাদেশ আওয়ামী লীগ" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">ছবির URL</label><div className="flex gap-2"><input value={portraitUrl} onChange={e => setPortraitUrl(e.target.value)} placeholder="https://example.com/portrait.jpg" className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />{portraitUrl && <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0"><img src={portraitUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>}</div></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">উক্তি/বক্তব্য</label><textarea value={quote} onChange={e => setQuote(e.target.value)} rows={2} placeholder="যেমন: আমি মুন্সীগঞ্জ-৩ আসনের জনগণের সেবায় নিবেদিত..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">উক্তির উৎস</label><input value={quoteSource} onChange={e => setQuoteSource(e.target.value)} placeholder="যেমন: নির্বাচনী জনসভা, ২০২৪" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">ফরম্যাট ও তারিখ</h2>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="showDate" checked={showDate} onChange={e => setShowDate(e.target.checked)} className="w-4 h-4 accent-primary" />
                <label htmlFor="showDate" className="text-sm text-foreground cursor-pointer">তারিখ দেখান</label>
              </div>
              {showDate && <input value={dateText} onChange={e => setDateText(e.target.value)} placeholder="যেমন: ২৪ জুন, ২০২৬" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />}
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(formatLabels) as [ProfileCardFormat, typeof formatLabels['portrait']][]).map(([key, val]) => (
                  <button key={key} type="button" onClick={() => setFormat(key)} className={`p-2.5 rounded-lg border text-left transition-colors text-sm ${format === key ? 'bg-primary/20 border-primary text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}>
                    <div className="font-semibold">{val.label}</div>
                    <div className="text-[10px] opacity-70">{val.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">স্পনসর (ঐচ্ছিক)</h2>
              <input value={sponsorName} onChange={e => setSponsorName(e.target.value)} placeholder="যেমন: ইসলামী ব্যাংক বাংলাদেশ পিএলসি" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input value={sponsorLogoUrl} onChange={e => setSponsorLogoUrl(e.target.value)} placeholder="স্পনসরের লোগো URL" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <button onClick={handleGenerate} disabled={generating || !personName.trim() || !designation.trim()} className="w-full h-12 text-base font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress || 'তৈরি হচ্ছে...'}</> : <><Download className="w-5 h-5" /> প্রোফাইল কার্ড তৈরি ও ডাউনলোড</>}
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">প্রিভিউ</h2>
              <div className="rounded-lg overflow-hidden border mx-auto relative" style={{ aspectRatio: format === 'portrait' ? '4/5' : format === 'story' ? '9/16' : '1/1', maxWidth: '260px', backgroundColor: template === 'segun-profile' ? colors.backgroundColor : '#F2F2F2' }}>
                
                {template === 'segun-profile' ? (
                  /* Template 1: Centered avatar preview */
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center" style={{ color: colors.nameColor }}>
                    {portraitUrl ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg mb-3" style={{ borderColor: colors.portraitBorder }}><img src={portraitUrl} alt="" className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-3" style={{ borderColor: colors.portraitBorder, backgroundColor: 'rgba(255,255,255,0.1)' }}><ImagePlus className="w-7 h-7" style={{ color: colors.nameColor }} /></div>
                    )}
                    <p className="font-bold text-sm leading-tight">{personName || 'নাম'}</p>
                    {designation && <><div className="w-8 h-0.5 my-1" style={{ backgroundColor: colors.accentLineColor }} /><p className="text-xs" style={{ color: colors.designationColor }}>{designation}</p></>}
                    {constituency && <p className="text-[10px] mt-1" style={{ color: colors.constituencyColor }}>{constituency}</p>}
                  </div>
                ) : (
                  /* Template 2: Asymmetric quote card preview */
                  <div className="w-full h-full flex flex-col p-2 text-left" style={{ fontSize: '7px' }}>
                    {/* Date badge */}
                    <div className="inline-block bg-black text-white rounded-full px-1.5 py-0.5 text-[6px] font-bold self-start mb-1">{dateText || 'তারিখ'}</div>
                    {/* Red icon rectangles */}
                    <div className="flex gap-0.5 mb-1">
                      <div className="w-1.5 h-3 bg-red-600"></div>
                      <div className="w-1.5 h-3 bg-red-600"></div>
                    </div>
                    {/* Quote text */}
                    <p className="font-bold leading-tight text-[7px]" style={{ color: '#000' }}>{quote || 'বক্তব্য'}</p>
                    {/* Divider */}
                    <div className="border-t border-black my-1 w-[35%]"></div>
                    {/* Metadata */}
                    <div className="mt-auto">
                      <p className="text-[6px]" style={{ color: '#555' }}>{constituency || ''}{party ? ` • 【${party}】` : ''}</p>
                      <p className="font-bold text-[8px]" style={{ color: '#000' }}>{personName || 'নাম'}</p>
                      <p className="text-[6px]" style={{ color: '#333' }}>{designation || ''}</p>
                    </div>
                    {/* Footer preview */}
                    <div className="mt-auto">
                      <div className="bg-black text-white text-[5px] px-1 py-0.5 flex items-center gap-0.5">
                        <span className="font-bold">Segun Bangla</span>
                        <span className="bg-red-600 text-white px-0.5 text-[4px]">N E W S</span>
                      </div>
                      <div className="bg-green-800 text-white text-[4px] text-center py-0.5">সেগুন বাংলা • সত্যের সন্ধানে</div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">{template === 'segun-profile' ? 'প্রোফাইল কার্ড' : 'কোট কার্ড'} প্রিভিউ</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">নির্দেশনা</h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>নাম ও পদবী আবশ্যক</li>
                <li>২টি টেমপ্লেট: প্রোফাইল কার্ড ও মিরর কোট</li>
                <li>প্রিসেট স্কিম থেকে রঙ নির্বাচন করুন</li>
                <li>কাস্টমাইজ বাটন থেকে সব রঙ পরিবর্তন করুন</li>
                <li>স্কিম সংরক্ষণ করে পরে ব্যবহার করুন</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}