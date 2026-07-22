import { NextRequest, NextResponse } from 'next/server';
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

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Firebase project ID not configured',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Use Firebase REST API to fetch the document
    // This works without Admin SDK credentials
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/articles/${articleId}?key=${apiKey}`;
    
    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Article not found',
          } as ApiResponse,
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('[v0] Firestore REST API error:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch article: ${response.status}`,
        } as ApiResponse,
        { status: response.status }
      );
    }

    const data = await response.json();
    const article = convertFirestoreDocument(data);

    return NextResponse.json(
      { success: true, data: article } as ApiResponse<Article>,
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

/**
 * Converts a Firestore REST API document to our Article type
 */
function convertFirestoreDocument(doc: any): Article {
  const fields = doc.fields || {};
  
  const getStringValue = (field: any): string => {
    if (!field) return '';
    return field.stringValue || field.integerValue?.toString() || '';
  };

  const getNumberValue = (field: any): number => {
    if (!field) return 0;
    if (field.integerValue) return parseInt(field.integerValue, 10);
    if (field.doubleValue) return parseFloat(field.doubleValue);
    return 0;
  };

  const getTimestampValue = (field: any): string => {
    if (!field?.timestampValue) return '';
    return field.timestampValue;
  };

  return {
    id: doc.name?.split('/').pop() || '',
    title: getStringValue(fields.title),
    slug: getStringValue(fields.slug),
    content: getStringValue(fields.content),
    excerpt: getStringValue(fields.excerpt),
    imageUrl: getStringValue(fields.imageUrl),
    imageCaption: getStringValue(fields.imageCaption),
    imageCaptionAlign: getStringValue(fields.imageCaptionAlign),
    imageSize: getStringValue(fields.imageSize),
    imageFocus: getStringValue(fields.imageFocus),
    source: getStringValue(fields.source),
    reporterName: getStringValue(fields.reporterName),
    reporterImage: getStringValue(fields.reporterImage),
    shoulder: getStringValue(fields.shoulder),
    shoulderColor: getStringValue(fields.shoulderColor),
    shoulderTextColor: getStringValue(fields.shoulderTextColor),
    shoulderFontSize: getStringValue(fields.shoulderFontSize),
    bulletPoints: fields.bulletPoints?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
    bulletColor: getStringValue(fields.bulletColor),
    bulletFontSize: getStringValue(fields.bulletFontSize),
    excerptColor: getStringValue(fields.excerptColor),
    categoryId: getStringValue(fields.categoryId),
    categoryIds: fields.categoryIds?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
    subcategoryId: getStringValue(fields.subcategoryId),
    subcategoryIds: fields.subcategoryIds?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
    authorId: getStringValue(fields.authorId),
    status: getStringValue(fields.status),
    isLead: fields.isLead?.booleanValue === true,
    isSpecial: fields.isSpecial?.booleanValue === true,
    isSpecialOrder: getNumberValue(fields.isSpecialOrder),
    isFeatured: fields.isFeatured?.booleanValue === true,
    viewCount: getNumberValue(fields.viewCount),
    publishedAt: getTimestampValue(fields.publishedAt),
    updatedAt: getTimestampValue(fields.updatedAt),
    tags: fields.tags?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
  };
}
