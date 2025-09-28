### LLM Prompt: Create a New Editable Theme

Copy and paste the following prompt into your LLM to generate a new theme following the project’s latest structure and core editing system. The prompt includes exact file paths, rules, and working examples for editable text and images.

```text
You are generating a new editable theme for a Next.js App Router project. Follow this exact structure and integrate with the existing core editing system and dev publish API.

Source of truth (reuse, do not rewrite):
- Core editing system:
  - theme/core/preview-context.tsx  (PreviewProvider, PreviewToolbar, SectionsRenderer)
  - theme/core/editable-text.tsx
  - theme/core/editable-image.tsx
  - theme/core/editable-section.tsx
- Schema:
  - theme/site-schema.ts
- Dev publish API (local only):
  - app/api/sites/publish/route.ts  (POST { siteData, siteSlug, publish: true })

Routing and rendering (do not modify):
- Single catch‑all router at app/[[...segments]]/page.tsx.
- It matches the current pathname against theme/site-schema.ts (pages[*].path), extracts dynamic params, selects a pageType, and renders the corresponding component under theme/components/pages/.
- Some pageTypes (e.g., "service-detail") are rendered inside <PreviewProvider> for editing. Add new pages by updating schema paths and providing a page renderer; do not add per-route files.

Multi‑site architecture:
- Site selection is via ?site=<siteId>. resolveSiteIdFromParam in theme/lib/site-loader.ts validates or falls back to DEFAULT_SITE from theme/lib/site-registry.ts.
- getSiteContext(siteId) loads /sites/<siteId>/lib/site-data.json and returns it with the shared theme/site-schema.ts. All rendering pulls from this per‑site data.
- Images can be site‑scoped under /public/sites/<siteSlug>/ with automatic fallback to shared /public assets (handled by EditableImage).

Deliverables to create for the new theme:
1) Page renderers (place under theme/components/pages/)
   - e.g., HomeContent.tsx, AboutUsContent.tsx, BlogIndexContent.tsx, BlogPostContent.tsx, services/ServiceDetail.tsx
   - Pages that are editable MUST be wrapped with <PreviewProvider> and render sections via <SectionsRenderer>.
2) Section components (place under theme/components/sections/)
   - One file per section type referenced by the schema’s sectionTypes (e.g., hero, about, services, contact, etc.)
   - Each section component must use EditableText / EditableImage and schema-driven paths.
3) Minimal site data for a sample site (JSON or TS object) demonstrating pages.home.sections with at least a hero section.
4) Optional: basic styles via Tailwind classes in components (match the current project’s conventions).

File/dir shape to target (example):
your-theme/
- theme/
  - components/
    - pages/
      - HomeContent.tsx
      - AboutUsContent.tsx
      - BlogIndexContent.tsx
      - BlogPostContent.tsx
      - services/
        - ServiceDetail.tsx
    - sections/
      - hero-section.tsx
      - about-section.tsx
      - services-section.tsx
      - contact-section.tsx
      - testimonials-section.tsx
  - site-schema.ts                 ← reuse existing schema structure and types
  - core/                          ← reuse existing core files (do not change)
    - preview-context.tsx
    - editable-text.tsx
    - editable-image.tsx
    - editable-section.tsx
- app/[[...segments]]/page.tsx     ← reuse existing catch-all router; do not change routing logic
- app/api/sites/publish/route.ts    ← dev publish endpoint already exists; do not change

How sections and pages must work (rules):
1) Use theme/site-schema.ts as the schema source. Respect field types (string, image, array, richtext, select, number, boolean), editable, localized, maxLength, and allowedSectionTypes per page.
2) Store live sections in site data under pages.{pageType}.sections (not root-level), matching how PreviewProvider expects data.
3) Use SectionsRenderer to render and manage sections; it already wraps each section with EditableSection for add/remove/reorder UI in preview mode.
4) All editable fields must be wrapped with EditableText or EditableImage and point to correct paths:
   - Path format: "sections.{sectionId}.{field}" or for arrays "sections.{sectionId}.items.{index}.{field}".
   - For singleton sections (e.g., hero), the sectionId should equal the section type (e.g., "hero").
5) Do not reimplement publish logic. PreviewProvider already builds publish payloads. For local dev, POST to /api/sites/publish with { siteData, siteSlug, publish: true }.

Example: minimal site data (TypeScript)
```ts
export const siteData = {
  site: { brand: "Your Business", slug: "site1", locale: "en" },
  pages: {
    home: {
      sections: [
        {
          id: "hero",
          type: "hero",
          enabled: true,
          region: "main",
          order: 10,
          data: {
            shortHeadline: "Welcome to Your Business",
            subHeadline: "We help you succeed",
            primaryCta: { label: "Get Started", href: "#contact" },
            secondaryCta: { label: "Learn More", href: "#about" },
            heroImage: "/placeholder.jpg"
          }
        }
      ]
    }
  }
}
```

Example: page renderer using PreviewProvider + SectionsRenderer
```tsx
// theme/components/pages/HomeContent.tsx
import { PreviewProvider, SectionsRenderer } from "@/theme/core/preview-context"
import { siteSchema } from "@/theme/site-schema"
import { HeroSection } from "@/theme/components/sections/hero-section"
import { AboutSection } from "@/theme/components/sections/about-section"
import { ServicesSection } from "@/theme/components/sections/services-section"
import { ContactSection } from "@/theme/components/sections/contact-section"

