import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache";
import { fetchSeoData, buildMetadataFromSeo, getJsonLdScript } from "@/theme/lib/seo"
import BlogPostContent from "@/theme/components/pages/BlogPostContent";
import { getSiteContext, resolveSiteIdFromParam } from "@/theme/lib/site-loader";

export default async function BlogDetailPage({ params, searchParams }: { params: { slug: string }, searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);
  const seo = await fetchSeoData('blog-post', { siteSlug: (data as any)?.site?.slug, contextSlug: params.slug })
  const jsonLd = getJsonLdScript(seo)
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <BlogPostContent initialData={data} slug={params.slug} />
    </>
  );
}

export async function generateMetadata({ params, searchParams }: { params: { slug: string }, searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)
  const brand = (data as any)?.site?.brand || 'Website'
  const seo = await fetchSeoData('blog-post', { siteSlug: (data as any)?.site?.slug, contextSlug: params.slug })
  return buildMetadataFromSeo(seo, brand)
}
