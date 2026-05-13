'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import EditorLayout from '@/components/editor/EditorLayout';
import { Article, ReelConfig } from '@/lib/types';
import { ReelEditorProvider, useReelEditor } from '@/lib/reelContext';
import { v4 as uuidv4 } from 'uuid';

function StudioContent() {
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useReelEditor();

  useEffect(() => {
    const initStudio = async () => {
      try {
        const articleId = searchParams.get('article');
        const isManual = searchParams.get('manual') === 'true';

        if (isManual) {
          // Manual creation mode - no article needed
          const manualTitle = searchParams.get('title') || 'Manual Video';
          const manualImageUrl = searchParams.get('image') || '';
          const manualCaption = searchParams.get('caption') || '';

          // Create a placeholder article
          const placeholderArticle: Article = {
            id: 'manual',
            title: manualTitle,
            content: '',
            excerpt: manualCaption,
            imageUrl: manualImageUrl,
            categoryId: '',
            slug: 'manual-video',
            publishedAt: new Date().toISOString(),
            authorId: 'admin',
            status: 'published',
            isLead: false,
            isFeatured: false,
            viewCount: 0,
          };
          setArticle(placeholderArticle);

          // Initialize reel with manual data
          const initialReel: ReelConfig = {
            reelId: uuidv4(),
            articleId: 'manual',
            title: manualTitle,
            template: 'minimal-dark',
            duration: 20,
            musicId: '',
            musicVolume: 1,
            images: manualImageUrl
              ? [
                  {
                    id: uuidv4(),
                    url: manualImageUrl,
                    duration: 5,
                    animation: 'zoom',
                    position: 0,
                    caption: manualCaption || undefined,
                  },
                ]
              : [],
            headlineText: manualTitle,
            subtitleText: manualCaption,
            status: 'draft',
            metadata: {
              fps: 30,
              width: 1080,
              height: 1920,
              format: 'mp4',
            },
            bottomCardColor: '#1a1a2e',
            bottomBarColor: '#0D9488',
            bottomTextColor: '#FFFFFF',
            detailsStartTime: 6,
            captionFontSize: 64,
            descriptionFontSize: 40,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'admin',
          };

          dispatch({ type: 'SET_REEL', payload: initialReel });
          setLoading(false);
          return;
        }

        if (!articleId) {
          setError('No article ID provided. Use "Create Manually" to create a video without an article.');
          setLoading(false);
          return;
        }

        // Fetch article from API
        const response = await fetch(`/api/article/fetch?id=${articleId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch article');
        }

        const fetchedArticle = data.data as Article;
        setArticle(fetchedArticle);

        // Initialize reel with article data
        const initialReel: ReelConfig = {
          reelId: uuidv4(),
          articleId: fetchedArticle.id,
          title: fetchedArticle.title,
          template: 'minimal-dark',
          duration: 20,
          musicId: '',
          musicVolume: 1,
          images: [
            {
              id: uuidv4(),
              url: fetchedArticle.imageUrl,
              duration: 5,
              animation: 'zoom',
              position: 0,
            },
          ],
          headlineText: fetchedArticle.title,
          subtitleText: fetchedArticle.excerpt,
          status: 'draft',
          metadata: {
            fps: 30,
            width: 1080,
            height: 1920,
            format: 'mp4',
          },
          bottomCardColor: '#1a1a2e',
          bottomBarColor: '#0D9488',
          bottomTextColor: '#FFFFFF',
          detailsStartTime: 6,
          captionFontSize: 64,
          descriptionFontSize: 40,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin',
        };

        dispatch({ type: 'SET_REEL', payload: initialReel });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    initStudio();
  }, [searchParams, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error}</p>
          <a href="/" className="text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-foreground text-lg">No article found</p>
          <a href="/" className="text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <EditorLayout article={article} />;
}

export default function StudioPage() {
  return (
    <ReelEditorProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-foreground text-lg">Loading studio...</p>
            </div>
          </div>
        }
      >
        <StudioContent />
      </Suspense>
    </ReelEditorProvider>
  );
}
