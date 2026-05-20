import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL to prevent SSRF attacks
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
      // Only allow http and https protocols
      if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
        return NextResponse.json(
          { success: false, error: 'Invalid protocol' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Fetch the image from the remote server
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Segun-Bangla-Studio/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[proxy] Failed to fetch image: ${url} - ${response.status}`);
      return NextResponse.json(
        { success: false, error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the image data as an ArrayBuffer
    const imageData = await response.arrayBuffer();

    // Determine content type from response headers or fallback
    const contentType = response.headers.get('content-type') || 'image/webp';

    // Return the image with proper CORS headers
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  } catch (error) {
    console.error('[proxy] Error proxying image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}
