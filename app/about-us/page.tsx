import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { fetchSeoData, buildMetadataFromSeo, getJsonLdScript } from "@/theme/lib/seo"
import AboutUsContent from "@/theme/components/pages/AboutUsContent";
import { getSiteContext, resolveSiteIdFromParam } from "@/theme/lib/site-loader";

export default async function AboutUsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);
  // Check if the about-us page exists in site data (strict in public mode, lenient in preview mode)
  const isPreviewMode = searchParams?.preview === 'true';
  if (!isPreviewMode && !data.pages?.['about-us']) {
    notFound();
  }
  const seo = await fetchSeoData('about-us', { siteSlug: (data as any)?.site?.slug })
  const jsonLd = getJsonLdScript(seo)
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <AboutUsContent initialData={data} />
    </>
  );
}

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)
  const brand = (data as any)?.site?.brand || 'Website'
  const seo = await fetchSeoData('about-us', { siteSlug: (data as any)?.site?.slug })
  return buildMetadataFromSeo(seo, brand)
}
