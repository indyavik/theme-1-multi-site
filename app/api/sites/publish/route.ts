/**
 * Local development publish endpoint (Next.js API route).
 *
 * Purpose:
 * - Receives site data from the in-page preview/toolbar and writes it to
 *   /sites/<siteSlug>/lib/site-data.json for quick local iterations.
 *
 * Scope:
 * - Intended for local/dev only. In production, publishing is handled by a
 *   wrapper app or external backend (hybrid mode), not this route.
 *
 * Invocation:
 * - Used by the legacy publish flow in theme/core/preview-context.tsx via
 *   POST /api/sites/publish when hybrid mode is OFF and the API base points
 *   to this Next.js app.
 *
 * Notes:
 * - To use this route in dev: set USE_HYBRID_PUBLISH = false and configure
 *   getApiUrl('/api/...') to resolve to the Next server (same origin).
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteData, siteSlug, publish } = body;

    console.log('📝 Publish from dev API called with:', {
      siteSlug,
      publish,
      sectionsCount: siteData?.pages?.home?.sections?.length || 0,
      hasSiteData: !!siteData
    });

    if (!siteData || !siteSlug) {
      return NextResponse.json(
        { error: 'Missing siteData or siteSlug' },
        { status: 400 }
      );
    }

    // Write the updated site data to the site's data file
    const siteDataPath = path.join(process.cwd(), 'sites', siteSlug, 'lib', 'site-data.json');
    
    // Ensure the directory exists
    const dir = path.dirname(siteDataPath);
    await fs.mkdir(dir, { recursive: true });

    // Write the new data
    await fs.writeFile(siteDataPath, JSON.stringify(siteData, null, 2), 'utf-8');

    console.log('✅ Successfully published to:', siteDataPath);

    return NextResponse.json({
      success: true,
      message: 'Site data published successfully',
      siteSlug,
      timestamp: new Date().toISOString(),
      sectionsCount: siteData?.pages?.home?.sections?.length || 0
    });

  } catch (error) {
    console.error('❌ Publish API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to publish site data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to publish.' },
    { status: 405 }
  );
}


