'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Save, Check } from 'lucide-react';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useReelEditor } from '@/lib/reelContext';

interface TopToolbarProps {
  article: Article;
}

export default function TopToolbar({ article }: TopToolbarProps) {
  const { state } = useReelEditor();
  const reel = state.reel;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveDraft = async () => {
    if (!reel) return;
    
    setSaving(true);
    setSaved(false);
    
    try {
      // Save draft to localStorage for now (since Admin SDK isn't available)
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

  const handleDownload = () => {
    // Take a screenshot of the preview area
    const previewElement = document.querySelector('.preview-container');
    if (previewElement) {
      // Use html2canvas or simply open a print dialog
      alert('Video download will be available after rendering. Click "Render Video" in the settings panel first.');
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
          variant="outline"
          size="sm"
          className="text-foreground border-border"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
