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

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Firebase project ID not configured',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Fetch reel from Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reels/${reelId}?key=${apiKey}`;
    
    const response = await fetch(firestoreUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reel not found',
          } as ApiResponse,
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('[v0] Firestore fetch error:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch reel status',
        } as ApiResponse,
        { status: response.status }
      );
    }

    const data = await response.json();
    const fields = data.fields || {};

    const getStringValue = (field: any): string => {
      if (!field) return '';
      return field.stringValue || '';
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          reelId,
          status: getStringValue(fields.status),
          videoUrl: getStringValue(fields.videoUrl) || null,
          error: getStringValue(fields.error) || null,
          updatedAt: getStringValue(fields.updatedAt),
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
