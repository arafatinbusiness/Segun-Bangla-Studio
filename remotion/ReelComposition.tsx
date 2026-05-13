import React from 'react';
import {
  Composition,
  Sequence,
  interpolate,
  Easing,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ReelConfig } from '@/lib/types';
import { getTemplate } from '@/lib/templates';
import HeadlineScene from './scenes/HeadlineScene';
import ImageScene from './scenes/ImageScene';
import BrandingScene from './scenes/BrandingScene';

interface ReelCompositionProps {
  config: ReelConfig;
}

export const ReelComposition: React.FC<ReelCompositionProps> = ({ config }) => {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();
  const durationInFrames = config.duration * videoConfig.fps;
  const template = getTemplate(config.template);

  // Calculate timing for each scene
  const headlineDuration = Math.ceil(2 * videoConfig.fps); // 2 seconds
  const imageStartTime = headlineDuration;
  const imageDuration = durationInFrames - headlineDuration - Math.ceil(2 * videoConfig.fps); // 2 second outro
  const outroStartTime = durationInFrames - Math.ceil(2 * videoConfig.fps);

  return (
    <Composition
      id="segun-bangla-reel"
      component={() => (
        <AbsoluteFill
          style={{
            backgroundColor: template.colors.background,
            width: 1080,
            height: 1920,
            overflow: 'hidden',
          }}
        >
          {/* Headline Scene (0-2 sec) */}
          {frame < headlineDuration && (
            <Sequence from={0} durationInFrames={headlineDuration}>
              <HeadlineScene
                headline={config.headlineText}
                template={template}
              />
            </Sequence>
          )}

          {/* Image Scenes (2-28 sec) */}
          {config.images.length > 0 && (
            <Sequence from={imageStartTime} durationInFrames={imageDuration}>
              {config.images.map((image, index) => {
                // Calculate when this image should appear
                const imageDur = Math.ceil(image.duration * videoConfig.fps);
                let imagePosition = 0;

                for (let i = 0; i < index; i++) {
                  imagePosition += Math.ceil(config.images[i].duration * videoConfig.fps);
                }

                return (
                  <Sequence
                    key={image.id}
                    from={imagePosition}
                    durationInFrames={imageDur}
                  >
                    <ImageScene
                      image={image}
                      template={template}
                      subtitle={index === 0 ? config.subtitleText : undefined}
                    />
                  </Sequence>
                );
              })}
            </Sequence>
          )}

          {/* Branding/Outro Scene (28-30 sec) */}
          {frame >= outroStartTime && (
            <Sequence from={outroStartTime} durationInFrames={Math.ceil(2 * videoConfig.fps)}>
              <BrandingScene template={template} />
            </Sequence>
          )}
        </AbsoluteFill>
      )}
      durationInFrames={durationInFrames}
      fps={videoConfig.fps}
      width={1080}
      height={1920}
    />
  );
};
