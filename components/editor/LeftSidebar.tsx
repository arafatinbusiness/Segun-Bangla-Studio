'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageManager from './ImageManager';
import MusicSelector from './MusicSelector';

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('images');

  return (
    <div className="w-full h-full flex flex-col bg-card border-r border-border">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-border p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="images" className="text-sm">
              Images
            </TabsTrigger>
            <TabsTrigger value="music" className="text-sm">
              Music
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4">
          {activeTab === 'images' && <ImageManager />}
          {activeTab === 'music' && <MusicSelector />}
        </div>
      </ScrollArea>
    </div>
  );
}
