'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2, ImagePlus, Facebook, Instagram, Video, Search, ExternalLink, ChevronDown, Palette } from 'lucide-react'
import Link from 'next/link'
import { generateAndDownloadSocialCard, type SocialCardFormat, type SocialCardColors } from '@/lib/social-card-generator'
import { generateSocialCardGif, type GifConfig } from '@/lib/social-card-gif'
import { collection, query, orderBy, limit, startAfter, getDocs, type DocumentSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ArticleSummary {
  id: string
  title: string
  slug: string
  imageUrl: string
  publishedAt: number
  excerpt: string
}

const PAGE_SIZE = 15

const DEFAULT_COLORS: SocialCardColors = {
  headerBg: '#8B5E3C',
  headerText: '#FFFFFF',
  brandingStripBg: '#5C3317',
  footerBg: '#5C3317',
  footerText: '#FFFFFF',
}

function SocialCardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const now = new Date()
  const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
  const defaultDate = `${now.getDate()} ${bnMonths[now.getMonth()]}, ${now.getFullYear()}`
  const [date, setDate] = useState(defaultDate)
  const [imageUrl, setImageUrl] = useState('')
  const [format, setFormat] = useState<SocialCardFormat>('facebook')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showColors, setShowColors] = useState(true)
  const [colors, setColors] = useState<SocialCardColors>({ ...DEFAULT_COLORS })
  const [gifMode, setGifMode] = useState(false)
  const articleId = searchParams.get('article')

  const fetchArticles = useCallback(async (loadMore = false) => {
    if (!loadMore) { setLoading(true) } else { setLoadingMore(true) }
    try {
      let q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(PAGE_SIZE))
      if (loadMore && lastDoc) { q = query(q, startAfter(lastDoc)) }
      const snapshot = await getDocs(q)
      const list: ArticleSummary[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return { id: doc.id, title: data.title || '', slug: data.slug || '', imageUrl: data.imageUrl || '', publishedAt: data.publishedAt || 0, excerpt: data.excerpt || '' }
      })
      setArticles(prev => loadMore ? [...prev, ...list] : list)
      setLastDoc(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null)
      setHasMore(snapshot.docs.length === PAGE_SIZE)
    } catch (err) {
      console.error('Error loading articles:', err)
      setError('Failed to load articles')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [lastDoc])

  useEffect(() => {
    if (articleId) {
      setLoading(true)
      const fetchArticle = async () => {
        try {
          const response = await fetch(`/api/article/fetch?id=${articleId}`)
          if (!response.ok) throw new Error('Failed to fetch article')
          const data = await response.json()
          if (!data.success) throw new Error(data.error || 'Failed to fetch')
          const article = data.data
          setTitle(article.title || '')
          if (article.imageUrl) setImageUrl(article.imageUrl)
          if (article.publishedAt) {
            const d = new Date(article.publishedAt)
            setDate(`${d.getDate()} ${bnMonths[d.getMonth()]}, ${d.getFullYear()}`)
          }
        } catch (err) {
          console.error('Error loading article:', err)
          setError(err instanceof Error ? err.message : 'Failed to load article')
        } finally { setLoading(false) }
      }
      fetchArticle()
    } else {
      fetchArticles(false)
    }
  }, [articleId])

  const colorFields: { key: keyof SocialCardColors; label: string; desc: string }[] = [
    { key: 'headerBg', label: 'হেডার ব্যাকগ্রাউন্ড', desc: 'উপরের বার' },
    { key: 'headerText', label: 'হেডার টেক্সট', desc: 'Segun Bangla ও তারিখ' },
    { key: 'brandingStripBg', label: 'মিড স্ট্রিপ', desc: 'লোগোর পটভূমি' },
    { key: 'footerBg', label: 'ফুটার ব্যাকগ্রাউন্ড', desc: 'নিচের বড় অংশ' },
    { key: 'footerText', label: 'ফুটার টেক্সট', desc: 'শিরোনাম ও CTA রঙ' },
  ]

  const handleGenerate = useCallback(async (asGif = false) => {
    if (!title.trim()) { alert('দয়া করে শিরোনাম লিখুন'); return }
    if (!date.trim()) { alert('দয়া করে তারিখ লিখুন'); return }
    setGenerating(true)
    const filename = `social-${title.trim().replace(/\s+/g, '-').substring(0, 40)}`
    try {
      if (asGif) {
        setProgress('GIF তৈরি হচ্ছে...')
        const dims = { facebook: { w: 1080, h: 1350 }, square: { w: 1080, h: 1080 }, story: { w: 1080, h: 1920 }, passport: { w: 1080, h: 1350 } }
        const d = dims[format]
        const canvas = document.createElement('canvas')
        canvas.width = d.w
        canvas.height = d.h
        const blob = await generateSocialCardGif(canvas, title.trim(), imageUrl.trim() || undefined, date.trim(), {
          headerBg: colors.headerBg || '#8B5E3C',
          headerText: colors.headerText || '#FFFFFF',
          brandingStripBg: colors.brandingStripBg || '#5C3317',
          footerBg: colors.footerBg || '#5C3317',
          footerText: colors.footerText || '#FFFFFF',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.gif`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      } else {
        await generateAndDownloadSocialCard(
          { title: title.trim(), date: date.trim(), imageUrl: imageUrl.trim() || undefined, colors },
          filename,
          format,
          (msg) => setProgress(msg)
        )
      }
    } catch (error) {
      console.error('Error:', error)
      alert('কার্ড তৈরি করতে ত্রুটি হয়েছে')
    } finally { setGenerating(false); setProgress('') }
  }, [title, date, imageUrl, format, colors])

  const selectArticle = (article: ArticleSummary) => { router.push(`/social-card?article=${article.id}`) }

  const loadTestData = () => {
    setTitle('ভারতের ছাগল কাপ ফুটবল নিয়ে বিশ্বজুড়ে আলোড়ন')
    setImageUrl('https://www.aljazeera.com/wp-content/uploads/2026/07/Winning-team-with-Khasi-1784613553.jpg?resize=770%2C513&quality=80')
    const d = new Date()
    setDate(`${d.getDate()} ${bnMonths[d.getMonth()]}, ${d.getFullYear()}`)
  }

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" /><p className="text-foreground text-lg">লোড হচ্ছে...</p></div>
      </div>
    )
  }

  if (error && !articleId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4"><Link href="/" className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></Link><div><h1 className="text-lg font-bold text-foreground">Social Card Generator</h1></div></div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center"><p className="text-destructive text-lg mb-2">{error}</p><Link href="/" className="text-primary hover:underline">Back to Home</Link></div>
        </div>
      </div>
    )
  }

  if (!articleId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4"><Link href="/" className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></Link><div><h1 className="text-lg font-bold text-foreground">Social Card Generator</h1><p className="text-xs text-muted-foreground">সর্বশেষ প্রকাশিত আর্টিকেল — একটি নির্বাচন করুন</p></div></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="আর্টিকেল খুঁজুন..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <button onClick={loadTestData} className="w-full mb-4 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center justify-center gap-2"><ImagePlus className="w-4 h-4" /> অথবা ম্যানুয়ালি তথ্য দিন</button>
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><p className="text-lg mb-2">কোনো আর্টিকেল পাওয়া যায়নি</p><button onClick={loadTestData} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">ম্যানুয়ালি দিন</button></div>
            ) : (
              <>
                {filteredArticles.map(article => (
                  <button key={article.id} onClick={() => selectArticle(article)} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all text-left w-full">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">{article.imageUrl ? <img src={article.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="w-full h-full flex items-center justify-center"><ImagePlus className="w-6 h-6 text-muted-foreground" /></div>}</div>
                    <div className="flex-1 min-w-0 text-left"><h3 className="text-sm font-semibold text-foreground line-clamp-2">{article.title}</h3>{article.excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{article.excerpt}</p>}<div className="flex items-center gap-2 mt-2"><span className="text-[10px] text-muted-foreground">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('bn-BD') : ''}</span><ExternalLink className="w-3 h-3 text-primary/60" /></div></div>
                  </button>
                ))}
                {hasMore && (<button onClick={() => fetchArticles(true)} disabled={loadingMore} className="w-full py-3 rounded-lg border border-border bg-card hover:bg-muted text-sm text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50">{loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...</> : <><ChevronDown className="w-4 h-4" /> আরও লোড করুন ({articles.length}+)</>}</button>)}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card"><div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4"><Link href="/social-card" className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></Link><div><h1 className="text-lg font-bold text-foreground">Social Card Generator</h1></div></div></div>
        <div className="flex items-center justify-center h-64"><div className="text-center"><p className="text-destructive text-lg mb-2">{error}</p><Link href="/social-card" className="text-primary hover:underline">Back to article list</Link></div></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-lg font-bold text-foreground">Social Card Generator</h1><p className="text-xs text-muted-foreground">আর্টিকেল লোড হয়েছে — রং কাস্টমাইজ করে ডাউনলোড করুন</p></div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2"><h2 className="text-base font-semibold text-foreground">কার্ডের তথ্য</h2></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">শিরোনাম *</label><textarea value={title} onChange={e => setTitle(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">তারিখ *</label><input value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">ছবির URL</label><div className="flex gap-2"><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />{imageUrl && <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0"><img src={imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>}</div></div>
            </div>

            {/* Color Customization */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <button onClick={() => setShowColors(!showColors)} className="w-full flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><Palette className="w-4 h-4" /> রঙ কাস্টমাইজ করুন</h2>
                <span className="text-sm text-muted-foreground">{showColors ? '▲' : '▼'}</span>
              </button>
              {showColors && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {colorFields.map(field => {
                    const colorKey = field.key as keyof typeof colors
                    return (
                      <div key={field.key} className="flex items-center gap-2">
                        <input type="color" value={(colors[colorKey] as string) || (DEFAULT_COLORS[colorKey] as string) || '#000000'} onChange={e => setColors(prev => ({ ...prev, [colorKey]: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-border" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-[10px] text-muted-foreground truncate">{field.label}</label>
                          <span className="block text-[9px] text-muted-foreground truncate font-mono">{(colors[colorKey] as string) || (DEFAULT_COLORS[colorKey] as string)}</span>
                        </div>
                      </div>
                    )
                  })}
                  <button onClick={() => setColors({ ...DEFAULT_COLORS })} className="col-span-full text-xs text-primary hover:text-primary/80 text-center py-2 border border-dashed border-border rounded-lg">
                    ডিফল্ট রঙে রিসেট করুন
                  </button>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">ফরম্যাট</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{formatOptions.map(opt => { const Icon = opt.icon; return (<button key={opt.key} type="button" onClick={() => setFormat(opt.key)} className={`p-3 rounded-lg border text-left transition-colors ${format === opt.key ? 'bg-primary/20 border-primary text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}><Icon className="w-5 h-5 mb-1" /><div className="font-semibold text-sm">{opt.label}</div><div className="text-[10px] opacity-70">{opt.desc}</div></button>) })}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleGenerate(false)} disabled={generating || !title.trim() || !date.trim()} className="h-12 text-base font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress || 'তৈরি হচ্ছে...'}</> : <><Download className="w-5 h-5" /> PNG ডাউনলোড</>}
              </button>
              <button onClick={() => handleGenerate(true)} disabled={generating || !title.trim() || !date.trim()} className="h-12 text-base font-bold rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress || 'তৈরি হচ্ছে...'}</> : <><ImagePlus className="w-5 h-5" /> GIF ডাউনলোড</>}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">প্রিভিউ</h2>
              <div className="rounded-lg overflow-hidden border mx-auto relative" style={{ aspectRatio: format === 'facebook' ? '4/5' : format === 'story' ? '9/16' : '1/1', maxWidth: '260px' }}>
                <div className="h-[4%] flex items-center px-2" style={{ backgroundColor: colors.headerBg || '#8B5E3C' }}>
                  <span className="text-[6px] font-bold" style={{ color: colors.headerText || '#FFFFFF' }}>Segun Bangla</span>
                  <span className="text-[5px] ml-auto" style={{ color: colors.headerText || '#FFFFFF' }}>{date || 'তারিখ'}</span>
                </div>
                <div className="h-[55%] bg-gray-200 flex items-center justify-center overflow-hidden">{imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = '' }} /> : <ImagePlus className="w-8 h-8 text-gray-400" />}</div>
                <div className="h-[5%] flex items-center justify-center" style={{ backgroundColor: colors.brandingStripBg || '#5C3317' }}>
                  <span className="text-white text-[5px] font-bold">লোগো</span>
                </div>
                <div className="h-[36%] flex flex-col items-center justify-center p-2 text-center" style={{ backgroundColor: colors.footerBg || '#5C3317' }}>
                  <p className="text-[7px] font-bold leading-tight" style={{ color: colors.footerText || '#FFFFFF' }}>{title || 'শিরোনাম'}</p>
                  <div className="mt-auto"><span className="text-[5px]" style={{ color: colors.footerText ? colors.footerText + 'CC' : 'rgba(255,255,255,0.8)' }}>« বিস্তারিত কমেন্টে »</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatOptions: { key: SocialCardFormat; label: string; desc: string; icon: typeof Facebook }[] = [
  { key: 'facebook', label: 'ফেসবুক', desc: '৪:৫ (১০৮০×১৩৫০)', icon: Facebook },
  { key: 'square', label: 'স্কয়ার', desc: '১:১ (১০৮০×১০৮০)', icon: Instagram },
  { key: 'story', label: 'স্টোরি', desc: '৯:১৬ (১০৮০×১৯২০)', icon: Video },
  { key: 'passport', label: 'পাসপোর্ট', desc: 'প্রোফাইল ছবি', icon: ImagePlus },
]

export default function SocialCardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background"><div className="text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" /><p className="text-foreground text-lg">লোড হচ্ছে...</p></div></div>}>
      <SocialCardContent />
    </Suspense>
  )
}