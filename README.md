# Segun Bangla Studio

Professional newsroom cinematic reel production studio for creating stunning 9:16 vertical video reels from news articles.

## Features

- **Article Import System**: Automatically imports article data (title, excerpt, images, content) from the parent Segun Bangla news portal via Firebase Firestore
- **3-Pane Editor UI**: Professional editor layout with:
  - Left sidebar: Image management and music selection
  - Center pane: Real-time 9:16 preview
  - Right panel: Settings, templates, and controls
- **4 Cinematic Templates**:
  - Breaking News (red accent, fast pacing)
  - International News (blue accent, smooth transitions)
  - Minimal Dark (minimalist style)
  - Red Alert (emergency/urgent styling)
- **Image Management**: Add, reorder, delete images with customizable:
  - Duration per image
  - Animation effects (zoom, pan, fade)
  - Automatic vertical crop adjustment
- **Music System**: 7 music categories with pre-curated tracks:
  - Breaking News
  - Emotional
  - Political
  - International
  - War
  - Sad
  - Documentary
- **Bangla Typography**: Full support for Bangla text with proper fonts:
  - Hind Siliguri (primary)
  - Noto Sans Bengali (fallback)
- **Video Rendering**: Server-side rendering with Remotion to MP4 format:
  - Resolution: 1080x1920 (9:16)
  - Codec: H.264
  - FPS: 30
  - Duration: 7-30 seconds

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **Video Engine**: Remotion 4.0
- **Backend**: Firebase Firestore, Firebase Storage, Firebase Admin SDK
- **Deployment**: Vercel

## Setup

### Prerequisites

- Node.js 18+
- Firebase project (same as parent Segun Bangla news portal)
- Service account credentials from Firebase

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. Add Bangla fonts to `public/fonts/`:
   - Download or add:
     - `HindSiliguri-Regular.ttf`
     - `HindSiliguri-Bold.ttf`
     - `NotoSansBengali-Regular.ttf`
     - `NotoSansBengali-Bold.ttf`

5. Add music files to `public/music/{category}/`:
   - Create directories for each category: breaking-news, emotional, political, international, war, sad, documentary
   - Add MP3 files to each directory
   - Update `/lib/music/metadata.json` to reference your files

6. Start the dev server:
   ```bash
   pnpm dev
   ```

7. Open http://localhost:3000

## Usage

### From Parent Portal

1. Admin clicks "Create Reel" in the parent Segun Bangla news portal
2. Parent portal opens Studio at: `https://studio.segunbangla.com/studio?article=ARTICLE_ID&token=AUTH_TOKEN`
3. Studio automatically fetches article data from Firestore
4. Admin edits the reel using the editor:
   - Add/remove/reorder images
   - Select music and adjust volume
   - Choose template style
   - Edit headline and subtitle text
   - Adjust reel duration
5. Click "Render Video" to start server-side rendering
6. Download the final MP4 file
7. Upload to Facebook, Instagram Reels, TikTok, YouTube Shorts

### Direct Usage

1. Visit http://localhost:3000/studio?article={articleId}
2. Ensure article exists in Firestore under `/articles/{articleId}`
3. Follow the editing workflow above

## Architecture

### Project Structure

```
app/
├── page.tsx              # Home/landing page
├── studio/
│   └── page.tsx         # Main studio editor
├── api/
│   ├── article/fetch.ts  # Fetch article from Firestore
│   ├── render/
│   │   ├── start.ts      # Start video render job
│   │   └── status.ts     # Check render progress
│   └── upload/
│       └── image.ts      # Upload images to Firebase Storage
components/
├── editor/
│   ├── EditorLayout.tsx       # Main 3-pane layout
│   ├── TopToolbar.tsx         # Header with back button
│   ├── LeftSidebar.tsx        # Images & music tabs
│   ├── PreviewPane.tsx        # Real-time 9:16 preview
│   ├── RightSettingsPanel.tsx # Settings & controls
│   ├── ImageManager.tsx       # Image list, reorder, delete
│   ├── MusicSelector.tsx      # Music picker
│   └── TemplateSelector.tsx   # Template preview grid
lib/
├── firebase.ts           # Firebase client config
├── firebaseAdmin.ts      # Firebase Admin SDK
├── types.ts              # TypeScript interfaces
├── reelContext.tsx       # Reel editor state management
├── renderQueue.ts        # Render job queue
├── templates/
│   ├── index.ts          # Template loader
│   ├── breaking-news.ts  # Breaking News template
│   ├── international.ts  # International template
│   ├── minimal-dark.ts   # Minimal Dark template
│   └── red-alert.ts      # Red Alert template
└── music/
    └── metadata.json     # Music tracks index
remotion/
├── ReelComposition.tsx   # Main video composition
└── scenes/
    ├── HeadlineScene.tsx # Headline animation
    ├── ImageScene.tsx    # Image with effects
    └── BrandingScene.tsx # Logo & branding outro
public/
├── fonts/                # Bangla font files
├── music/                # Music files by category
└── logo.png              # Segun Bangla branding
```

### Firebase Firestore Schema

**Collection: `/reels/{reelId}`**

```typescript
{
  articleId: string;
  title: string;
  template: 'breaking-news' | 'international' | 'minimal-dark' | 'red-alert';
  duration: number; // 7-30 seconds
  musicId: string;
  musicVolume: number; // 0-1
  images: Array<{
    id: string;
    url: string;
    duration: number;
    animation: 'zoom' | 'pan' | 'fade' | 'none';
    position: number;
  }>;
  headlineText: string;
  subtitleText?: string;
  status: 'draft' | 'pending' | 'rendering' | 'completed' | 'failed';
  videoUrl?: string;
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
```

### Video Rendering Flow

1. User configures reel and clicks "Render Video"
2. `POST /api/render/start` creates reel record in Firestore
3. Reel is added to in-memory render queue (can upgrade to Upstash Redis)
4. Background job processes rendering:
   - Remotion composition is rendered frame-by-frame
   - MP4 file is generated
   - Video is uploaded to Firebase Storage
   - Firestore status is updated to "completed"
5. User polls `GET /api/render/status?reelId={reelId}` for progress
6. When status is "completed", download link is provided

## Environment Considerations

### Vercel Deployment

1. Add environment variables to Vercel project settings
2. Ensure Firebase Admin credentials are properly formatted in Vercel
3. Enable appropriate Firebase security rules for Firestore and Storage

### Performance

- Images are lazy-loaded in the editor preview
- Rendering happens server-side to avoid browser crashes
- Consider adding Upstash Redis for distributed render queue in production

## Future Enhancements

- **AI Features**: Auto voiceover, smart scene generation, subtitle extraction
- **Advanced Editing**: Full timeline scrubber, multiple text layers, color correction
- **Social Integration**: Direct upload to Facebook, Instagram, TikTok, YouTube
- **Analytics**: Track reel performance metrics
- **Batch Rendering**: Queue multiple reels for rendering

## Support

For issues or feature requests related to the Segun Bangla Studio, please contact the development team.

## License

Proprietary - Segun Bangla
# Segun-Bangla-Studio
