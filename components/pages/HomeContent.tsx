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
import { siteSchema } from "@/lib/site-schema"
import { SITE_SLUG } from "@/lib/theme-config"
import { PreviewProvider, PreviewToolbar, SectionsRenderer } from "@/lib/preview-context"
import { HeroSection } from "@/components/sections/hero-section"
import { AboutSection } from "@/components/sections/about-section"
import { ServicesSection } from "@/components/sections/services-section"
import { IndustriesSection } from "@/components/sections/industries-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section"
import { ContactSection } from "@/components/sections/contact-section"
import { BlogTeaserSection } from "@/components/sections/blog-teaser-section"
import { FooterSection } from "@/components/sections/footer-section"
import { TeamSection } from "@/components/sections/team-section"

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
      siteSlug={SITE_SLUG}
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


