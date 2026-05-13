# Segun Bangla Studio - Workflow Guide

This guide explains how newsroom admins will use Segun Bangla Studio to create video reels.

## User Workflow

### 1. Article Selection (Parent Portal)

**Where**: Segun Bangla News Portal  
**Action**: Admin clicks "Create Reel" button next to an article

```
┌─────────────────────────────┐
│  Segun Bangla News Portal   │
├─────────────────────────────┤
│ Article: "Breaking News..." │
│ [Create Reel] [Edit] [...] │
└─────────────────────────────┘
         ↓ (clicks)
```

### 2. Studio Opens

**URL**: `https://studio.segunbangla.com/studio?article={id}&token={token}`

```
Studio loads with:
- Article title, excerpt, featured image
- Empty timeline
- Default "Breaking News" template
- Ready for editing
```

### 3. Article Import (Automatic)

```
┌──────────────────────────────┐
│   LOADING ARTICLE DATA...    │
│                              │
│         [Spinner]            │
│                              │
│  Fetching from Firebase...   │
└──────────────────────────────┘
         ↓ (2-3 seconds)
```

Data fetched:
- Article title → Headline text
- Article excerpt → Subtitle text
- Featured image → First image in timeline
- Article metadata → Template selection

### 4. Editor Interface

```
┌─────────────────────────────────────────────────────────────┐
│  [←] Segun Bangla Studio | Article: Breaking News...        │
│  [Save Draft] [Download]                                    │
├──────────────────┬─────────────────────┬────────────────────┤
│  LEFT SIDEBAR    │  CENTER PREVIEW     │  RIGHT SETTINGS    │
│ ┌──────────────┐ │  ┌───────────────┐  │  ┌──────────────┐  │
│ │ IMAGES       │ │  │   9:16        │  │  │ Template:    │  │
│ │ [+] Add      │ │  │   Preview     │  │  │ ⦿ Breaking   │  │
│ │ • Image 1    │ │  │               │  │  │ ○ Intl       │  │
│ │   ↔ Zoom     │ │  │   [PREVIEW]   │  │  │ ○ Minimal    │  │
│ │   3s duration│ │  │               │  │  │ ○ Red Alert  │  │
│ │   [✕]        │ │  │               │  │  │              │  │
│ │              │ │  │               │  │  │ Headline:    │  │
│ │ MUSIC        │ │  │               │  │  │ [text...]    │  │
│ │ ⦿ Breaking   │ │  │               │  │  │              │  │
│ │   News       │ │  │               │  │  │ Duration:    │  │
│ │ • Breaking   │ │  │               │  │  │ ◀─ 20s ─►    │  │
│ │   Strings    │ │  │               │  │  │              │  │
│ │ • Pulse      │ │  └───────────────┘  │  │ [Render]     │  │
│ │ ♪ Political  │ │                     │  │              │  │
│ │ Volume: 100% │ │                     │  └──────────────┘  │
│ └──────────────┘ │                     │                    │
└──────────────────┴─────────────────────┴────────────────────┘
```

### 5. Editing Steps

#### Step 5a: Add/Manage Images

```
ACTIONS:
1. Click [+] Add button
2. Enter image URL
3. Click "Add Image"
4. Adjust duration (1-10s)
5. Select animation (Zoom, Pan, Fade)
6. Drag to reorder
7. Click [×] to delete

RESULT: Timeline with multiple images
```

Example:
```
Image Timeline:
[Headline 2s] → [Image1 5s] → [Image2 4s] → [Image3 5s] → [Outro 2s]
                  ↑ Zoom         ↑ Pan        ↑ Fade
```

#### Step 5b: Edit Text

```
HEADLINE:
- Auto-filled from article title
- Editable in text field
- Updates preview instantly
- Supports Bangla text perfectly

SUBTITLE:
- Auto-filled from article excerpt
- Optional additional text
- Updates preview instantly
- Appears during first image
```

Example:
```
Before: "Breaking News from Dhaka"
After:  "সড়ক দুর্ঘটনায় পাঁচজন আহত"
        [Bangla headline]

Preview updates: ✓
```

#### Step 5c: Select Template

```
TEMPLATES AVAILABLE:
1. Breaking News ⚡
   - Red accent (#DC2626)
   - Fast transitions
   - Urgent pacing

2. International 🌍
   - Blue accent (#2563EB)
   - Smooth transitions
   - Formal layout

3. Minimal Dark 🎬
   - Minimalist style
   - Slow animations
   - Clean aesthetic

4. Red Alert 🚨
   - Emergency styling
   - Pulsing effects
   - Maximum urgency

INTERACTION:
- Click template card
- Preview updates instantly
- All settings adapt to template
```

#### Step 5d: Adjust Duration

```
DURATION SLIDER:
Min: 7 seconds
Max: 30 seconds

CALCULATION:
Total = Headline(2s) + Images(sum) + Outro(2s)
       = 2 + 15 + 2 = 19 seconds

Adjust slider to set exact duration
Images will scale timing proportionally
```

#### Step 5e: Select Music

```
MUSIC SELECTION:
1. Click "Music" tab in left sidebar
2. Select category dropdown
   - Breaking News
   - Emotional
   - Political
   - International
   - War
   - Sad
   - Documentary

3. Click track to select
   - Preview plays (30 seconds)
   - Volume slider appears
   - Current selection highlighted

EXAMPLE:
Category: Breaking News
Track: "Dramatic Strings" (45s)
Volume: 80%
```

### 6. Preview & Adjustment Loop

