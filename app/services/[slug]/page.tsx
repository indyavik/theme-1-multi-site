import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache";
import { fetchSeoData, buildMetadataFromSeo, getJsonLdScript } from "@/theme/lib/seo"
import { PreviewProvider, PreviewToolbar } from "@/theme/core/preview-context";
import { siteSchema } from "@/theme/site-schema";
import { getSiteContext, resolveSiteIdFromParam } from "@/theme/lib/site-loader";
import ServiceDetail from "@/theme/components/pages/services/ServiceDetail";

export default async function ServiceDetailPage({ params, searchParams }: { params: { slug: string }, searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);
  const seo = await fetchSeoData('service-detail', { siteSlug: (data as any)?.site?.slug, contextSlug: params.slug })
  const jsonLd = getJsonLdScript(seo)

  // Note: service slug validation can be added server-side if desired
  return (
    <PreviewProvider 
      initialData={data} 
      schema={siteSchema} 
      pageType="service-detail"
      currentLocale="en"
      contextSlug={params.slug}
    >
      <div className="min-h-screen bg-white">
        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        )}
        <PreviewToolbar />
        <ServiceDetail serviceSlug={params.slug} />
      </div>
    </PreviewProvider>
  );
}

export async function generateMetadata({ params, searchParams }: { params: { slug: string }, searchParams: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  noStore()
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined
  const siteId = resolveSiteIdFromParam(siteParam)
  const { data } = await getSiteContext(siteId)
  const brand = (data as any)?.site?.brand || 'Website'
  const seo = await fetchSeoData('service-detail', { siteSlug: (data as any)?.site?.slug, contextSlug: params.slug })
  return buildMetadataFromSeo(seo, brand)
}
