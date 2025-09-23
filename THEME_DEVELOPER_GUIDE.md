# 🎨 Theme Developer Guide

A comprehensive guide for creating and maintaining themes in our multi-site Next.js application.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Creating a New Theme](#creating-a-new-theme)
- [Schema Definition](#schema-definition)
- [Component Development](#component-development)
- [Data Structure](#data-structure)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Troubleshooting](#troubleshooting)

## 🏗️ Overview

Our theme system consists of three main parts:
1. **Schema** (`lib/site-schema.ts`) - Defines section types, fields, and validation
2. **Components** (`components/sections/`) - React components that render sections
3. **Data** (`sites/{siteId}/lib/site-data.json`) - Actual content for each site

## 🔧 Architecture

### Data Flow
```
Schema Definition → Component Development → Site Data → Rendered Page
     ↓                      ↓                  ↓            ↓
   Fields &             EditableText        Actual       User sees
  Validation            components         content        content
```

### Key Principles
- **Schema-First**: Always define the schema before building components
- **Consistent Naming**: Use camelCase for all IDs and types
- **Editable Everything**: Wrap all user content in `EditableText` components
- **Type Safety**: Use TypeScript interfaces that match your schema

## 🆕 Creating a New Theme

### Step 1: Define Section Schema

Add your section to `lib/site-schema.ts`:

```typescript
sectionTypes: {
  // Your new section
  myNewSection: {
    displayName: 'My New Section',
    description: 'Description of what this section does',
    singleton: true,                    // ← Key: Only one per page
    region: 'main',
    allowedRegions: ['main'],
    schema: {
      title: { 
        type: "string", 
        editable: true, 
        localized: true, 
        maxLength: 100, 
        description: "Section title" 
      },
      subtitle: { 
        type: "string", 
        editable: true, 
        localized: true, 
        maxLength: 200, 
        description: "Section subtitle" 
      },
      items: {
        type: "array",
        editable: true,
        description: "List of items",
        maxItems: 6,                    // ← Optional: Limit array size
        itemSchema: {
          name: { 
            type: "string", 
            editable: true, 
            localized: true, 
            maxLength: 50, 
            description: "Item name" 
          },
          description: { 
            type: "string", 
            editable: true, 
            localized: true, 
            maxLength: 200, 
            description: "Item description" 
          }
        }
      }
    },
    defaultData: {
      title: 'Default Title',
      subtitle: 'Default subtitle text',
      items: [
        { name: 'Item 1', description: 'Description 1' },
        { name: 'Item 2', description: 'Description 2' }
      ]
    }
  }
}
```

### Step 2: Add to Page Allowed Sections

```typescript
pages: {
  home: {
    allowedSectionTypes: [
      "hero", "about", "services", 
      "myNewSection"              // ← Add your section here
    ]
  }
}
```

### Step 3: Create the Component

Create `components/sections/my-new-section.tsx`:

```tsx
import { EditableText, EditableList } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"

interface MyNewSectionProps {
  data: {
    title: string
    subtitle: string
    items: Array<{
      name: string
      description: string
    }>
  }
}

export function MyNewSection({ data }: MyNewSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          {/* ✅ CRITICAL: Use camelCase paths matching schema */}
          <EditableText
            path="sections.myNewSection.title"
            value={data.title}
            className="font-bold text-3xl text-slate-900 mb-4 block"
          />
          <EditableText
            path="sections.myNewSection.subtitle"
            value={data.subtitle}
            className="text-lg text-slate-600 block"
          />
        </div>

        {/* ✅ Use EditableList for arrays */}
        <EditableList
          className="grid md:grid-cols-2 gap-6"
          path="sections.myNewSection.items"
          items={data.items}
          renderItem={(item, index) => (
            <div className="p-4 bg-slate-50 rounded-lg">
              <EditableText
                path={`sections.myNewSection.items.${index}.name`}
                value={item.name}
                className="font-semibold text-slate-900 mb-2 block"
              />
              <EditableText
                path={`sections.myNewSection.items.${index}.description`}
                value={item.description}
                className="text-slate-600 block"
              />
            </div>
          )}
        />
      </div>
    </section>
  )
}
```

### Step 4: Register Component

Add to your sections index file or import in the page:

```tsx
// Import your component
import { MyNewSection } from '@/components/sections/my-new-section'

// Add to section renderer
const sectionComponents = {
  hero: HeroSection,
  about: AboutSection,
  myNewSection: MyNewSection,  // ← Register here
}
```

## 🏷️ Schema Definition Guide

### Field Types

```typescript
// String field
title: { 
  type: "string", 
  editable: true, 
  localized: true,        // ← Supports multiple languages
  maxLength: 100, 
  description: "Helper text" 
}

// Rich text field  
content: { 
  type: "richtext", 
  editable: true, 
  localized: true, 
  maxLength: 2000 
}

// Image field
image: { 
  type: "image", 
  editable: true, 
  maxLength: 200 
}

// Number field
price: { 
  type: "number", 
  editable: true 
}

// Boolean field
enabled: { 
  type: "boolean", 
  editable: true 
}

// Select dropdown
status: { 
  type: "select", 
  editable: true, 
  options: ["draft", "published", "archived"] 
}

// Array field
items: {
  type: "array",
  editable: true,
  maxItems: 5,            // ← Optional limit
  itemSchema: {
    name: { type: "string", editable: true }
  }
}
```

### Singleton vs Non-Singleton

```typescript
// ✅ Singleton - Only one per page
hero: {
  singleton: true,        // ← Only one hero allowed
  // When added: id = "hero", type = "hero"
}

// ❌ Non-Singleton - Multiple allowed  
serviceHero: {
  singleton: false,       // ← Multiple service heroes allowed
  // When added: id = "serviceHero-1234567890", type = "serviceHero"
}
```

### Section Order

```typescript
// In defaultData, sections are ordered by the "order" field
{
  "id": "hero",
  "type": "hero", 
  "order": 10,            // ← Lower numbers appear first
  "data": { ... }
},
{
  "id": "about",
  "type": "about",
  "order": 20,            // ← Appears after hero
  "data": { ... }
}
```

## 🧩 Component Development

### Essential Imports

```tsx
import { EditableText, EditableList } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"
```

### Path Naming Convention

**✅ Correct Paths:**
```tsx
// Singleton sections - use camelCase type name
<EditableText path="sections.hero.title" />
<EditableText path="sections.aboutUs.content" />
<EditableText path="sections.whyChooseUs.bullets.0.name" />

// Non-singleton sections - use exact ID
<EditableText path="sections.monthlyBookkeepingServiceHero.title" />
```

**❌ Incorrect Paths:**
```tsx
// Don't use hyphen-case
<EditableText path="sections.why-choose-us.title" />
<EditableText path="sections.blog-teaser.title" />
```

### TypeScript Interfaces

Always match your schema:

```tsx
// ✅ Interface matches schema exactly
interface MyNewSectionProps {
  data: {
    title: string                    // ← Matches schema field
    subtitle: string                 // ← Matches schema field  
    items: Array<{                   // ← Matches schema array
      name: string                   // ← Matches itemSchema
      description: string            // ← Matches itemSchema
    }>
  }
}
```

### Handling Arrays

```tsx
// ✅ Use EditableList for dynamic arrays
<EditableList
  path="sections.myNewSection.items"
  items={data.items}
  renderItem={(item, index) => (
    <EditableText 
      path={`sections.myNewSection.items.${index}.name`}
      value={item.name}
    />
  )}
/>

// ❌ Don't use static .map() for editable arrays
{data.items.map((item, index) => (
  <EditableText path={`sections.myNewSection.items.${index}.name`} />
))}
```

## 📄 Data Structure

### Site Data Structure

```json
{
  "_meta": {
    "schemaVersion": 1,
    "locale": "en",
    "availableLocales": ["en"]
  },
  "site": {
    "brand": "Your Brand",
    "slug": "your-site-slug",
    "city": "Your City"
  },
  "features": {
    "blogEnabled": true
  },
  "pages": {
    "home": {
      "sections": [
        {
          "id": "hero",                    // ← Must match component paths
          "type": "hero",                  // ← Must match schema key
          "enabled": true,
          "region": "main",
          "order": 10,                     // ← Controls display order
          "data": {
            "title": "Your Title",         // ← Actual content
            "subtitle": "Your Subtitle"
          }
        }
      ]
    }
  }
}
```

### Adding New Site Data

1. **Copy existing site data** as template
2. **Update site metadata** (brand, slug, city)  
3. **Ensure all section IDs are camelCase**
4. **Match data structure to schema**

## ✅ Best Practices

### 1. Naming Conventions
- **Schema keys**: `camelCase` (e.g., `whyChooseUs`)
- **Section IDs**: `camelCase` matching type for singletons
- **Component files**: `kebab-case` (e.g., `why-choose-us-section.tsx`)
- **Component names**: `PascalCase` (e.g., `WhyChooseUsSection`)

### 2. Schema Design
- Always provide `defaultData`
- Use descriptive `description` fields
- Set reasonable `maxLength` limits
- Consider `localized: true` for user-facing text

### 3. Component Design  
- Wrap ALL user content in `EditableText` or `EditableImage`
- Use semantic HTML elements
- Include proper accessibility attributes
- Handle empty/missing data gracefully

### 4. Path Structure
```tsx
// Singleton sections
"sections.{sectionType}.{fieldName}"
"sections.hero.title"
"sections.aboutUs.content"

// Array items in singleton sections  
"sections.{sectionType}.{arrayName}.{index}.{fieldName}"
"sections.services.items.0.name"

// Non-singleton sections
"sections.{uniqueId}.{fieldName}"
"sections.monthlyBookkeepingServiceHero.title"
```

## ⚠️ Common Pitfalls

### 1. ID/Type Mismatch
```json
// ❌ Wrong - ID doesn't match type
{ "id": "why-choose-us", "type": "whyChooseUs" }

// ✅ Correct - ID matches type for singletons
{ "id": "whyChooseUs", "type": "whyChooseUs" }
```

### 2. Data Structure Mismatch
```tsx
// Schema defines:
bullets: { 
  type: "array",
  itemSchema: { name: { type: "string" } }
}

// ❌ Wrong data format
"bullets": ["String 1", "String 2"]

// ✅ Correct data format  
"bullets": [
  { "name": "String 1" },
  { "name": "String 2" }
]
```

### 3. Path Case Sensitivity
```tsx
// ❌ Wrong - hyphen-case
<EditableText path="sections.why-choose-us.title" />

// ✅ Correct - camelCase
<EditableText path="sections.whyChooseUs.title" />
```

### 4. Missing EditableList
```tsx
// ❌ Wrong - static array rendering
{data.items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ Correct - dynamic editable array
<EditableList
  path="sections.mySection.items"
  items={data.items}
  renderItem={(item, index) => (
    <EditableText 
      path={`sections.mySection.items.${index}.name`}
      value={item.name}
    />
  )}
/>
```

## 🔧 Troubleshooting

### "Section not found for ID" Error
- Check that section ID in data matches component path
- Ensure ID is camelCase, not hyphen-case

### "[object Object]" Displayed
- Check data structure matches schema  
- Verify component expects objects, not strings for arrays

### Section Not Editable
- Verify `EditableText` paths match section ID
- Check that section ID exists in data
- Ensure paths are camelCase

### Section Not in Add Menu
- Check `allowedSectionTypes` in schema pages config
- Verify section is not already added (for singletons)

### TypeScript Errors
- Ensure component interface matches schema structure
- Check that all required fields are defined
- Verify array item types match itemSchema

## 📚 Examples

### Complete Section Example

**Schema:**
```typescript
testimonials: {
  displayName: 'Testimonials',
  singleton: true,
  schema: {
    title: { type: "string", editable: true, localized: true },
    items: {
      type: "array", 
      editable: true,
      itemSchema: {
        quote: { type: "string", editable: true, localized: true },
        author: { type: "string", editable: true, localized: true }
      }
    }
  },
  defaultData: {
    title: 'What Our Clients Say',
    items: [
      { quote: 'Great service!', author: 'John Doe' }
    ]
  }
}
```

**Component:**
```tsx
interface TestimonialsSectionProps {
  data: {
    title: string
    items: Array<{
      quote: string
      author: string
    }>
  }
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  return (
    <section className="py-16">
      <EditableText
        path="sections.testimonials.title"
        value={data.title}
        className="text-3xl font-bold mb-8"
      />
      <EditableList
        path="sections.testimonials.items"
        items={data.items}
        renderItem={(testimonial, index) => (
          <div className="bg-white p-6 rounded-lg">
            <EditableText
              path={`sections.testimonials.items.${index}.quote`}
              value={testimonial.quote}
              className="text-lg italic mb-4"
            />
            <EditableText
              path={`sections.testimonials.items.${index}.author`}
              value={testimonial.author}
              className="font-semibold"
            />
          </div>
        )}
      />
    </section>
  )
}
```

**Data:**
```json
{
  "id": "testimonials",
  "type": "testimonials", 
  "enabled": true,
  "order": 60,
  "data": {
    "title": "What Our Clients Say",
    "items": [
      {
        "quote": "Excellent service and support!",
        "author": "Sarah Johnson"
      }
    ]
  }
}
```

---

## 🎯 Quick Reference

### Essential Files
- `lib/site-schema.ts` - Schema definitions
- `components/sections/` - Section components  
- `sites/{siteId}/lib/site-data.json` - Site content

### Key Functions
- `EditableText` - Editable text fields
- `EditableImage` - Editable images
- `EditableList` - Editable arrays

### Naming Rules
- Schema: `camelCase`
- IDs: `camelCase` (matching type for singletons)
- Paths: `sections.{id}.{field}`

### Common Patterns
- Singleton: One per page, ID = type
- Array: Use `EditableList`, not `.map()`
- Paths: Always camelCase, match section ID

Happy theming! 🎨✨
