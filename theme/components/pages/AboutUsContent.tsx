"use client";
import { siteSchema } from "@/theme/site-schema";
import { PreviewProvider, PreviewToolbar, SectionsRenderer } from "@/theme/core/preview-context";
import { AboutUsHeroSection } from "@/theme/components/sections/about-us-hero-section";

const sectionComponents = {
  aboutUsHero: AboutUsHeroSection,
} as const;

export default function AboutUsContent({ initialData }: { initialData: any }) {
  return (
    <PreviewProvider 
      initialData={initialData} 
      schema={siteSchema} 
      pageType="about-us"
      currentLocale="en"
    >
      <SectionsRenderer
        className="min-h-screen bg-background"
        renderSection={(section) => {
          const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];
          if (!SectionComponent) return null;
          return <SectionComponent data={section.data as any} />;
        }}
      >
        <PreviewToolbar />
      </SectionsRenderer>
    </PreviewProvider>
  );
}


