'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search, ExternalLink, ImagePlus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import EditorLayout from '@/components/editor/EditorLayout';
import { Article, ReelConfig } from '@/lib/types';
import { ReelEditorProvider, useReelEditor } from '@/lib/reelContext';
import { v4 as uuidv4 } from 'uuid';
import { collection, query, orderBy, limit, startAfter, getDocs, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  publishedAt: number;
  excerpt: string;
}

const PAGE_SIZE = 15;

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { dispatch } = useReelEditor();

  const articleId = searchParams.get('article');

  const fetchArticles = useCallback(async (loadMore = false) => {
    if (!loadMore) { setLoading(true); } else { setLoadingMore(true); }
    try {
      let q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(PAGE_SIZE));
      if (loadMore && lastDoc) { q = query(q, startAfter(lastDoc)); }
      const snapshot = await getDocs(q);
      const list: ArticleSummary[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, title: data.title || '', slug: data.slug || '', imageUrl: data.imageUrl || '', publishedAt: data.publishedAt || 0, excerpt: data.excerpt || '' };
      });
      setArticles(prev => loadMore ? [...prev, ...list] : list);
      setLastDoc(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    if (!articleId) { fetchArticles(false); }
  }, [articleId]);

  useEffect(() => {
    if (!articleId) return;

    const initStudio = async () => {
      try {
        const isManual = searchParams.get('manual') === 'true';

        if (isManual) {
          const manualTitle = searchParams.get('title') || 'Manual Video';
          const manualImageUrl = searchParams.get('image') || '';
          const manualCaption = searchParams.get('caption') || '';

          const placeholderArticle: Article = {
            id: 'manual', title: manualTitle, content: '', excerpt: manualCaption, imageUrl: manualImageUrl,
            categoryId: '', slug: 'manual-video', publishedAt: new Date().toISOString(), authorId: 'admin',
            status: 'published', isLead: false, isFeatured: false, viewCount: 0,
          };
          setArticle(placeholderArticle);

          const initialReel: ReelConfig = {
            reelId: uuidv4(), articleId: 'manual', title: manualTitle, template: 'minimal-dark', duration: 20,
            musicId: '', musicVolume: 1,
            images: manualImageUrl ? [{ id: uuidv4(), url: manualImageUrl, duration: 5, animation: 'zoom', position: 0, caption: manualCaption || undefined }] : [],
            headlineText: manualTitle, subtitleText: manualCaption, status: 'draft',
            metadata: { fps: 30, width: 1080, height: 1920, format: 'mp4' },
            bottomCardColor: '#1a1a2e', bottomBarColor: '#0D9488', bottomTextColor: '#FFFFFF',
            detailsStartTime: 6, captionFontSize: 64, descriptionFontSize: 40,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin',
          };
          dispatch({ type: 'SET_REEL', payload: initialReel });
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/article/fetch?id=${articleId}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch article');
        const fetchedArticle = data.data as Article;
        setArticle(fetchedArticle);

        const initialReel: ReelConfig = {
          reelId: uuidv4(), articleId: fetchedArticle.id, title: fetchedArticle.title, template: 'minimal-dark', duration: 20,
          musicId: '', musicVolume: 1,
          images: [{ id: uuidv4(), url: fetchedArticle.imageUrl, duration: 5, animation: 'zoom', position: 0 }],
          headlineText: fetchedArticle.title, subtitleText: fetchedArticle.excerpt, status: 'draft',
          metadata: { fps: 30, width: 1080, height: 1920, format: 'mp4' },
          bottomCardColor: '#1a1a2e', bottomBarColor: '#0D9488', bottomTextColor: '#FFFFFF',
          detailsStartTime: 6, captionFontSize: 64, descriptionFontSize: 40,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin',
        };
        dispatch({ type: 'SET_REEL', payload: initialReel });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    initStudio();
  }, [articleId, searchParams, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" /><p className="text-foreground text-lg">লোড হচ্ছে...</p></div>
      </div>
    );
  }

  if (!articleId) {
    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="text-foreground hover:text-primary transition-colors"><ImagePlus className="w-5 h-5" /></Link>
            <div><h1 className="text-lg font-bold text-foreground">ভিডিও রিল স্টুডিও</h1><p className="text-xs text-muted-foreground">একটি আর্টিকেল নির্বাচন করুন</p></div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="আর্টিকেল খুঁজুন..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><p className="text-lg mb-2">কোনো আর্টিকেল পাওয়া যায়নি</p></div>
            ) : (
              <>
                {filteredArticles.map(article => (
                  <button key={article.id} onClick={() => router.push(`/studio?article=${article.id}`)} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all text-left w-full">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {article.imageUrl ? <img src={article.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="w-full h-full flex items-center justify-center"><ImagePlus className="w-6 h-6 text-muted-foreground" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2">{article.title}</h3>
                      {article.excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{article.excerpt}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('bn-BD') : ''}</span>
                        <ExternalLink className="w-3 h-3 text-primary/60" />
                      </div>
                    </div>
                  </button>
                ))}
                {hasMore && (
                  <button onClick={() => fetchArticles(true)} disabled={loadingMore} className="w-full py-3 rounded-lg border border-border bg-card hover:bg-muted text-sm text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...</> : <><ChevronDown className="w-4 h-4" /> আরও লোড করুন ({articles.length}+)</>}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error}</p>
          <Link href="/studio" className="text-primary hover:underline">আর্টিকেল তালিকায় ফিরুন</Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-foreground text-lg mb-4">No article found</p>
          <Link href="/studio" className="text-primary hover:underline">আর্টিকেল তালিকায় ফিরুন</Link>
        </div>
      </div>
    );
  }

  return <EditorLayout article={article} />;
}

export default function StudioPage() {
  return (
    <ReelEditorProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background"><div className="text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" /><p className="text-foreground text-lg">লোড হচ্ছে...</p></div></div>}>
        <StudioContent />
      </Suspense>
    </ReelEditorProvider>
  );
}