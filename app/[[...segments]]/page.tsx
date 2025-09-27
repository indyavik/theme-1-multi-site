/**
 * Catch‑All Router (App Router)
 *
 * What this does
 * - Handles ALL public routes in one place (e.g., '/', '/about-us', '/blog', '/blog/[slug]', '/services/[slug]').
 * - Matches the incoming pathname against page path patterns defined in theme/site-schema.ts (siteSchema.pages[*].path).
 * - Extracts dynamic params (e.g., slug) from the pattern and dispatches to the appropriate theme page component.
 * - Preserves multi‑site support via ?site=<siteId> (same as before) using theme/lib/site-loader.
 * - Fetches SEO on the server (generateMetadata) and injects JSON‑LD into the page.
 *
 * Key imports and their roles
 * - siteSchema (theme/site-schema): source of truth for page types and their path patterns used for routing.
 * - getSiteContext, resolveSiteIdFromParam (theme/lib/site-loader): loads /sites/<siteId>/lib/site-data.json and schema.
 * - fetchSeoData, buildMetadataFromSeo, getJsonLdScript (theme/lib/seo): server-side SEO data + metadata building.
 * - Page components (theme/components/pages/...): actual themed UI rendered per pageType.
 * - PreviewProvider/PreviewToolbar (theme/core/preview-context): used for pages that need editing context (e.g., services).
 *
 * Extensibility
 * - To add a new page route (e.g., '/hello/me'), add an entry under siteSchema.pages with a 'path' string.
 * - Provide or reuse a page renderer under theme/components/pages/... and map it in the switch below.
 * - No new route files are needed—routing is driven by the schema paths.
 */
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { notFound } from "next/navigation"

import { siteSchema } from "@/theme/site-schema"
import { getSiteContext, resolveSiteIdFromParam } from "@/theme/lib/site-loader"
import { fetchSeoData, buildMetadataFromSeo, getJsonLdScript } from "@/theme/lib/seo"

import HomeContent from "@/theme/components/pages/HomeContent"
import AboutUsContent from "@/theme/components/pages/AboutUsContent"
import BlogIndexContent from "@/theme/components/pages/BlogIndexContent"
import BlogPostContent from "@/theme/components/pages/BlogPostContent"
import ServiceDetail from "@/theme/components/pages/services/ServiceDetail"
import { PreviewProvider, PreviewToolbar } from "@/theme/core/preview-context"

type Params = { segments?: string[] }

function compilePathPattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const clean = pattern.startsWith("/") ? pattern : `/${pattern}`
  const parts = clean.split("/").filter(Boolean)
  const paramNames: string[] = []
  const regexParts = parts.map((seg) => {
    const m = seg.match(/^\[(.+)\]$/)
    if (m) {
      paramNames.push(m[1])
      return "([^/]+)"
    }
    // escape regex special chars
    return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  })
  const source = regexParts.length === 0 ? "^/$" : `^/${regexParts.join("/")}$`
  return { regex: new RegExp(source), paramNames }
}

function matchPageFromSchema(pathname: string): { pageType: string; params: Record<string, string> } | null {
  const pages = (siteSchema as any).pages as Record<string, any>
  for (const [pageType, config] of Object.entries(pages)) {
    const p = (config as any).path as string | undefined
    if (!p) continue
    const { regex, paramNames } = compilePathPattern(p)
    const m = pathname.match(regex)
    if (m) {
      const params: Record<string, string> = {}
      paramNames.forEach((name, idx) => {
        params[name] = m[idx + 1]
      })
      return { pageType, params }
    }
  }
  return null
}

function pathFromSegments(segments?: string[]): string {
  if (!segments || segments.length === 0) return "/"
  return `/${segments.join("/")}`
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)

  const pathname = pathFromSegments(params.segments)
  const match = matchPageFromSchema(pathname)
  if (!match) return buildMetadataFromSeo(null, (data as any)?.site?.brand || 'Website')

  const contextSlug = match.params?.slug
  const seo = await fetchSeoData(match.pageType, { siteSlug: (data as any)?.site?.slug, contextSlug })
  const brand = (data as any)?.site?.brand || 'Website'
  return buildMetadataFromSeo(seo, brand)
}

export default async function CatchAllPage({ params, searchParams }: { params: Params; searchParams?: Record<string, string | string[] | undefined> }) {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)

  const pathname = pathFromSegments(params.segments)
  const match = matchPageFromSchema(pathname)
  if (!match) notFound()

  const contextSlug = match.params?.slug
  const seo = await fetchSeoData(match.pageType, { siteSlug: (data as any)?.site?.slug, contextSlug })
  const jsonLd = getJsonLdScript(seo)

  switch (match.pageType) {
    case 'home':
      return (
        <>
          {jsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
          )}
          <HomeContent initialData={data} />
        </>
      )
    case 'about-us':
      return (
        <>
          {jsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
          )}
          <AboutUsContent initialData={data} />
        </>
      )
    case 'blog-index':
      return (
        <>
          {jsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
          )}
          <BlogIndexContent initialData={data} />
        </>
      )
    case 'blog-post': {
      const slug = contextSlug || ''
      return (
        <>
          {jsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
          )}
          <BlogPostContent initialData={data} slug={slug} />
        </>
      )
    }
    case 'service-detail': {
      const slug = contextSlug || ''
      return (
        <PreviewProvider 
          initialData={data}
          schema={siteSchema}
          pageType="service-detail"
          currentLocale="en"
          contextSlug={slug}
        >
          <div className="min-h-screen bg-white">
            <PreviewToolbar />
            <ServiceDetail serviceSlug={slug} />
          </div>
        </PreviewProvider>
      )
    }
    default:
      notFound()
  }
}


