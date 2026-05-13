import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebaseAdmin';
import { renderQueue } from '@/lib/renderQueue';
import { ReelConfig, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const config = await request.json();

    // Validate required fields
    if (!config.articleId || !config.template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: articleId, template',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Generate reel ID
    const reelId = uuidv4();

    // Create reel record in Firestore
    const reelData: ReelConfig = {
      reelId,
      articleId: config.articleId,
      title: config.title || config.headlineText || 'Untitled',
      template: config.template,
      duration: config.duration || 20,
      musicId: config.musicId || '',
      musicVolume: config.musicVolume || 1,
      images: config.images || [],
      headlineText: config.headlineText || '',
      subtitleText: config.subtitleText || '',
      status: 'draft',
      metadata: {
        fps: 30,
        width: 1080,
        height: 1920,
        format: 'mp4',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: config.userId || 'anonymous',
    };

    // Save reel to Firestore
    await adminDb.collection('reels').doc(reelId).set(reelData);

    // Add to render queue
    await renderQueue.enqueue(reelId, config);

    return NextResponse.json(
      {
        success: true,
        data: {
          reelId,
          status: 'pending',
        },
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error starting render:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start render job',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
