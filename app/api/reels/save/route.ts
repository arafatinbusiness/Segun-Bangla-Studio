import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { ReelConfig, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const config = (await request.json()) as ReelConfig;

    // Validate required fields
    if (!config.reelId || !config.articleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: reelId, articleId',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Update reel in Firestore
    await adminDb.collection('reels').doc(config.reelId).set(
      {
        ...config,
        updatedAt: new Date().toISOString(),
      },
      { merge: true } // Merge with existing data
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          reelId: config.reelId,
          status: 'saved',
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error saving reel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save reel',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
