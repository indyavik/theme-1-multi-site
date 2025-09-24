import { unstable_noStore as noStore } from "next/cache";
import AboutUsContent from "@/theme/components/pages/AboutUsContent";
import { getSiteContext, resolveSiteIdFromParam } from "@/theme/lib/site-loader";

export default async function AboutUsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);
  return <AboutUsContent initialData={data} />;
}
