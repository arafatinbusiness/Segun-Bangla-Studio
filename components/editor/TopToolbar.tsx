'use client';

import { ArrowLeft, Download, Save } from 'lucide-react';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface TopToolbarProps {
  article: Article;
}

export default function TopToolbar({ article }: TopToolbarProps) {
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
        <Button variant="outline" size="sm" className="text-foreground border-border">
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="text-foreground border-border">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
