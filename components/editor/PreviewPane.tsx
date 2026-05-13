'use client';

import { useEffect, useState } from 'react';
import { useReelEditor } from '@/lib/reelContext';
import { getTemplate } from '@/lib/templates';

export default function PreviewPane() {
  const { state } = useReelEditor();
  const reel = state.reel;
  const [dimensions, setDimensions] = useState({ width: 360, height: 640 });

  useEffect(() => {
    const calculateDimensions = () => {
      const aspectRatio = 9 / 16;
      const maxHeight = 600;
      const previewHeight = Math.min(maxHeight, window.innerHeight * 0.7);
      const previewWidth = previewHeight * aspectRatio;
      setDimensions({ width: previewWidth, height: previewHeight });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  if (!reel) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  const template = getTemplate(reel.template);
  
  // Calculate photocard proportions matching the video generator
  const cardHeightRatio = 520 / 1920; // 520px card out of 1920px total
  const barHeightRatio = 60 / 1920; // 60px bar out of 1920px total
  const cardHeight = dimensions.height * cardHeightRatio;
  const barHeight = dimensions.height * barHeightRatio;
  const imageHeight = dimensions.height - cardHeight;

  // Get first image caption
  const firstImage = reel.images && reel.images.length > 0 ? reel.images[0] : null;
  const imageCaption = firstImage?.caption || reel.headlineText || 'Segun Bangla';
  
  // Determine if we should show details or caption (simulate after detailsStartTime)
  // For preview, we show caption first, then details after the start time
  // We'll show both states - caption by default, details toggled by a timer
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (!reel) return;
    const timer = setTimeout(() => {
      setShowDetails(true);
    }, (reel.detailsStartTime || 6) * 1000);
    return () => clearTimeout(timer);
  }, [reel?.detailsStartTime, reel?.reelId]);
  
  const detailsText = reel.description || reel.subtitleText || reel.headlineText || 'Segun Bangla';

  return (
    <div
      className="preview-container relative border-4 border-muted-foreground/30 rounded-lg overflow-hidden shadow-2xl"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        backgroundColor: template.colors.background,
      }}
    >
      {/* PHOTOCARD STYLE PREVIEW */}
      <div className="w-full h-full flex flex-col">
        {/* Image Area (top portion only) */}
        <div
          className="relative overflow-hidden"
          style={{ height: `${imageHeight}px` }}
        >
          {firstImage ? (
            <img
              src={firstImage.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">No image</p>
            </div>
          )}
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: template.colors.primary,
              opacity: template.overlays.opacity,
              mixBlendMode: 'multiply',
            }}
          />
        </div>

        {/* Bottom Card (solid color with caption) */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{
            height: `${cardHeight}px`,
            backgroundColor: reel.bottomCardColor || '#1a1a2e',
          }}
        >
          {/* Card top accent line */}
          <div className="w-full h-0.5 bg-red-600" />
          
          {/* Red source label - centered */}
          <div className="px-3 pt-3 text-center">
            <span className="text-red-600 font-bold text-xs">বিশেষ</span>
          </div>
          
          {/* Text in bottom card - caption first, then details after start time */}
          <div className="flex-1 px-3 pt-1 overflow-hidden flex items-center justify-center">
            {showDetails ? (
              <p
                className="font-bold leading-tight text-center"
                style={{
                  color: reel.bottomTextColor || '#FFFFFF',
                  fontSize: `${Math.max(8, dimensions.width * ((reel.descriptionFontSize || 40) / 1080))}px`,
                  lineHeight: 1.3,
                }}
              >
                {detailsText}
              </p>
            ) : (
              <p
                className="font-bold leading-tight text-center"
                style={{
                  color: reel.bottomTextColor || '#FFFFFF',
                  fontSize: `${Math.max(10, dimensions.width * ((reel.captionFontSize || 64) / 1080))}px`,
                  lineHeight: 1.3,
                }}
              >
                {imageCaption}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-3"
          style={{
            height: `${barHeight}px`,
            backgroundColor: reel.bottomBarColor || '#0D9488',
          }}
        >
          <span className="text-white font-bold text-xs">সেগুন বাংলা</span>
          <span className="text-teal-100 text-[10px]">@segunbangla</span>
        </div>
      </div>
    </div>
  );
}
