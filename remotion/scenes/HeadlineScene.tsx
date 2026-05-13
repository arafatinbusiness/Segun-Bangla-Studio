import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Template } from '@/lib/types';

interface HeadlineSceneProps {
  headline: string;
  template: Template;
}

export default function HeadlineScene({ headline, template }: HeadlineSceneProps) {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();

  // Fade in animation
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    easing: Easing.out(Easing.quad),
  });

  // Scale animation
  const scale = interpolate(frame, [0, 20], [0.9, 1], {
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <h1
        style={{
          fontSize: template.typography.headlineSize,
          color: template.colors.text,
          fontFamily: template.typography.font,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.3,
          margin: 0,
          wordWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        {headline}
      </h1>
    </AbsoluteFill>
  );
}