```
┌─ EDIT ─────────────────────────────────────────┐
│                                                 │
│ ┌─ Check Preview ────────────────────────────┐ │
│ │ • Watch real-time 9:16 preview            │ │
│ │ • Verify text positioning                 │ │
│ │ • Check image animations                  │ │
│ │ • Confirm music timing                    │ │
│ │ • Preview matches final output            │ │
│ └─────────────────────────────────────────────┘ │
│                    ↓                             │
│ ┌─ Adjustments ──────────────────────────────┐ │
│ │ • Add/remove images                       │ │
│ │ • Change text                             │ │
│ │ • Switch template                         │ │
│ │ • Adjust duration                         │ │
│ │ • Change music                            │ │
│ └─────────────────────────────────────────────┘ │
│                    ↓                             │
└──── Repeat until satisfied ───────────────────┘
                    ↓
            [RENDER VIDEO]
```

### 7. Save Draft (Optional)

```
BEFORE RENDERING:
- Click "Save Draft" button
- Reel configuration saved to Firestore
- Can return later to continue editing
- Preserves all settings

DATA SAVED:
- Images and their settings
- Text content
- Template choice
- Music selection
- Duration settings
```

### 8. Render Video

```
┌─────────────────────────────────────┐
│   RENDER VIDEO                      │
│                                     │
│   Settings:                         │
│   - Resolution: 1080x1920 (9:16)   │
│   - Format: MP4 (H.264)            │
│   - Frame Rate: 30fps              │
│   - Estimated Time: 2-5 minutes    │
│                                     │
│   [START RENDERING]                │
└─────────────────────────────────────┘
         ↓ (clicks)
```

### 9. Rendering Progress

```
┌──────────────────────────────────────┐
│  RENDERING IN PROGRESS...            │
│                                      │
│  Reel ID: abc123def456              │
│  Status: Rendering                   │
│  Progress: ████████░░ 80%           │
│  ETA: 1 minute remaining             │
│                                      │
│  [CANCEL]                            │
└──────────────────────────────────────┘

Server is:
1. Rendering each frame
2. Composing scenes
3. Adding music
4. Encoding to MP4
5. Uploading to Firebase Storage
```

### 10. Download Complete Reel

```
┌──────────────────────────────────────┐
│  ✓ RENDERING COMPLETE!               │
│                                      │
│  Reel: "Breaking News from Dhaka"   │
│  Size: 45 MB                         │
│  Duration: 20 seconds                │
│                                      │
│  Video Quality: 1080x1920 (9:16)    │
│  Format: MP4 (H.264)                │
│  Ready to upload to:                 │
│  • Instagram Reels                   │
│  • TikTok                            │
│  • Facebook                          │
│  • YouTube Shorts                    │
│                                      │
│  [DOWNLOAD] [SHARE] [BACK]          │
└──────────────────────────────────────┘
```

### 11. Upload to Social Media

**Out of Studio** - Manual upload:

```
INSTAGRAM REELS:
1. Open Instagram Creator Studio
2. Click "Create"
3. Upload downloaded MP4
4. Add captions/hashtags
5. Publish

TIKTOK:
1. Open TikTok Creator Center
2. Upload Video
3. Add sound/music (optional)
4. Add text/effects
5. Publish

FACEBOOK:
1. Open Pages > Your Page
2. Click Video
3. Upload MP4
4. Add description
5. Publish

YOUTUBE SHORTS:
1. Go to YouTube.com
2. Create → Upload Video
3. Upload MP4
4. Configure as Short
5. Publish
```

## Complete Workflow Timeline

```
Event                          Time       Action
─────────────────────────────────────────────────────
1. Admin opens article         00:00      Click "Create Reel"
2. Studio loads               00:03      ← Load time
3. Article imported           00:05      Firebase fetch
4. Add 3 images               02:00      Management UI
5. Edit headline/subtitle     01:00      Text editing
6. Select music               00:30      Music selection
7. Choose template            00:30      Live preview
8. Adjust duration            00:30      Slider adjustment
9. Save draft (optional)      00:10      Firestore save
10. Click "Render"            00:02      Queue job
11. Wait for rendering        03:00      Server rendering
12. Download video            00:10      File download
13. Upload to Instagram       02:00      Social platform
                             ─────────
TOTAL TIME: ~12-15 minutes for one reel from article to publication
```

## Expert Tips

### For Best Results:

1. **Image Selection**
   - Use high-quality images (1920x1080+ preferred)
   - Include diverse visual elements
   - Vary image durations (3-5 seconds typical)
   - Use different animation types for visual interest

2. **Text Content**
   - Keep headlines short (5-10 words)
   - Use Bangla text for local audience impact
   - Subtitles should supplement, not duplicate, headline
   - Consider line breaks for readability

3. **Music Selection**
   - Match music to story tone
   - Test volume levels
   - Ensure music complements pace
   - Avoid music that overwhelms dialogue/narrator (if present)

4. **Template Choice**
   - Breaking News: Time-sensitive stories
   - International: Global or formal stories
   - Minimal Dark: In-depth, thoughtful pieces
   - Red Alert: Emergency or urgent news

5. **Duration Optimization**
   - 7-12 seconds: Quick headline snippet
   - 12-20 seconds: Standard reel (recommended)
   - 20-30 seconds: In-depth feature story

## Quality Checklist Before Publishing

- [ ] Preview shows all images clearly
- [ ] Text is readable and positioned well
- [ ] Transitions between images are smooth
- [ ] Music volume is appropriate
- [ ] Total duration is correct
- [ ] Template matches story tone
- [ ] No spelling or grammar errors
- [ ] Video renders without errors
- [ ] Downloaded file plays correctly
- [ ] Ready for social media platforms

---

**Next**: See SETUP_GUIDE.md for system setup, or README.md for technical documentation.
