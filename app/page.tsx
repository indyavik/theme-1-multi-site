/**
 * app/page.tsx (Server Component)
 *
 * Purpose:
 * - Fetch page SEO on the server (generateMetadata + JSON‑LD) so it never flashes or requires client fetches.
 * - Render the actual themed page via a Client Component (HomeContent) to keep
 *   all preview/editing logic on the client side.
 *
 * How to create a new page from this theme:
 * 1) Add a route file (e.g., app/about-us/page.tsx). Keep it server-only.
 * 2) Add a matching client file (e.g., components/pages/AboutContent.tsx) that wraps
 *    PreviewProvider + SectionsRenderer and maps section types to components.
 * 3) In the route file, implement generateMetadata using lib/seo.ts and render <AboutContent />.
 */
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { fetchSeoData, buildMetadataFromSeo, getJsonLdScript } from "@/lib/seo"
import HomeContent from "@/components/pages/HomeContent"
import { getSiteContext, resolveSiteIdFromParam } from "@/lib/site-loader"


// Client content lives in HomeContent to avoid passing function props from server to client

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)
  const seo = await fetchSeoData('home', { siteSlug: (data as any)?.site?.slug })
  return buildMetadataFromSeo(seo, 'Summit Books & Tax')
}

export default async function HomePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)
  const seo = await fetchSeoData('home', { siteSlug: (data as any)?.site?.slug })
  const jsonLd = getJsonLdScript(seo)

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <HomeContent initialData={data} />
    </>
  )
}
