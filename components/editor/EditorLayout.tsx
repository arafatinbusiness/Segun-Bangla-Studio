'use client';

import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Article } from '@/lib/types';
import LeftSidebar from './LeftSidebar';
import PreviewPane from './PreviewPane';
import RightSettingsPanel from './RightSettingsPanel';
import TopToolbar from './TopToolbar';

interface EditorLayoutProps {
  article: Article;
}

export default function EditorLayout({ article }: EditorLayoutProps) {
  const [previewKey, setPreviewKey] = useState(0);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <TopToolbar article={article} />

      {/* 3-Pane Editor */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Left Sidebar - Images & Music */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <LeftSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Preview Pane */}
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="w-full h-full overflow-auto flex items-center justify-center bg-slate-950 p-4">
              <PreviewPane key={previewKey} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Settings Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <RightSettingsPanel onPreviewUpdate={() => setPreviewKey((k) => k + 1)} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
