import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { Template } from '@/lib/types';

interface BrandingSceneProps {
  template: Template;
}

export default function BrandingScene({ template }: BrandingSceneProps) {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    easing: Easing.out(Easing.quad),
  });

  // Scale animation for logo
  const scale = interpolate(frame, [0, 15], [0.8, 1], {
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      {/* Logo/Branding */}
      <div
        style={{
          transform: `scale(${scale})`,
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: template.colors.primary,
            fontFamily: template.typography.font,
            textAlign: 'center',
          }}
        >
          সেগুন বাংলা
        </div>
        <div
          style={{
            fontSize: '24px',
            color: template.colors.accent,
            fontFamily: template.typography.font,
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          Segun Bangla
        </div>
      </div>

      {/* CTA Text */}
      <p
        style={{
          fontSize: template.typography.subtitleSize,
          color: template.colors.text,
          fontFamily: template.typography.font,
          textAlign: 'center',
          margin: '20px 0 0 0',
          maxWidth: '80%',
          lineHeight: 1.4,
        }}
      >
        Follow for breaking news & exclusive stories
      </p>

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          fontSize: '12px',
          color: template.colors.text,
          opacity: 0.5,
          fontFamily: template.typography.font,
        }}
      >
        @segunbangla
      </div>
    </AbsoluteFill>
  );
}
