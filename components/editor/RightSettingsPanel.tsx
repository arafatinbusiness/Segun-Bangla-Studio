'use client';

import { useReelEditor } from '@/lib/reelContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateType } from '@/lib/types';
import TemplateSelector from './TemplateSelector';
import { Palette } from 'lucide-react';

interface RightSettingsPanelProps {
  onPreviewUpdate: () => void;
}

export default function RightSettingsPanel({ onPreviewUpdate }: RightSettingsPanelProps) {
  const { state, dispatch } = useReelEditor();
  const reel = state.reel;

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

              <div>
                <Label htmlFor="description" className="text-xs mb-2 block">
                  Description (shown after details start time)
                </Label>
                <textarea
                  id="description"
                  value={reel.description || ''}
                  onChange={(e) => {
                    dispatch({ type: 'UPDATE_DESCRIPTION', payload: e.target.value });
                    onPreviewUpdate();
                  }}
                  placeholder="Enter article description that replaces caption after the details start time..."
                  className="w-full min-h-[80px] text-sm bg-background border border-border rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  This text will appear in the bottom card after {reel.detailsStartTime} seconds (max 4 lines)
                </p>
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

          {/* Details Start Time */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Article Details Start</CardTitle>
              <CardDescription className="text-xs">
                Show article content after {reel.detailsStartTime} seconds (max 4 lines)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[reel.detailsStartTime]}
                onValueChange={(value) => {
                  dispatch({ type: 'UPDATE_DETAILS_START_TIME', payload: value[0] });
                  onPreviewUpdate();
                }}
                min={3}
                max={Math.max(reel.duration - 3, 3)}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>3s</span>
                <span>{Math.max(reel.duration - 3, 3)}s</span>
              </div>
            </CardContent>
          </Card>

          {/* Font Size Settings */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Font Size</CardTitle>
              <CardDescription className="text-xs">
                Adjust caption and description text size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs mb-2 block">
                  Caption Size: {reel.captionFontSize || 64}px
                </Label>
                <Slider
                  value={[(reel.captionFontSize || 64)]}
                  onValueChange={(value) => {
                    dispatch({ type: 'UPDATE_CAPTION_FONT_SIZE', payload: value[0] });
                    onPreviewUpdate();
                  }}
                  min={24}
                  max={96}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>24px</span>
                  <span>96px</span>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">
                  Description Size: {reel.descriptionFontSize || 40}px
                </Label>
                <Slider
                  value={[(reel.descriptionFontSize || 40)]}
                  onValueChange={(value) => {
                    dispatch({ type: 'UPDATE_DESCRIPTION_FONT_SIZE', payload: value[0] });
                    onPreviewUpdate();
                  }}
                  min={16}
                  max={72}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>16px</span>
                  <span>72px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Bar Colors */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Bottom Bar Colors
              </CardTitle>
              <CardDescription className="text-xs">
                Customize the bottom card and bar colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bottom Card Color */}
              <div>
                <Label className="text-xs mb-2 block">
                  Card Background Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={reel.bottomCardColor}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_BOTTOM_CARD_COLOR', payload: e.target.value });
                      onPreviewUpdate();
                    }}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={reel.bottomCardColor}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_BOTTOM_CARD_COLOR', payload: e.target.value });
                      onPreviewUpdate();
                    }}
                    className="text-xs font-mono flex-1"
                    placeholder="#1a1a2e"
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {['#1a1a2e', '#0f0f23', '#2d1b69', '#1e293b', '#111827', '#1c1917'].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        reel.bottomCardColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        dispatch({ type: 'UPDATE_BOTTOM_CARD_COLOR', payload: color });
                        onPreviewUpdate();
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Text Color */}
              <div>
                <Label className="text-xs mb-2 block">
                  Text Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={reel.bottomTextColor}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_BOTTOM_TEXT_COLOR', payload: e.target.value });
                      onPreviewUpdate();
                    }}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={reel.bottomTextColor}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_BOTTOM_TEXT_COLOR', payload: e.target.value });
                      onPreviewUpdate();
                    }}
                    className="text-xs font-mono flex-1"
                    placeholder="#FFFFFF"
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {['#FFFFFF', '#FCD34D', '#93C5FD', '#86EFAC', '#FCA5A5', '#D8B4FE'].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        reel.bottomTextColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        dispatch({ type: 'UPDATE_BOTTOM_TEXT_COLOR', payload: color });
                        onPreviewUpdate();
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Bar Color */}
              <div>
                <Label className="text-xs mb-2 block">
                  Bottom Bar Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={reel.bottomBarColor}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_BOTTOM_BAR_COLOR', payload: e.target.value });
                      onPreviewUpdate();
                    }}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={reel.bottomBarColor}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_BOTTOM_BAR_COLOR', payload: e.target.value });
                      onPreviewUpdate();
                    }}
                    className="text-xs font-mono flex-1"
                    placeholder="#0D9488"
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {['#0D9488', '#2563eb', '#dc2626', '#7c3aed', '#059669', '#d97706'].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        reel.bottomBarColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        dispatch({ type: 'UPDATE_BOTTOM_BAR_COLOR', payload: color });
                        onPreviewUpdate();
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}
