'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Download, Save, Check, Loader2, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useReelEditor } from '@/lib/reelContext';

interface TopToolbarProps {
  article: Article;
}

type DownloadStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error';

export default function TopToolbar({ article }: TopToolbarProps) {
  const { state } = useReelEditor();
  const reel = state.reel;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showStatus = (status: DownloadStatus, message: string, prog?: number) => {
    setDownloadStatus(status);
    setStatusMessage(message);
    if (prog !== undefined) setProgress(prog);
    
    if (status === 'complete' || status === 'error') {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => {
        setDownloadStatus('idle');
        setStatusMessage('');
        setProgress(0);
      }, 5000);
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
    
    showStatus('preparing', 'Preparing video capture...', 10);
    
    try {
      // Wait for DOM
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const previewEl = document.querySelector('.preview-container') as HTMLElement;
      if (!previewEl) {
        showStatus('error', 'Preview not found. Make sure the preview is visible.');
        return;
      }

      showStatus('recording', 'Recording video (this matches your duration setting)...', 30);
      
      // Get the duration from reel settings
      const durationMs = (reel.duration || 10) * 1000;
      
      // Use canvas capture to generate video frames
      const canvas = document.createElement('canvas');
      const rect = previewEl.getBoundingClientRect();
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      
      // Get template colors
      const bgColor = getComputedStyle(previewEl).backgroundColor || '#000';
      const textColor = '#fff';
      
      // Record frames
      const fps = 30;
      const totalFrames = Math.floor((durationMs / 1000) * fps);
      const chunks: Blob[] = [];
      
      const mediaStream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9',
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `segun-bangla-${reel.articleId}.webm`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showStatus('complete', '✅ Video downloaded!', 100);
      };
      
      recorder.start();
      
      // Render frames
      for (let frame = 0; frame < totalFrames; frame++) {
        const progress_pct = 30 + Math.floor((frame / totalFrames) * 60);
        
        // Clear canvas
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 1080, 1920);
        
        // Draw image if exists
        if (reel.images && reel.images.length > 0) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          try {
            await new Promise<void>((resolve) => {
              img.onload = () => {
                const imgAspect = img.width / img.height;
                const canvasAspect = 1080 / 1920;
                let sx, sy, sw, sh;
                
                if (imgAspect > canvasAspect) {
                  sh = img.height;
                  sw = img.height * canvasAspect;
                  sx = (img.width - sw) / 2;
                  sy = 0;
                } else {
                  sw = img.width;
                  sh = img.width / canvasAspect;
                  sx = 0;
                  sy = (img.height - sh) / 2;
                }
                
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1080, 1920);
                resolve();
              };
              img.onerror = () => resolve();
              img.src = reel.images[0].url;
              
              // Timeout if image fails to load
              setTimeout(() => resolve(), 1000);
            });
          } catch (e) {
            // Continue without image
          }
        }
        
        // Draw overlay
        ctx.fillStyle = bgColor;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, 1080, 1920);
        ctx.globalAlpha = 1;
        
        // Draw headline with animation
        const fontSize = 48;
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Simple fade-in animation
        const fadeDuration = 30; // frames
        const alpha = Math.min(1, frame / fadeDuration);
        ctx.globalAlpha = alpha;
        
        const lines = wrapText(ctx, reel.headlineText || 'Segun Bangla', 1000, fontSize);
        const lineHeight = 60;
        const startY = (1920 - (lines.length * lineHeight)) / 2 - 50;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, 540, startY + (i * lineHeight));
        });
        
        ctx.globalAlpha = 1;
        
        // Draw subtitle
        if (reel.subtitleText) {
          ctx.font = '28px sans-serif';
          ctx.fillStyle = '#ccc';
          ctx.globalAlpha = Math.min(1, (frame - 15) / 30);
          ctx.fillText(reel.subtitleText, 540, startY + (lines.length * lineHeight) + 50);
          ctx.globalAlpha = 1;
        }
        
        // Draw footer
        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Segun Bangla', 540, 1880);
        
        // Wait for next frame
        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        
        if (frame % 10 === 0) {
          showStatus('recording', `Recording... ${Math.round((frame / totalFrames) * 100)}%`, progress_pct);
        }
      }
      
      recorder.stop();
      
    } catch (error) {
      console.error('Download error:', error);
      showStatus('error', 'Video generation failed. Your browser may not support this feature.');
    }
  };

  return (
    <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between relative">
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
          disabled={downloadStatus === 'preparing' || downloadStatus === 'recording' || downloadStatus === 'processing'}
        >
          {downloadStatus === 'preparing' || downloadStatus === 'recording' || downloadStatus === 'processing' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : downloadStatus === 'complete' ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" />
          ) : downloadStatus === 'error' ? (
            <AlertCircle className="w-4 h-4 mr-2 text-red-300" />
          ) : (
            <Film className="w-4 h-4 mr-2" />
          )}
          {downloadStatus === 'preparing' ? 'Preparing...' :
           downloadStatus === 'recording' ? 'Recording...' :
           downloadStatus === 'processing' ? 'Processing...' :
           downloadStatus === 'complete' ? 'Downloaded!' :
           downloadStatus === 'error' ? 'Failed' :
           'Generate Video'}
        </Button>
      </div>

      {/* Status Bar */}
      {downloadStatus !== 'idle' && (
        <div className={`absolute top-full left-0 right-0 px-6 py-2 text-xs border-b z-50 ${
          downloadStatus === 'complete' ? 'bg-green-50 border-green-200 text-green-700' :
          downloadStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center gap-2">
            {downloadStatus === 'preparing' || downloadStatus === 'recording' || downloadStatus === 'processing' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : downloadStatus === 'complete' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span>{statusMessage}</span>
            {progress > 0 && progress < 100 && (
              <div className="flex-1 max-w-[100px] ml-2">
                <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
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
