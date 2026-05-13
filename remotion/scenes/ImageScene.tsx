import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { ReelImage, Template } from '@/lib/types';

interface ImageSceneProps {
  image: ReelImage;
  template: Template;
  subtitle?: string;
}

export default function ImageScene({ image, template, subtitle }: ImageSceneProps) {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();
  const totalFrames = Math.ceil(image.duration * videoConfig.fps);

  // Animation effects based on type
  let transform = 'translateZ(0)';

  if (image.animation === 'zoom') {
    const scale = interpolate(frame, [0, totalFrames], [1, 1.1], {
      easing: Easing.inOut(Easing.quad),
    });
    transform = `scale(${scale})`;
  } else if (image.animation === 'pan') {
    const xOffset = interpolate(frame, [0, totalFrames], [0, 30], {
      easing: Easing.inOut(Easing.quad),
    });
    transform = `translateX(${xOffset}px)`;
  } else if (image.animation === 'fade') {
    // Fade is handled via opacity
  }

  // Fade in/out at edges
  const opacity = interpolate(frame, [0, 5, totalFrames - 5, totalFrames], [0, 1, 1, 0], {
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        overflow: 'hidden',
      }}
    >
      {/* Image with animation */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          opacity,
        }}
      >
        <img
          src={image.url}
          alt="Reel image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transform,
          }}
          crossOrigin="anonymous"
        />

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: template.colors.primary,
            opacity: template.overlays.opacity,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Subtitle text overlay */}
        {subtitle && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '30px',
              right: '30px',
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: template.typography.subtitleSize,
                color: template.colors.text,
                fontFamily: template.typography.font,
                fontWeight: 500,
                lineHeight: 1.4,
                margin: 0,
                wordWrap: 'break-word',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
