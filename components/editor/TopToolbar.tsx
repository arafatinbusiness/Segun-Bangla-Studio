'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Download, Save, Check, Loader2, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useReelEditor } from '@/lib/reelContext';
import { getTemplate } from '@/lib/templates';

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
  const audioContextRef = useRef<AudioContext | null>(null);

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

  const loadAudioBuffer = async (audioContext: AudioContext, url: string): Promise<AudioBuffer | null> => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Failed to load audio:', url, e);
      return null;
    }
  };

  const handleDownload = async () => {
    if (!reel) return;
    
    showStatus('preparing', 'Preparing video...', 5);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const template = getTemplate(reel.template);
      const fps = 30;
      const totalFrames = reel.duration * fps;
      
      // Scene timing (matches Remotion photocard design)
      const headlineEndFrame = 2 * fps;           // 0-2s: Headline scene
      const imageStartFrame = headlineEndFrame;     // 2s onwards: Image scenes
      const outroStartFrame = (reel.duration - 2) * fps; // Last 2s: Branding outro
      
      showStatus('preparing', 'Loading images & audio...', 10);
      
      // Preload images
      const loadedImages: HTMLImageElement[] = [];
      if (reel.images && reel.images.length > 0) {
        for (const imgData of reel.images) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = imgData.url;
            setTimeout(() => resolve(), 3000);
          });
          loadedImages.push(img);
        }
      }

      // Preload audio if music selected
      let audioBuffer: AudioBuffer | null = null;
      let audioContext: AudioContext | null = null;
      if (reel.musicId) {
        try {
          // Find the music file path from metadata
          const musicRes = await fetch('/music/metadata.json');
          const musicData = await musicRes.json();
          let musicFile = '';
          for (const cat of Object.keys(musicData)) {
            const track = musicData[cat].find((t: any) => t.id === reel.musicId);
            if (track) { musicFile = track.file; break; }
          }
          
          if (musicFile) {
            audioContext = new AudioContext();
            audioBuffer = await loadAudioBuffer(audioContext, musicFile);
          }
        } catch (e) {
          console.warn('Audio load failed, continuing without audio:', e);
        }
      }

      showStatus('recording', 'Generating video...', 20);
      
      // Setup canvas and recorder
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      
      const chunks: Blob[] = [];
      const mediaStream = canvas.captureStream(fps);
      
      // Add audio track if we have audio
      let audioSourceNode: AudioBufferSourceNode | null = null;
      let audioDest: MediaStreamAudioDestinationNode | null = null;
      
      if (audioContext && audioBuffer) {
        audioDest = audioContext.createMediaStreamDestination();
        audioSourceNode = audioContext.createBufferSource();
        audioSourceNode.buffer = audioBuffer;
        audioSourceNode.connect(audioDest);
        
        // Add audio track to the stream
        const audioTracks = audioDest.stream.getAudioTracks();
        audioTracks.forEach(track => mediaStream.addTrack(track));
      }
      
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
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
      
      // Start audio playback in sync with recording
      if (audioSourceNode && audioContext) {
        audioSourceNode.start(0);
      }
      
      // ===== RENDER FRAMES =====
      for (let frame = 0; frame < totalFrames; frame++) {
        const progress_pct = 20 + Math.floor((frame / totalFrames) * 75);
        
        // Clear canvas
        ctx.fillStyle = template.colors.background;
        ctx.fillRect(0, 0, 1080, 1920);
        
        // === SCENE 1: HEADLINE (0-2s) ===
        if (frame < headlineEndFrame) {
          // Fade in + scale animation
          const opacity = Math.min(1, frame / 15);
          const scale = 0.9 + (Math.min(1, frame / 20) * 0.1);
          
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.translate(540, 960);
          ctx.scale(scale, scale);
          
          // Headline text
          ctx.fillStyle = template.colors.text;
          ctx.font = `bold ${template.typography.headlineSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const lines = wrapText(ctx, reel.headlineText || 'Segun Bangla', 1000, template.typography.headlineSize);
          const lineHeight = template.typography.headlineSize * 1.3;
          const startY = -((lines.length - 1) * lineHeight) / 2;
          
          lines.forEach((line, i) => {
            ctx.fillText(line, 0, startY + (i * lineHeight));
          });
          
          ctx.restore();
        }
        
        // === SCENE 2: IMAGE WITH OVERLAY (2s to end-2s) ===
        if (frame >= imageStartFrame && frame < outroStartFrame) {
          const imageFrame = frame - imageStartFrame;
          const imageDuration = outroStartFrame - imageStartFrame;
          
          // Draw image if available
          if (loadedImages.length > 0) {
            const imgIndex = 0; // Use first image for now
            const img = loadedImages[imgIndex];
            
            // Get image animation from reel config
            const animation = reel.images[imgIndex]?.animation || 'zoom';
            
            // Apply animation
            ctx.save();
            
            if (animation === 'zoom') {
              const progress = imageFrame / imageDuration;
              const scale = 1 + (progress * 0.15); // 1x to 1.15x zoom
              ctx.translate(540, 960);
              ctx.scale(scale, scale);
              ctx.translate(-540, -960);
            } else if (animation === 'pan') {
              const progress = imageFrame / imageDuration;
              const xOffset = progress * 40; // Pan 40px right
              ctx.translate(-xOffset, 0);
            }
            
            // Draw image covering full canvas
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
            ctx.restore();
            
            // Fade in/out at edges
            const fadeFrames = 15;
            let imgOpacity = 1;
            if (imageFrame < fadeFrames) {
              imgOpacity = imageFrame / fadeFrames;
            }
            if (imageFrame > imageDuration - fadeFrames) {
              imgOpacity = (imageDuration - imageFrame) / fadeFrames;
            }
            
            // Overlay
            ctx.fillStyle = template.colors.primary;
            ctx.globalAlpha = template.overlays.opacity * imgOpacity;
            ctx.fillRect(0, 0, 1080, 1920);
            ctx.globalAlpha = 1;
            
            // === PHOTOCARD STYLE: Bottom text overlay ===
            // Red source label (like photocard)
            const sourceLabelY = 1500;
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('বিশেষ', 60, sourceLabelY);
            
            // Headline on image (like photocard - black bold text)
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 52px sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            const headlineLines = wrapText(ctx, reel.headlineText || 'Segun Bangla', 960, 52);
            const hlLineHeight = 68;
            const hlStartY = sourceLabelY + 50;
            
            headlineLines.forEach((line, i) => {
              ctx.fillText(line, 60, hlStartY + (i * hlLineHeight));
            });
            
            // Subtitle
            if (reel.subtitleText) {
              ctx.fillStyle = '#CCCCCC';
              ctx.font = '28px sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              ctx.fillText(reel.subtitleText, 60, hlStartY + (headlineLines.length * hlLineHeight) + 20);
            }
            
            // Bottom gradient for readability
            const gradient = ctx.createLinearGradient(0, 1400, 0, 1920);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 1400, 1080, 520);
            
            // Redraw text on top of gradient
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('বিশেষ', 60, sourceLabelY);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 52px sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            headlineLines.forEach((line, i) => {
              ctx.fillText(line, 60, hlStartY + (i * hlLineHeight));
            });
            
            if (reel.subtitleText) {
              ctx.fillStyle = '#CCCCCC';
              ctx.font = '28px sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              ctx.fillText(reel.subtitleText, 60, hlStartY + (headlineLines.length * hlLineHeight) + 20);
            }
          } else {
            // No image - show headline centered
            ctx.fillStyle = template.colors.text;
            ctx.font = `bold ${template.typography.headlineSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const lines = wrapText(ctx, reel.headlineText || 'Segun Bangla', 1000, template.typography.headlineSize);
            const lineHeight = template.typography.headlineSize * 1.3;
            const startY = 960 - ((lines.length - 1) * lineHeight) / 2;
            
            lines.forEach((line, i) => {
              ctx.fillText(line, 540, startY + (i * lineHeight));
            });
          }
        }
        
        // === SCENE 3: BRANDING OUTRO (last 2s) ===
        if (frame >= outroStartFrame) {
          const outroFrame = frame - outroStartFrame;
          const outroDuration = totalFrames - outroStartFrame;
          
          // Fade in
          const opacity = Math.min(1, outroFrame / 10);
          const scale = 0.8 + (Math.min(1, outroFrame / 15) * 0.2);
          
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = template.colors.background;
          ctx.fillRect(0, 0, 1080, 1920);
          
          ctx.translate(540, 960);
          ctx.scale(scale, scale);
          
          // Branding text
          ctx.fillStyle = template.colors.primary;
          ctx.font = 'bold 72px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('সেগুন বাংলা', 0, -40);
          
          ctx.fillStyle = template.colors.accent;
          ctx.font = '36px sans-serif';
          ctx.fillText('Segun Bangla', 0, 40);
          
          ctx.fillStyle = template.colors.text;
          ctx.font = '28px sans-serif';
          ctx.fillText('Follow for breaking news & exclusive stories', 0, 120);
          
          ctx.restore();
          
          // Watermark
          ctx.fillStyle = template.colors.text;
          ctx.globalAlpha = 0.5 * opacity;
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText('@segunbangla', 1050, 1890);
          ctx.globalAlpha = 1;
        }
        
        // Wait for next frame
        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        
        if (frame % Math.max(1, Math.floor(fps / 2)) === 0) {
          const pct = Math.round((frame / totalFrames) * 100);
          showStatus('recording', `Generating video... ${pct}%`, progress_pct);
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
           downloadStatus === 'recording' ? 'Generating...' :
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
