"use client";
/**
 * HomeContent (Client Component)
 *
 * Why this file exists:
 * - app/page.tsx is a Server Component so it can run generateMetadata and do server-only SEO fetches.
 * - PreviewProvider, SectionsRenderer and the section mapping (renderSection/filterSections)
 *   are client-side (they use hooks and pass functions). Passing functions from a Server
 *   Component to a Client Component causes Next.js errors.
 * - This file isolates all client-only logic. app/page.tsx simply renders <HomeContent />
 *   and injects SEO (title/meta/JSON‑LD) on the server.
 *
 * Pattern to follow for other pages:
 * - Keep the route file (e.g., app/about-us/page.tsx) server-only for SEO.
 * - Create a matching Client Component (e.g., components/pages/AboutContent.tsx)
 *   that contains PreviewProvider + SectionsRenderer and section mapping.
 */
import { siteSchema } from "@/theme/site-schema"
import { PreviewProvider, PreviewToolbar, SectionsRenderer } from "@/theme/core/preview-context"
import { HeroSection } from "@/theme/components/sections/hero-section"
import { AboutSection } from "@/theme/components/sections/about-section"
import { ServicesSection } from "@/theme/components/sections/services-section"
import { IndustriesSection } from "@/theme/components/sections/industries-section"
import { TestimonialsSection } from "@/theme/components/sections/testimonials-section"
import { WhyChooseUsSection } from "@/theme/components/sections/why-choose-us-section"
import { ContactSection } from "@/theme/components/sections/contact-section"
import { BlogTeaserSection } from "@/theme/components/sections/blog-teaser-section"
import { FooterSection } from "@/theme/components/sections/footer-section"
import { TeamSection } from "@/theme/components/sections/team-section"

const sectionComponents = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  industriesServed: IndustriesSection,
  testimonials: TestimonialsSection,
  whyChooseUs: WhyChooseUsSection,
  team: TeamSection,
  contact: ContactSection,
  blogTeaser: BlogTeaserSection,
  footer: FooterSection,
} as const

export default function HomeContent({ initialData }: { initialData: any }) {
  return (
    <PreviewProvider 
      initialData={initialData} 
      schema={siteSchema} 
      siteSlug={initialData?.site?.slug}
      pageType="home"
      currentLocale="en"
    >
      <SectionsRenderer
        className="min-h-screen bg-background"
        filterSections={(sections) => 
          sections.filter((section) => initialData.features.blogEnabled || section.type !== "blogTeaser")
        }
        renderSection={(section) => {
          const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];
          if (!SectionComponent) return null;
          return <SectionComponent data={section.data as any} />;
        }}
      >
        <PreviewToolbar />
      </SectionsRenderer>
    </PreviewProvider>
  )
}


