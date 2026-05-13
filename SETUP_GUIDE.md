# Segun Bangla Studio - Setup Guide

This guide will help you configure and deploy the Segun Bangla Studio.

## Step 1: Environment Configuration

### Firebase Setup

1. Open your Firebase console for the Segun Bangla project
2. Go to Project Settings → Service Accounts
3. Generate a new private key
4. Copy the JSON and convert to environment variables:

   ```
   FIREBASE_ADMIN_PROJECT_ID=<project_id from JSON>
   FIREBASE_CLIENT_EMAIL=<client_email from JSON>
   FIREBASE_PRIVATE_KEY="<private_key from JSON, keep the \n characters>"
   ```

5. Get your client-side Firebase config (Settings → General):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain>
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket>
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
   NEXT_PUBLIC_FIREBASE_APP_ID=<appId>
   ```

6. Create `.env.local` file with these variables

## Step 2: Bangla Fonts

The application uses two Bangla fonts for professional typography:

### Required Fonts

1. **Hind Siliguri** (Primary font for headlines)
   - Download from: https://fonts.google.com/specimen/Hind+Siliguri
   - Files needed:
     - `HindSiliguri-Regular.ttf`
     - `HindSiliguri-Bold.ttf`
   - Place in: `public/fonts/`

2. **Noto Sans Bengali** (Fallback font)
   - Download from: https://fonts.google.com/specimen/Noto+Sans+Bengali
   - Files needed:
     - `NotoSansBengali-Regular.ttf`
     - `NotoSansBengali-Bold.ttf`
   - Place in: `public/fonts/`

### Installation Instructions

1. Download the font files from Google Fonts
2. Place `.ttf` files in `public/fonts/` directory
3. The app will automatically load these fonts via CSS `@font-face` declarations

## Step 3: Music Library

The application supports 7 categories of background music with pre-curated tracks.

### Music Categories

- **breaking-news/** - Urgent, dramatic music for breaking news
- **emotional/** - Poignant, emotional tracks
- **political/** - Formal, serious political content music
- **international/** - Global, world news music
- **war/** - Tension, conflict-themed music
- **sad/** - Melancholic, somber tracks
- **documentary/** - Documentary-style background music

### Setup Instructions

1. **Prepare Music Files**
   - Source royalty-free music from sites like:
     - Epidemic Sound
     - Artlist
     - AudioJungle
     - Free Music Archive
   - Format: MP3, 320kbps for best quality
   - Typical length: 30-60 seconds per track

2. **Organize Files**
   ```
   public/music/
   ├── breaking-news/
   │   ├── dramatic-strings.mp3
   │   └── urgent-pulse.mp3
   ├── emotional/
   │   ├── poignant-journey.mp3
   │   └── deep-reflection.mp3
   └── ... (other categories)
   ```

3. **Update Music Metadata**
   - Edit `lib/music/metadata.json`
   - For each category, add track entries:
   ```json
   {
     "category-name": [
       {
         "id": "category-name/track-slug",
         "name": "Track Display Name",
         "file": "/music/category-name/track-filename.mp3",
         "duration": 45,
         "category": "Category Name"
       }
     ]
   }
   ```

4. **Duration Calculation**
   - Use a media player or FFmpeg to get the exact duration
   - Command: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:novalue=1 file.mp3`

## Step 4: Segun Bangla Branding

### Logo Files

1. **Logo**: `public/logo.png`
   - Recommended: 300x300px, transparent PNG
   - Used in branding scene

2. **Watermark**: `public/watermark.png`
   - Recommended: 200x100px, transparent PNG
   - Appears in corner of reels

### Customization

The branding scene automatically includes:
- Segun Bangla text in Bangla (সেগুন বাংলা)
- English name (Segun Bangla)
- CTA text: "Follow for breaking news & exclusive stories"
- Social handle: @segunbangla

To customize, edit `remotion/scenes/BrandingScene.tsx`

## Step 5: Deployment to Vercel

### 1. Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit: Segun Bangla Studio"
git branch -M main
git remote add origin https://github.com/your-org/segun-bangla-studio.git
git push -u origin main
```

### 2. Create Vercel Project

1. Go to https://vercel.com
2. Import from Git
3. Select the repository
4. Configure build settings (defaults should work)
5. Add environment variables:
   - All `NEXT_PUBLIC_*` variables
   - All `FIREBASE_*` variables
6. Deploy

### 3. Configure Custom Domain

1. In Vercel project settings → Domains
2. Add custom domain: `studio.segunbangla.com`
3. Follow DNS configuration instructions

## Step 6: Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own reels
    match /reels/{reelId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow reading articles (public)
    match /articles/{articleId} {
      allow read: if true;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to their reel directories
    match /reels/{reelId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 7: Integration with Parent Portal

### Opening Studio from Parent Portal

From your Segun Bangla news portal, create a "Create Reel" button that opens:

```javascript
const articleId = article.id;
const authToken = getCurrentUserToken(); // Get from your auth system
const studioUrl = `https://studio.segunbangla.com/studio?article=${articleId}&token=${authToken}`;
window.open(studioUrl, '_blank');
```

The token can be validated server-side in `POST /api/render/start`

### Optional: Implement Token Verification

Edit `app/api/render/start/route.ts` to add token verification:

```typescript
// Verify token with parent portal
const response = await fetch(process.env.PARENT_PORTAL_AUTH_URL, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
if (!response.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

## Step 8: Testing

### Local Testing

```bash
pnpm dev
```

1. Navigate to http://localhost:3000
2. Visit `/studio?article=test-article-id` (must exist in Firestore)
3. Test editor functionality:
   - Add/remove images
   - Change templates
   - Edit text
   - Adjust duration
   - Select music

### Production Testing

1. Create test article in Firestore
2. Visit `https://studio.segunbangla.com/studio?article=test-id`
3. Complete full workflow:
   - Edit reel
   - Render video
   - Download result
   - Verify quality

## Troubleshooting

### Common Issues

**Firebase Config Not Loading**
- Check `.env.local` has all variables
- Restart dev server after adding env vars
- Verify Firebase project ID matches

**Fonts Not Rendering**
- Ensure `.ttf` files are in `public/fonts/`
- Check CSS font declarations in `app/globals.css`
- Use browser DevTools to verify font loading

**Music Not Appearing**
- Verify MP3 files exist in `public/music/{category}/`
- Update `lib/music/metadata.json` with correct file paths
- Check browser console for 404 errors

**Video Rendering Fails**
- Check Vercel logs for errors
- Ensure FFmpeg is available (installed on Vercel)
- Verify Firebase Storage has write permissions
- Check image URLs are accessible from server

**Article Not Importing**
- Verify article exists in Firestore at `/articles/{articleId}`
- Check Firebase Firestore security rules allow reads
- Check browser console for API errors

## Next Steps

1. Test the application thoroughly in development
2. Gather music tracks for all categories
3. Set up domain and SSL certificate
4. Create integration link in parent portal
5. Train staff on using the studio
6. Monitor performance and gather feedback

## Support Resources

- Remotion Documentation: https://www.remotion.dev
- Firebase Documentation: https://firebase.google.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Bangla Typography Guide: https://en.wikipedia.org/wiki/Bengali_script

## Contact

For questions about Segun Bangla Studio setup, contact the development team.
