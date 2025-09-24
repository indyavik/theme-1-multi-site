import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache";
import { fetchSeoData, buildMetadataFromSeo, getJsonLdScript } from "@/theme/lib/seo"
import BlogIndexContent from "@/theme/components/pages/BlogIndexContent";
import { getSiteContext, resolveSiteIdFromParam } from "@/theme/lib/site-loader";

export default async function BlogPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);
  const seo = await fetchSeoData('blog-index', { siteSlug: (data as any)?.site?.slug })
  const jsonLd = getJsonLdScript(seo)
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <BlogIndexContent initialData={data} />
    </>
  );
}

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)
  const brand = (data as any)?.site?.brand || 'Website'
  const seo = await fetchSeoData('blog-index', { siteSlug: (data as any)?.site?.slug })
  return buildMetadataFromSeo(seo, brand)
}
