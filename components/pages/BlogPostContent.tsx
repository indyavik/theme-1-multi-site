"use client";
import { siteSchema } from "@/lib/site-schema";
import { PreviewProvider, PreviewToolbar, SectionsRenderer } from "@/lib/preview-context";
import { BlogArticleSection } from "@/components/sections/blog-article-section";

const sectionComponents = {
  blogArticle: BlogArticleSection,
} as const;

export default function BlogPostContent({ initialData, slug }: { initialData: any; slug: string }) {
  return (
    <PreviewProvider
      initialData={initialData}
      schema={siteSchema}
      pageType="blog-post"
      currentLocale="en"
      contextSlug={slug}
    >
      <SectionsRenderer
        className="min-h-screen bg-white"
        renderSection={(section) => {
          const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];
          if (!SectionComponent) return null;
          return <SectionComponent data={section.data} postSlug={slug} />;
        }}
      >
        <PreviewToolbar />
      </SectionsRenderer>
    </PreviewProvider>
  );
}


