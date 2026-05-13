import { NextRequest, NextResponse } from 'next/server';
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

    // Since we're not using Firestore anymore, just return completed status
    return NextResponse.json(
      {
        success: true,
        data: {
          reelId,
          status: 'completed',
          videoUrl: null,
          error: null,
          updatedAt: new Date().toISOString(),
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
