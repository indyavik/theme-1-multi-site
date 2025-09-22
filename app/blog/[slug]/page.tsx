import { unstable_noStore as noStore } from "next/cache";
import BlogPostContent from "@/components/pages/BlogPostContent";
import { getSiteContext, resolveSiteIdFromParam } from "@/lib/site-loader";

export default async function BlogDetailPage({ params, searchParams }: { params: { slug: string }, searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  const siteParam = typeof searchParams?.site === 'string' ? searchParams.site : Array.isArray(searchParams?.site) ? searchParams.site[0] : undefined;
  const siteId = resolveSiteIdFromParam(siteParam);
  const { data } = await getSiteContext(siteId);
  return <BlogPostContent initialData={data} slug={params.slug} />;
}
