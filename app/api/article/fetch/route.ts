import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Article, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get article ID from query parameters
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Fetch article from Firestore
    const docRef = adminDb.collection('articles').doc(articleId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Extract article data
    const articleData = doc.data() as Omit<Article, 'id'>;
    const article: Article = {
      id: doc.id,
      ...articleData,
    };

    return NextResponse.json(
      {
        success: true,
        data: article,
      } as ApiResponse<Article>,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error fetching article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
