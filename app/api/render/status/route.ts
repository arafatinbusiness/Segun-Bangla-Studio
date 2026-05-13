import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get reel ID from query parameters
    const { searchParams } = new URL(request.url);
    const reelId = searchParams.get('reelId');

    if (!reelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reel ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Fetch reel from Firestore
    const docRef = adminDb.collection('reels').doc(reelId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reel not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const reel = doc.data();

    return NextResponse.json(
      {
        success: true,
        data: {
          reelId,
          status: reel.status,
          videoUrl: reel.videoUrl || null,
          error: reel.error || null,
          updatedAt: reel.updatedAt,
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error checking render status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check render status',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