export default function HomeContent({ initialData }: { initialData: any }) {
  return (
    <PreviewProvider
      initialData={initialData}
      schema={siteSchema}
      pageType="home"
      currentLocale="en"
    >
      <SectionsRenderer
        renderSection={(section) => {
          switch (section.type) {
            case "hero":
              return <HeroSection data={section.data} />
            case "about":
              return <AboutSection data={section.data} />
            case "services":
              return <ServicesSection data={section.data} />
            case "contact":
              return <ContactSection data={section.data} />
            default:
              return null
          }
        }}
      />
    </PreviewProvider>
  )
}
```

Example: editable section (hero)
```tsx
// theme/components/sections/hero-section.tsx
import { EditableText } from "@/theme/core/editable-text"
import { EditableImage } from "@/theme/core/editable-image"

export function HeroSection({ data }: {
  data: {
    shortHeadline: string
    subHeadline: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    heroImage: string
  }
}) {
  return (
    <section className="py-16">
      <h1 className="text-4xl font-bold">
        <EditableText path="sections.hero.shortHeadline" value={data.shortHeadline} />
      </h1>
      <p className="mt-2 text-gray-600">
        <EditableText path="sections.hero.subHeadline" value={data.subHeadline} />
      </p>
      <div className="mt-6 flex items-center gap-3">
        <a className="px-4 py-2 rounded bg-blue-600 text-white" href={data.primaryCta.href}>
          <EditableText path="sections.hero.primaryCta.label" value={data.primaryCta.label} />
        </a>
        <a className="px-4 py-2 rounded border" href={data.secondaryCta.href}>
          <EditableText path="sections.hero.secondaryCta.label" value={data.secondaryCta.label} />
        </a>
      </div>
      <div className="mt-8">
        <EditableImage
          path="sections.hero.heroImage"
          src={data.heroImage}
          alt="Hero image"
          width={1200}
          height={600}
          className="rounded-lg"
        />
      </div>
    </section>
  )
}
```

Dev publish (for local only; no code needed here):
- POST /api/sites/publish
- Body: { siteData, siteSlug: "<your-site-slug>", publish: true }
- The core PreviewProvider builds the correct payload; use its Publish button in preview toolbar.

Acceptance criteria:
- Pages that are editable are wrapped in PreviewProvider and render via SectionsRenderer.
- Section components use EditableText / EditableImage with correct schema paths.
- siteData uses pages.{pageType}.sections and aligns with theme/site-schema.ts.
- No modifications to core files or router are required.
- The theme renders with default content and supports live editing, moving, and adding sections in preview mode.
```


