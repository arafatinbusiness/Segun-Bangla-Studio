'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Sparkles, Zap, Plus, Image, Type, UserSquare2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Home() {
  const router = useRouter();
  const [manualTitle, setManualTitle] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualCaption, setManualCaption] = useState('');

  const handleManualCreate = () => {
    const params = new URLSearchParams();
    if (manualTitle) params.set('title', manualTitle);
    if (manualImageUrl) params.set('image', manualImageUrl);
    if (manualCaption) params.set('caption', manualCaption);
    params.set('manual', 'true');
    router.push(`/studio?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-6 flex justify-center">
          <Film className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">
          Segun Bangla Studio
        </h1>

        <p className="text-xl text-muted-foreground mb-8 text-balance">
          Professional newsroom video reel production studio. Transform your articles into stunning 9:16 vertical reels with cinematic templates and immersive animations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/studio">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              <Film className="w-5 h-5 mr-2" />
              Create Video Reel
            </Button>
          </Link>

          <Link href="/photocard">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-8"
            >
              <UserSquare2 className="w-5 h-5 mr-2" />
              Create Profile Card
            </Button>
          </Link>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Manually
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Video Manually</DialogTitle>
                <DialogDescription>
                  Paste image URLs and captions to create a video without an article.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="manual-title">Video Title</Label>
                  <Input
                    id="manual-title"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Enter video title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-image">Image URL</Label>
                  <Input
                    id="manual-image"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-caption">Caption Text</Label>
                  <Input
                    id="manual-caption"
                    value={manualCaption}
                    onChange={(e) => setManualCaption(e.target.value)}
                    placeholder="Enter caption for the image..."
                    className="mt-1"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleManualCreate}
                  disabled={!manualImageUrl && !manualCaption}
                >
                  <Film className="w-4 h-4 mr-2" />
                  Open Studio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-card rounded-lg border border-border">
            <Film className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Video Reels</h3>
            <p className="text-sm text-muted-foreground">
              Create professional 9:16 video reels with cinematic templates and music.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <UserSquare2 className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Profile Cards</h3>
            <p className="text-sm text-muted-foreground">
              Generate beautiful profile cards with Segun Bangla branding for social media.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Bangla Ready</h3>
            <p className="text-sm text-muted-foreground">
              Full support for Bangla typography and professional newsroom quality output.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>
          This is the Segun Bangla Studio - accessible from the main news portal via the "Create Reel" action.
        </p>
      </div>
    </div>
  );
}
