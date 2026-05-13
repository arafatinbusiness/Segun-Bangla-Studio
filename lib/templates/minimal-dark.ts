import { Template } from '@/lib/types';

export const minimalDarkTemplate: Template = {
  name: 'Minimal Dark',
  colors: {
    primary: '#FFFFFF',
    accent: '#E5E7EB', // gray
    background: '#111827',
    text: '#FFFFFF',
  },
  typography: {
    headlineSize: 48,
    subtitleSize: 24,
    font: 'hind-siliguri',
  },
  overlays: {
    type: 'solid',
    opacity: 0.2,
  },
  transitions: {
    type: 'fade',
    duration: 1,
  },
  logoPlacement: 'bottom-right',
  motionStyle: 'slow',
};
