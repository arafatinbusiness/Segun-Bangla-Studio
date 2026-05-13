'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Download, Save, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useReelEditor } from '@/lib/reelContext';

interface TopToolbarProps {
  article: Article;
}

type DownloadStatus = 'idle' | 'rendering' | 'capturing' | 'downloading' | 'complete' | 'error';

export default function TopToolbar({ article }: TopToolbarProps) {
  const { state } = useReelEditor();
  const reel = state.reel;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showStatus = (status: DownloadStatus, message: string) => {
    setDownloadStatus(status);
    setStatusMessage(message);
    
    // Auto-clear status after 3 seconds for success/error
    if (status === 'complete' || status === 'error') {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => {
        setDownloadStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const handleSaveDraft = async () => {
    if (!reel) return;
    
    setSaving(true);
    setSaved(false);
    
    try {
      const drafts = JSON.parse(localStorage.getItem('reel_drafts') || '[]');
      const existingIndex = drafts.findIndex((d: any) => d.reelId === reel.reelId);
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = reel;
      } else {
        drafts.push(reel);
      }
      
      localStorage.setItem('reel_drafts', JSON.stringify(drafts));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!reel) return;
    
    showStatus('rendering', 'Step 1/3: Rendering video...');
    
    try {
      // Step 1: Call render API
      const response = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: reel.articleId,
          template: reel.template,
          title: reel.title,
          headlineText: reel.headlineText,
          subtitleText: reel.subtitleText,
          duration: reel.duration,
          musicId: reel.musicId,
          musicVolume: reel.musicVolume,
          images: reel.images,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        showStatus('error', 'Render failed: ' + (data.error || 'Unknown error'));
        return;
      }

      // Step 2: Capture preview
      showStatus('capturing', 'Step 2/3: Capturing preview...');
      
      // Wait a frame for DOM to update
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const previewEl = document.querySelector('.preview-container') as HTMLElement;
      if (!previewEl) {
        showStatus('error', 'Preview element not found');
        return;
      }

      // Step 3: Generate and download image
      showStatus('downloading', 'Step 3/3: Generating download...');
      
      const canvas = document.createElement('canvas');
      const rect = previewEl.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        showStatus('error', 'Could not create canvas');
        return;
      }

      ctx.scale(2, 2);
      
      // Draw background
      const bgColor = getComputedStyle(previewEl).backgroundColor || '#000';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Draw headline
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const lines = wrapText(ctx, reel.headlineText || 'Segun Bangla', rect.width - 40, 28);
      const lineHeight = 36;
      const startY = (rect.height - (lines.length * lineHeight)) / 2;
      
      lines.forEach((line, i) => {
        ctx.fillText(line, rect.width / 2, startY + (i * lineHeight));
      });

      // Draw subtitle if exists
      if (reel.subtitleText) {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText(reel.subtitleText, rect.width / 2, startY + (lines.length * lineHeight) + 30);
      }

      // Draw footer
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Segun Bangla', rect.width / 2, rect.height - 20);
      
      // Trigger download
      const link = document.createElement('a');
      link.download = `segun-bangla-${reel.articleId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showStatus('complete', '✅ Download complete!');
    } catch (error) {
      console.error('Download error:', error);
      showStatus('error', 'Download failed. Check console.');
    }
  };

  return (
    <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground hover:bg-muted"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Segun Bangla Studio</h1>
          <p className="text-xs text-muted-foreground">
            {article.title.substring(0, 50)}
            {article.title.length > 50 ? '...' : ''}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-foreground border-border"
          onClick={handleSaveDraft}
          disabled={saving}
        >
          {saved ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Draft'}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-primary text-primary-foreground"
          onClick={handleDownload}
          disabled={downloadStatus === 'rendering' || downloadStatus === 'capturing' || downloadStatus === 'downloading'}
        >
          {downloadStatus === 'rendering' || downloadStatus === 'capturing' || downloadStatus === 'downloading' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : downloadStatus === 'complete' ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" />
          ) : downloadStatus === 'error' ? (
            <AlertCircle className="w-4 h-4 mr-2 text-red-300" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {downloadStatus === 'rendering' ? 'Rendering...' :
           downloadStatus === 'capturing' ? 'Capturing...' :
           downloadStatus === 'downloading' ? 'Downloading...' :
           downloadStatus === 'complete' ? 'Downloaded!' :
           downloadStatus === 'error' ? 'Failed' :
           'Download Video'}
        </Button>
      </div>

      {/* Status Bar */}
      {downloadStatus !== 'idle' && (
        <div className={`absolute bottom-0 left-0 right-0 translate-y-full px-6 py-2 text-xs border-t ${
          downloadStatus === 'complete' ? 'bg-green-50 border-green-200 text-green-700' :
          downloadStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center gap-2">
            {downloadStatus === 'rendering' || downloadStatus === 'capturing' || downloadStatus === 'downloading' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : downloadStatus === 'complete' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span>{statusMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to wrap text into lines
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  ctx.font = `bold ${fontSize}px sans-serif`;
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [text];
}
