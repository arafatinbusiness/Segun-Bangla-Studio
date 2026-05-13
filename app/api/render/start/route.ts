import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, ReelConfig } from '@/lib/types';

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

    // Generate reel ID
    const reelId = uuidv4();

    // Create reel record
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
      status: 'pending',
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

    // Save reel to Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reels/${reelId}?key=${apiKey}`;
    
    const saveResponse = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          reelId: { stringValue: reelData.reelId },
          articleId: { stringValue: reelData.articleId },
          title: { stringValue: reelData.title },
          template: { stringValue: reelData.template },
          duration: { integerValue: reelData.duration.toString() },
          musicId: { stringValue: reelData.musicId },
          musicVolume: { doubleValue: reelData.musicVolume },
          headlineText: { stringValue: reelData.headlineText },
          subtitleText: { stringValue: reelData.subtitleText || '' },
          status: { stringValue: reelData.status },
          createdAt: { stringValue: reelData.createdAt },
          updatedAt: { stringValue: reelData.updatedAt },
          createdBy: { stringValue: reelData.createdBy },
        },
      }),
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      console.error('[v0] Firestore save error:', saveResponse.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save reel to Firestore',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Simulate render processing (in production, this would use Remotion)
    setTimeout(async () => {
      try {
        // Update status to rendering
        await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reels/${reelId}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt&key=${apiKey}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                status: { stringValue: 'rendering' },
                updatedAt: { stringValue: new Date().toISOString() },
              },
            }),
          }
        );

        // Simulate render time (5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Update status to completed
        await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reels/${reelId}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=completedAt&key=${apiKey}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                status: { stringValue: 'completed' },
                updatedAt: { stringValue: new Date().toISOString() },
                completedAt: { stringValue: new Date().toISOString() },
              },
            }),
          }
        );
      } catch (err) {
        console.error('[v0] Render processing error:', err);
        // Update status to failed
        try {
          await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reels/${reelId}?updateMask.fieldPaths=status&updateMask.fieldPaths=error&updateMask.fieldPaths=updatedAt&key=${apiKey}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fields: {
                  status: { stringValue: 'failed' },
                  error: { stringValue: 'Render processing failed' },
                  updatedAt: { stringValue: new Date().toISOString() },
                },
              }),
            }
          );
        } catch (updateErr) {
          console.error('[v0] Failed to update render status:', updateErr);
        }
      }
    }, 1000);

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
