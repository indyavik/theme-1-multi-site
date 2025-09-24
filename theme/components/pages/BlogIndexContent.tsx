"use client";
import { siteSchema } from "@/theme/site-schema";
import { PreviewProvider, PreviewToolbar, SectionsRenderer } from "@/theme/core/preview-context";
import { BlogListSection } from "@/theme/components/sections/blog-list-section";

const sectionComponents = {
  blogList: BlogListSection,
} as const;

export default function BlogIndexContent({ initialData }: { initialData: any }) {
  return (
    <PreviewProvider
      initialData={initialData}
      schema={siteSchema}
      pageType="blog-index"
      currentLocale="en"
    >
      <SectionsRenderer
        className="min-h-screen bg-white"
        renderSection={(section) => {
          const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];
          if (!SectionComponent) return null;
          return <SectionComponent data={section.data} />;
        }}
      >
        <PreviewToolbar />
      </SectionsRenderer>
    </PreviewProvider>
  );
}


