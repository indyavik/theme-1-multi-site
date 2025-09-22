import { unstable_noStore as noStore } from "next/cache";
import { PreviewProvider, PreviewToolbar } from "@/lib/preview-context";
import { siteSchema } from "@/lib/site-schema";
import { getSiteContext, resolveSiteIdFromParam } from "@/lib/site-loader";
import ServiceDetail from "@/components/pages/services/ServiceDetail";

export default async function ServiceDetailPage({ params, searchParams }: { params: { slug: string }, searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);

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
        <PreviewToolbar />
        <ServiceDetail serviceSlug={params.slug} />
      </div>
    </PreviewProvider>
  );
}
