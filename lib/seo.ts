import type { Metadata } from 'next'
import { getApiUrl } from '@/lib/theme-config'

export type SeoResponse = {
  title: string
  metaDescription: string
  ogImage?: string
  jsonLd?: Record<string, any>
}

type FetchSeoOptions = {
  siteSlug?: string
  contextSlug?: string
}

// Fetch SEO data for a page from the backend at runtime.
// Always no-store to reflect latest values in production without rebuilds.
export async function fetchSeoData(page: string, opts: FetchSeoOptions = {}): Promise<SeoResponse | null> {
  try {
    const slug = opts.siteSlug
    if (!slug) return null
    const params = new URLSearchParams({ siteSlug: slug, page })
    if (opts.contextSlug) params.set('contextSlug', opts.contextSlug)
    const url = getApiUrl(`/api/sites/seo-data?${params.toString()}`)
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as SeoResponse
  } catch {
    return null
  }
}

// Build Next.js Metadata from SEO payload with sensible fallbacks and title template.
export function buildMetadataFromSeo(seo: SeoResponse | null | undefined, fallbackTitle: string): Metadata {
  const title = seo?.title || fallbackTitle
  const description = seo?.metaDescription || ''
  const ogImage = seo?.ogImage
  const metadata: Metadata = {
    title: { default: title, template: `%s | ${fallbackTitle}` },
    description,
  }
  if (ogImage) {
    metadata.openGraph = { images: [{ url: ogImage }] }
    metadata.twitter = { card: 'summary_large_image', images: [ogImage] }
  }
  return metadata
}

// Return a stringified JSON-LD script if present, or undefined.
export function getJsonLdScript(seo?: SeoResponse | null): string | undefined {
  if (!seo?.jsonLd) return undefined
  try {
    return JSON.stringify(seo.jsonLd)
  } catch {
    return undefined
  }
}


