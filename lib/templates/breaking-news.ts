import { Template } from '@/lib/types';

export const breakingNewsTemplate: Template = {
  name: 'Breaking News',
  colors: {
    primary: '#DC2626', // red
    accent: '#FCD34D', // amber
    background: '#000000',
    text: '#FFFFFF',
  },
  typography: {
    headlineSize: 56,
    subtitleSize: 28,
    font: 'hind-siliguri',
  },
  overlays: {
    type: 'gradient',
    opacity: 0.4,
  },
  transitions: {
    type: 'zoom',
    duration: 0.5,
  },
  logoPlacement: 'top-right',
  motionStyle: 'fast',
};
