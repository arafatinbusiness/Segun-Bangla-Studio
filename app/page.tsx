'use client';

import { Film, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
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
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your First Reel
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 px-8"
          >
            Learn More
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-card rounded-lg border border-border">
            <Zap className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Create professional reels in minutes, not hours.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <Film className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Cinematic Quality</h3>
            <p className="text-sm text-muted-foreground">
              Premium templates and animations optimized for social media.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Bangla Ready</h3>
            <p className="text-sm text-muted-foreground">
              Full support for Bangla typography and content.
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
