// Article type from parent portal
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  categoryId: string;
  subcategoryId?: string;
  slug: string;
  publishedAt: string;
  authorId: string;
  status: string;
  isLead: boolean;
  isFeatured: boolean;
  viewCount: number;
}

// Image in reel composition
export interface ReelImage {
  id: string;
  url: string;
  duration: number; // seconds on screen
  animation: 'zoom' | 'pan' | 'fade' | 'none';
  position: number; // order in timeline
  uploadedAt?: string;
}

// Reel configuration
export interface ReelConfig {
  reelId: string;
  articleId: string;
  title: string;
  template: TemplateType;
  duration: number; // 7-30 seconds
  musicId: string;
  musicVolume: number; // 0-1
  images: ReelImage[];
  headlineText: string;
  subtitleText?: string;
  status: 'draft' | 'pending' | 'rendering' | 'completed' | 'failed';
  videoUrl?: string;
  renderJobId?: string;
  metadata: {
    fps: 30;
    width: 1080;
    height: 1920;
    format: 'mp4';
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  error?: string;
}

// Template types
export type TemplateType = 'breaking-news' | 'international' | 'minimal-dark' | 'red-alert';

export interface Template {
  name: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headlineSize: number;
    subtitleSize: number;
    font: 'hind-siliguri' | 'noto-sans-bengali';
  };
  overlays: {
    type: 'gradient' | 'solid' | 'none';
    opacity: number;
  };
  transitions: {
    type: 'fade' | 'slide' | 'zoom';
    duration: number;
  };
  logoPlacement: 'top-left' | 'top-right' | 'bottom-right';
  motionStyle: 'cinematic' | 'fast' | 'slow';
}

// Music track
export interface MusicTrack {
  id: string;
  name: string;
  file: string;
  duration: number;
  category: string;
}

// Render job status
export interface RenderJob {
  reelId: string;
  status: 'pending' | 'processing' | 'rendering' | 'completed' | 'failed';
  progress: number; // 0-100
  error?: string;
  videoUrl?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthToken {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}
