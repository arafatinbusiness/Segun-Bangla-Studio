# Parent Portal Integration Guide

How to connect Segun Bangla Studio to your main news portal.

---

## Overview

The Segun Bangla Studio is a **separate application** that receives articles from your main portal. When an admin clicks "Create Reel" in the portal, it opens the Studio in a new tab/modal.

---

## Integration Steps

### 1. Add "Create Reel" Button in Admin Panel

In your main portal's article admin page, add a button:

```jsx
// In your article admin component
<button 
  onClick={() => {
    const studioUrl = `https://studio.segunbangla.com/studio?article=${articleId}&token=${authToken}`;
    window.open(studioUrl, 'segun-bangla-studio', 'width=1400,height=900');
  }}
  className="btn btn-primary"
>
  📹 Create Reel
</button>
```

### 2. Pass Required Parameters

The Studio accepts these URL parameters:

```
https://studio.segunbangla.com/studio?article=ARTICLE_ID&token=AUTH_TOKEN
```

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `article` | Yes | string | Firestore article ID |
| `token` | Optional | string | JWT token for authentication |

### 3. Example Implementation

**React Component:**
```jsx
import { useAuth } from '@/lib/auth'; // or your auth system

export function CreateReelButton({ articleId }) {
  const { user, token } = useAuth();

  const handleCreateReel = () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    const params = new URLSearchParams({
      article: articleId,
      token: token,
    });

    const studioUrl = `https://studio.segunbangla.com/studio?${params}`;
    window.open(studioUrl, '_blank', 'width=1400,height=900');
  };

  return (
    <button 
      onClick={handleCreateReel}
      className="flex items-center gap-2"
    >
      📹 Create Reel
    </button>
  );
}
```

---

## What Happens in Studio

1. **Article Import** - Studio fetches article from Firestore
2. **Data Display** - Shows title, excerpt, featured image
3. **Admin Edits** - Adds more images, selects music, chooses template
4. **Preview** - Real-time 9:16 vertical video preview
5. **Rendering** - Generates MP4 file
6. **Download** - Admin downloads and uploads to social media

---

## Data Flow

```
Main Portal
    ↓
Admin clicks "Create Reel"
    ↓
Opens: studio.segunbangla.com/studio?article={id}&token={token}
    ↓
Studio fetches from Firestore: /articles/{articleId}
    ↓
Studio displays article data
    ↓
Admin creates reel
    ↓
Studio saves to: /reels/{reelId}
    ↓
Studio returns MP4 download URL
```

---

## Firebase Data Mapping

### Articles Collection
The Studio expects articles with this structure:

```javascript
{
  title: "Breaking News Title",
  excerpt: "Short summary for preview",
  content: "Full HTML content",
  imageUrl: "https://example.com/image.jpg",
  slug: "article-slug",
  categoryId: "news",
  publishedAt: "2024-05-13T10:00:00Z",
  authorId: "author-123",
  status: "published",
  viewCount: 1234
}
```

### Reels Collection (Studio Creates)
Studio saves completed reels to:

```javascript
/reels/{reelId} {
  articleId: "article-123",
  template: "breaking-news",
  musicId: "breaking-news/sample-1",
  duration: 20,
  images: [
    { url: "...", duration: 3, animation: "zoom" },
    { url: "...", duration: 2, animation: "pan" }
  ],
  status: "completed",
  videoUrl: "gs://bucket/reels/reel-123.mp4",
  createdAt: "2024-05-13T10:30:00Z",
  createdBy: "admin-123"
}
```

---

## API Endpoints (For Backend Integration)

If you want to automate reel creation, use these endpoints:

### Fetch Article
```bash
GET /api/article/fetch?articleId=ABC123&token=AUTH_TOKEN

Response:
{
  success: true,
  article: { ... }
}
```

### Start Rendering
```bash
POST /api/render/start

Body:
{
  articleId: "abc123",
  images: ["url1", "url2"],
  musicId: "breaking-news/sample-1",
  template: "breaking-news",
  duration: 20
}

Response:
{
  success: true,
  reelId: "reel-123",
  status: "pending"
}
```

### Check Render Status
```bash
GET /api/render/status?reelId=reel-123

Response:
{
  status: "completed",
  progress: 100,
  videoUrl: "gs://bucket/reel-123.mp4"
}
```

---

## Authentication (Optional)

If your portal uses authentication tokens:

1. **Generate Token** - Main portal creates JWT with user info
2. **Pass to Studio** - Include in URL as `token` parameter
3. **Studio Validates** - Verifies token before allowing edits
4. **Save Attribution** - Records which admin created the reel

### Token Format (Optional)
```javascript
{
  userId: "user-123",
  email: "admin@segunbangla.com",
  role: "editor",
  iat: 1234567890,
  exp: 1234571490
}
```

---

## Security Considerations

### Firestore Rules
Protect your database with these rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Articles: readable by all, writable by admins
    match /articles/{articleId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }

    // Reels: readable by all, writable by authenticated users
    match /reels/{reelId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Validation
Studio validates:
- Article exists before opening
- Images are valid URLs
- Music selection is from approved library
- Reel duration is within limits (7-30 seconds)

---

## Testing Integration

### Local Testing
```bash
# Start Studio locally
cd /path/to/studio
pnpm dev

# Access with test article
http://localhost:3000/studio?article=test-article-id
```

### Production Testing
```bash
# After deploying to studio.segunbangla.com
https://studio.segunbangla.com/studio?article=YOUR_ARTICLE_ID
```

---

## Troubleshooting

### Studio won't open
- Check browser popup blocker
- Verify `studio.segunbangla.com` is accessible
- Check network tab for blocked requests

### Article won't load
- Verify article ID is correct
- Check Firestore connection
- Review browser console for errors

### Auth token not working
- Confirm token format matches expected structure
- Check token expiration time
- Verify Firebase rules allow access

---

## Support

For issues or questions:
1. Check `README.md` for technical details
2. Review `WORKFLOW_GUIDE.md` for user flow
3. Check console logs for errors
4. Verify Firebase connection

---

## Next: Link from Portal

Once Studio is deployed, update your main portal with:

```javascript
const STUDIO_URL = 'https://studio.segunbangla.com/studio';

function openReelStudio(articleId, authToken) {
  const url = `${STUDIO_URL}?article=${articleId}&token=${authToken}`;
  window.open(url, 'segun-bangla-studio', 
    'width=1400,height=900,left=100,top=100');
}
```

Then call `openReelStudio(articleId, token)` from your admin panel!
