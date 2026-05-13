'use client';

import { useReelEditor } from '@/lib/reelContext';
import { getTemplate } from '@/lib/templates';

export default function PreviewPane() {
  const { state } = useReelEditor();
  const reel = state.reel;

  if (!reel) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  const template = getTemplate(reel.template);
  const aspectRatio = 9 / 16;

  // Calculate preview dimensions based on available space
  const maxHeight = 600;
  const previewHeight = Math.min(maxHeight, window.innerHeight * 0.7);
  const previewWidth = previewHeight * aspectRatio;

  return (
    <div
      className="relative border-4 border-muted-foreground/30 rounded-lg overflow-hidden shadow-2xl"
      style={{
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
        backgroundColor: template.colors.background,
      }}
    >
      {/* Preview Content */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        {reel.images && reel.images.length > 0 ? (
          // Show first image as preview
          <div className="w-full h-full relative overflow-hidden rounded-md mb-4">
            <img
              src={reel.images[0].url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
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
        ) : (
          <div className="w-full h-1/2 bg-muted rounded-md mb-4 flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center">No image selected</p>
          </div>
        )}

        {/* Headline */}
        <div className="w-full text-center mb-4">
          <h1
            className="font-bold leading-tight text-pretty text-balance mb-3"
            style={{
              color: template.colors.text,
              fontSize: `${template.typography.headlineSize * 0.6}px`,
              fontFamily: template.typography.font,
            }}
          >
            {reel.headlineText || 'Your headline here'}
          </h1>

          {reel.subtitleText && (
            <p
              className="text-sm leading-snug text-balance"
              style={{
                color: template.colors.accent,
                fontSize: `${template.typography.subtitleSize * 0.6}px`,
                fontFamily: template.typography.font,
              }}
            >
              {reel.subtitleText}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-4 right-4 text-xs"
          style={{ color: template.colors.text, opacity: 0.6 }}
        >
          <p>Segun Bangla</p>
        </div>
      </div>
    </div>
  );
}
