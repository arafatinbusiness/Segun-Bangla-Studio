import { Template } from '@/lib/types';

export const internationalTemplate: Template = {
  name: 'International News',
  colors: {
    primary: '#2563EB', // blue
    accent: '#60A5FA', // light blue
    background: '#1F2937',
    text: '#F3F4F6',
  },
  typography: {
    headlineSize: 52,
    subtitleSize: 26,
    font: 'noto-sans-bengali',
  },
  overlays: {
    type: 'gradient',
    opacity: 0.3,
  },
  transitions: {
    type: 'fade',
    duration: 0.8,
  },
  logoPlacement: 'bottom-right',
  motionStyle: 'cinematic',
};
