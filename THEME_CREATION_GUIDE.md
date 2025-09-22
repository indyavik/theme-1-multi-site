# Theme Creation Guide (Schema + Data)

A concise guide to build fully editable themes using a schema-driven preview layer. This is the canonical pattern.

## What lives where

- `lib/site-schema.ts`
  - Field rules: type, editable, maxLength
  - Arrays: itemSchema, maxItems
  - Section catalog: `sectionTypes` for the picker (displayName, description, singleton, schemaId, defaultData)
- `lib/site-data.json`
  - The actual content you render
- `lib/preview-context.tsx`
  - PreviewProvider and editing APIs (text edits, array add/remove/move, section add/remove)
- `app/page.tsx`
  - Wraps your page with PreviewProvider and renders sections
- Section components under `components/sections/*`

## File layout (example)

```
your-theme/
├── app/
│   └── page.tsx
├── components/
│   └── sections/
│       ├── hero-section.tsx
│       ├── services-section.tsx
│       └── industries-section.tsx
├── lib/
│   ├── preview-context.tsx
│   ├── site-config.ts        # re-exports siteSchema + siteData
│   ├── site-data.json
│   └── site-schema.ts
└── components/ui/
    ├── editable-text.tsx
    ├── editable-image.tsx
    └── editable-section.tsx
```

## site-schema.ts (authoritative rules)

```ts
export const siteSchema = {
  site: {
    brand: { type: 'string', editable: true, maxLength: 50, description: 'Business name' },
  },
  features: {
    blogEnabled: { type: 'boolean', editable: true, description: 'Enable blog pages' }
  },
  sectionTypes: {
    hero: {
      displayName: 'Hero Section',
      description: 'Main banner with headline and call-to-action',
      singleton: true,
      schemaId: 'hero-main',
      defaultData: {
        shortHeadline: 'Your Business Headline',
        subHeadline: 'Compelling subtitle…',
        primaryCta: { label: 'Get Started', href: '#contact' },
        secondaryCta: { label: 'Learn More', href: '#about' },
        heroImage: '/placeholder.jpg'
      }
    },
    services: {
      displayName: 'Services Section',
      description: 'List of services you offer',
      singleton: true,
      schemaId: 'services',
      defaultData: { title: 'Our Services', items: [{ name: 'Service 1', description: 'Description…', price: '$$', image: '' }] }
    },
    industriesServed: {
      displayName: 'Industries Section',
      description: 'Industries you serve',
      singleton: true,
      schemaId: 'industries-served',
      defaultData: { title: 'Industries We Serve', items: [] }
    }
  },
  sections: {
    'hero-main': {
      shortHeadline: { type: 'string', editable: true, maxLength: 100, description: 'Main headline' },
      subHeadline: { type: 'string', editable: true, maxLength: 200, description: 'Sub headline' },
      primaryCta: { label: { type: 'string', editable: true, maxLength: 30, description: 'CTA text' }, href: { type: 'string', editable: false, maxLength: 100, description: 'CTA href' } },
      secondaryCta: { label: { type: 'string', editable: true, maxLength: 25, description: 'CTA text' }, href: { type: 'string', editable: false, maxLength: 100, description: 'CTA href' } },
      heroImage: { type: 'image', editable: true, maxLength: 200, description: 'Hero image' }
    },
    services: {
      title: { type: 'string', editable: true, maxLength: 100, description: 'Services title' },
      items: {
        type: 'array', editable: true, description: 'Service cards', maxItems: 4,
        itemSchema: {
          name: { type: 'string', editable: true, maxLength: 50, description: 'Service name' },
          description: { type: 'string', editable: true, maxLength: 200, description: 'Service description' },
          price: { type: 'string', editable: true, maxLength: 20, description: 'Service price' },
          image: { type: 'image', editable: true, maxLength: 200, description: 'Service image' }
        }
      }
    },
    'industries-served': {
      title: { type: 'string', editable: true, maxLength: 100, description: 'Industries title' },
      items: { type: 'array', editable: true, description: 'Industries', maxItems: 6, itemSchema: { type: 'string', editable: true, maxLength: 50, description: 'Industry name' } }
    }
  }
} as const;
```

## site-data.json (content)

```json
{
  "site": { "brand": "Your Brand" },
  "features": { "blogEnabled": true },
  "sections": [
    { "id": "hero-main", "type": "hero", "enabled": true, "order": 10, "data": { "shortHeadline": "…", "subHeadline": "…", "primaryCta": { "label": "Get Started", "href": "#contact" }, "secondaryCta": { "label": "Learn More", "href": "#about" }, "heroImage": "/placeholder.jpg" } },
    { "id": "services", "type": "services", "enabled": true, "order": 30, "data": { "title": "Our Services", "items": [ { "name": "Monthly Bookkeeping", "description": "…", "price": "$$", "image": "" } ] } },
    { "id": "industries-served", "type": "industriesServed", "enabled": true, "order": 40, "data": { "title": "Industries We Serve", "items": [ "Retail & E‑commerce" ] } }
  ]
}
```

## Wiring it up (app/page.tsx)

```ts
"use client";
import { siteData, siteSchema } from "@/lib/site-config";
import { PreviewProvider } from "@/lib/preview-context";

export default function Page() {
  return (
    <PreviewProvider initialData={siteData} schema={siteSchema} siteSlug="your-theme">
      {/* Render sections wrapped with EditableSection; fields with EditableText/EditableImage */}
    </PreviewProvider>
  );
}
```

## Editable components

- `EditableText({ path, value, className })` — schema-aware editability
- `EditableImage({ path, src, alt })`
- `EditableSection({ sectionId, sectionType, path, children })` — hover controls for add/remove
- `EditableList({ path, items, className, renderItem })` — array editor with Add/Remove/Move; place your grid classes on `EditableList.className` so children are direct grid items

Paths:
- Site fields: `site.brand`
- Section fields: `sections.hero-main.shortHeadline`
- Arrays: `sections.services.items` and `sections.services.items.0.price`

## Array behavior

- `addArrayItem(path)` — creates a new item from `itemSchema`, with friendly placeholders:
  - `name` → "Placeholder Name"; `title` → "Placeholder Title"; `price` → "$$"; `description` → "Placeholder description…"; sensible defaults for email/phone/address/date/label/href
- `removeArrayItem(path, index)` — removes exactly that item
- `moveArrayItem(path, from, to)` — reorders within the array
- `maxItems` — enforced automatically; Add is disabled at the limit

## Section picker (schema-driven)

- Fully driven by `siteSchema.sectionTypes`
  - `displayName`, `description`, `singleton`, `schemaId`, `defaultData`
- New sections get `defaultData` from the registry; if omitted, PreviewProvider generates minimal defaults from field rules

## Publishing

- `publishChanges()` is a stub — wire it to your backend to persist `editedData`
- Autosave to `localStorage` is built-in

## Checklist

- [ ] Define your sections in `site-schema.ts` under both `sectionTypes` and `sections`
- [ ] Set `editable: true` on fields you want editable
- [ ] Set `maxItems` on arrays you want capped
- [ ] Put your content in `site-data.json`
- [ ] Wrap your page with PreviewProvider
- [ ] Use `EditableSection`, `EditableText`, `EditableImage`, and `EditableList`
- [ ] Keep grid classes on `EditableList` for correct layout

That’s it — copy this structure, adjust schema and data, and you have an immediately editable theme with section and list management.
