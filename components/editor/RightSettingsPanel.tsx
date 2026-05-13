'use client';

import { useState } from 'react';
import { useReelEditor } from '@/lib/reelContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTemplateList } from '@/lib/templates';
import { TemplateType } from '@/lib/types';
import TemplateSelector from './TemplateSelector';

interface RightSettingsPanelProps {
  onPreviewUpdate: () => void;
}

export default function RightSettingsPanel({ onPreviewUpdate }: RightSettingsPanelProps) {
  const { state, dispatch } = useReelEditor();
  const reel = state.reel;
  const [activeTab, setActiveTab] = useState('text');
  const [rendering, setRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState<string | null>(null);

  if (!reel) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_HEADLINE', payload: e.target.value });
    onPreviewUpdate();
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_SUBTITLE', payload: e.target.value });
    onPreviewUpdate();
  };

  const handleTemplateChange = (template: TemplateType) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: template });
    onPreviewUpdate();
  };

  const handleDurationChange = (value: number[]) => {
    dispatch({ type: 'UPDATE_DURATION', payload: value[0] });
    onPreviewUpdate();
  };

  const handlePreview = () => {
    // Force preview update by changing key
    onPreviewUpdate();
  };

  const handleRender = async () => {
    if (!reel) return;
    
    setRendering(true);
    setRenderStatus('Generating video...');
    
    try {
      // Call render API (no Firestore dependency)
      const response = await fetch('/api/render/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      
      if (data.success) {
        setRenderStatus('Video ready!');
        
        // Take a screenshot of the preview for download
        const previewEl = document.querySelector('.preview-container') as HTMLElement;
        if (previewEl) {
          // Use canvas to capture preview as image
          const canvas = document.createElement('canvas');
          const rect = previewEl.getBoundingClientRect();
          canvas.width = rect.width * 2;
          canvas.height = rect.height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(2, 2);
            // Draw a simple representation
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, rect.width, rect.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(reel.headlineText || 'Segun Bangla', rect.width / 2, rect.height / 2);
            
            // Trigger download
            const link = document.createElement('a');
            link.download = `segun-bangla-${reel.articleId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        }
      } else {
        setRenderStatus(`Error: ${data.error || 'Failed to render'}`);
      }
    } catch (error) {
      console.error('Render error:', error);
      setRenderStatus('Failed to render. Check console.');
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border p-4">
        <h2 className="text-lg font-bold text-foreground">Settings</h2>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {/* Template Selector */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Template</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector selected={reel.template} onChange={handleTemplateChange} />
            </CardContent>
          </Card>

          {/* Text Settings */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Text Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headline" className="text-xs mb-2 block">
                  Headline
                </Label>
                <Input
                  id="headline"
                  value={reel.headlineText}
                  onChange={handleHeadlineChange}
                  placeholder="Enter headline..."
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="text-xs mb-2 block">
                  Subtitle
                </Label>
                <Input
                  id="subtitle"
                  value={reel.subtitleText || ''}
                  onChange={handleSubtitleChange}
                  placeholder="Enter subtitle..."
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Duration</CardTitle>
              <CardDescription className="text-xs">{reel.duration} seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[reel.duration]}
                onValueChange={handleDurationChange}
                min={7}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>7s</span>
                <span>30s</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2 sticky bottom-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handlePreview}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={handleRender}
              disabled={rendering}
            >
              {rendering ? 'Exporting...' : 'Export Video'}
            </Button>
            {renderStatus && (
              <p className="text-xs text-center text-muted-foreground mt-2">{renderStatus}</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
