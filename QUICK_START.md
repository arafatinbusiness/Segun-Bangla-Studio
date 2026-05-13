# Segun Bangla Studio - Quick Start (5 Minutes)

Get Segun Bangla Studio running in development mode in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Firebase project created
- Firebase service account credentials

## Step 1: Install Dependencies (2 minutes)

```bash
cd segun-bangla-studio
pnpm install
```

## Step 2: Configure Environment (1 minute)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234
   
   # Admin SDK (optional for local dev)
   FIREBASE_ADMIN_PROJECT_ID=your-project
   FIREBASE_CLIENT_EMAIL=...@...iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Step 3: Start Dev Server (1 minute)

```bash
pnpm dev
```

Output should show:
```
✓ Ready in 388ms
- Local:         http://localhost:3000
- Network:       http://100.64.11.53:3000
```

## Step 4: Open in Browser (1 minute)

1. Visit: `http://localhost:3000`
2. You should see the landing page
3. To test editor: `http://localhost:3000/studio?article=test-id`

**Note**: For the editor to work, you need an article in your Firestore database at `/articles/test-id`

## Next Steps

### To Create a Test Article in Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Create collection: `articles`
5. Add document with ID: `test-id`
6. Add fields:
   ```json
   {
     "title": "Breaking News from Dhaka",
     "excerpt": "A developing story from Bangladesh",
     "imageUrl": "https://via.placeholder.com/400",
     "content": "Full article content here...",
     "categoryId": "breaking-news",
     "slug": "breaking-news-dhaka",
     "publishedAt": "2024-01-01T00:00:00Z",
     "authorId": "admin",
     "status": "published",
     "isLead": true,
     "isFeatured": true,
     "viewCount": 100
   }
   ```

7. Refresh studio and the article data will load!

### To Add Bangla Fonts:

1. Download fonts from [Google Fonts](https://fonts.google.com):
   - Hind Siliguri
   - Noto Sans Bengali

2. Place `.ttf` files in `public/fonts/`:
   ```
   public/fonts/
   ├── HindSiliguri-Regular.ttf
   ├── HindSiliguri-Bold.ttf
   ├── NotoSansBengali-Regular.ttf
   └── NotoSansBengali-Bold.ttf
   ```

3. Fonts are loaded automatically via `app/globals.css`

### To Add Music:

1. Create directories:
   ```bash
   mkdir -p public/music/{breaking-news,emotional,political,international,war,sad,documentary}
   ```

2. Add MP3 files to each category

3. Update `lib/music/metadata.json` with track information:
   ```json
   {
     "breaking-news": [
       {
         "id": "breaking-news/dramatic-strings",
         "name": "Dramatic Strings",
         "file": "/music/breaking-news/dramatic-strings.mp3",
         "duration": 45,
         "category": "Breaking News"
       }
     ]
   }
   ```

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run linter |

## Project Structure

```
app/
├── page.tsx              # Landing page
├── studio/page.tsx       # Main editor
└── api/                  # API endpoints
components/editor/        # Editor UI components
lib/                      # Core logic
├── firebase.ts           # Firebase config
├── types.ts              # TypeScript types
├── templates/            # Template system
└── music/                # Music metadata
remotion/                 # Video composition
```

## Troubleshooting

### "Cannot find module 'firebase'"
→ Run `pnpm install` again

### "Firebase config not found"
→ Check `.env.local` has all variables

### "Article not loading"
→ Verify article exists in Firestore at `/articles/{articleId}`

### "Dev server won't start"
→ Check port 3000 is available: `lsof -i :3000`

### "Fonts not loading"
→ Place `.ttf` files in `public/fonts/` directory

## More Information

- **Full Documentation**: See `README.md`
- **Setup Instructions**: See `SETUP_GUIDE.md`
- **User Workflow**: See `WORKFLOW_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`
- **Documentation Index**: See `DOCS_INDEX.md`

## What's Next?

1. **Explore the code**: Check out `components/editor/` and `lib/`
2. **Try the editor**: Visit `/studio?article=test-id` with a test article
3. **Read docs**: Start with `DOCS_INDEX.md` for guided learning paths
4. **Deploy to Vercel**: Follow `SETUP_GUIDE.md` → "Deployment to Vercel"

## Help!

If something doesn't work:

1. Check `SETUP_GUIDE.md` → "Troubleshooting"
2. Review `DOCS_INDEX.md` → "Support & Escalation"
3. Examine browser console for errors
4. Check `pnpm dev` output for warnings
5. Verify Firebase configuration

---

**Congratulations!** You're now running Segun Bangla Studio locally. Start building reels!

For the complete setup with Vercel deployment, see `SETUP_GUIDE.md`.
