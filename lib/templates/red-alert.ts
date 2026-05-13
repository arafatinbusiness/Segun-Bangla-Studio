import { Template } from '@/lib/types';

export const redAlertTemplate: Template = {
  name: 'Red Alert',
  colors: {
    primary: '#7F1D1D', // dark red
    accent: '#FCA5A5', // light red
    background: '#000000',
    text: '#FFFFFF',
  },
  typography: {
    headlineSize: 60,
    subtitleSize: 30,
    font: 'hind-siliguri',
  },
  overlays: {
    type: 'solid',
    opacity: 0.6,
  },
  transitions: {
    type: 'zoom',
    duration: 0.4,
  },
  logoPlacement: 'top-right',
  motionStyle: 'fast',
};
