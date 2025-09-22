// Deprecated: per-site assets are now served directly from the root public folder under
// /public/sites/<siteSlug>/*. This route is kept as a placeholder to avoid 404s if linked
// elsewhere but returns 404 for any request.
import { NextResponse } from 'next/server'
export async function GET() {
  return new NextResponse('Not Found', { status: 404 })
}

