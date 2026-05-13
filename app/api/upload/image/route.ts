import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebaseAdmin';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const reelId = formData.get('reelId') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (!reelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reel ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'File must be an image',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File must be less than 10MB',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();
    const fileName = `${reelId}/${Date.now()}-${file.name}`;
    const file_ref = bucket.file(`reels/images/${fileName}`);

    const buffer = await file.arrayBuffer();

    await file_ref.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    });

    // Get signed URL
    const [signedUrl] = await file_ref.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: signedUrl,
          fileName: file.name,
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error uploading image:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
