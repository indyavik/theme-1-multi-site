# 📚 Adding New Pages Guide

This guide walks you through creating new pages in the theme system step-by-step. We'll use an "About Us" page as an example.

## 🏗️ Architecture Overview

Our theme system has 4 key components:

1. **Schema** (`lib/site-schema.ts`) - Defines what sections can exist and their structure
2. **Data** (`lib/site-data.json`) - Contains the actual content for pages
3. **Components** (`components/sections/`) - React components that render sections
4. **Routes** (`app/*/page.tsx`) - Next.js page routes that tie everything together

## 📋 Step-by-Step Walkthrough

### Step 1: Define Section Types in Schema

**File:** `lib/site-schema.ts`

Add your new section type to the `sectionTypes` object:

```typescript
// Inside sectionTypes object
aboutUsHero: {
  displayName: 'About Us Hero',
  description: 'About us page header with title, text, and image',
  singleton: true,
  region: 'main',
  allowedRegions: ['main'],
  schema: {
    title: { 
      type: "string", 
      editable: true, 
      localized: true, 
      maxLength: 100, 
      description: "About us page title" 
    },
    content: { 
      type: "richtext", 
      editable: true, 
      localized: true, 
      maxLength: 2000, 
      description: "About us main content" 
    },
    image: { 
      type: "image", 
      editable: true, 
      maxLength: 200, 
      description: "About us image" 
    }
  },
  defaultData: {
    title: 'About Us',
    content: 'Tell your story here. Share your company\'s mission, values, and what makes you unique...',
    image: '/placeholder.jpg'
  }
}
```

Then add your page to the `pages` object:

```typescript
// Inside pages object
"about-us": {
  allowedSectionTypes: ["aboutUsHero"]
}
```

### Step 2: Add Page Data

**File:** `lib/site-data.json`

Add your page content inside the `pages` object:

```json
"about-us": {
  "sections": [
    {
      "id": "about-us-hero",
      "type": "aboutUsHero",
      "enabled": true,
      "region": "main",
      "order": 10,
      "data": {
        "title": "About Us",
        "content": "Welcome to our company! We are passionate about providing exceptional services...",
        "image": "/accountant.png"
      }
    }
  ]
}
```

### Step 3: Create React Component

**File:** `components/sections/about-us-hero-section.tsx`

```tsx
import { EditableText } from "@/components/ui/editable-text";
import { EditableImage } from "@/components/ui/editable-image";

interface AboutUsHeroSectionProps {
  data: {
    title: string;
    content: string;
    image: string;
  };
}

export function AboutUsHeroSection({ data }: AboutUsHeroSectionProps) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content - Left Side */}
          <div>
            <EditableText
              path="sections.about-us-hero.title"
              value={data.title}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              {data.title}
            </EditableText>
            
            <div className="text-lg text-gray-600 leading-relaxed">
              <EditableText
                path="sections.about-us-hero.content"
                value={data.content}
                className="prose prose-lg max-w-none"
                multiline={true}
              >
                {data.content}
              </EditableText>
            </div>
          </div>
          
          {/* Image - Right Side */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <EditableImage
                path="sections.about-us-hero.image"
                src={data.image}
                alt={data.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Step 4: Create Page Route

**File:** `app/about-us/page.tsx`

```tsx
"use client";
import { siteData, siteSchema } from "@/lib/site-config";
import { PreviewProvider, PreviewToolbar, SectionsRenderer } from "@/lib/preview-context";
import { AboutUsHeroSection } from "@/components/sections/about-us-hero-section";

// Map section types to their components
const sectionComponents = {
  aboutUsHero: AboutUsHeroSection,
} as const;

function AboutUsContent() {
  return (
    <SectionsRenderer
      className="min-h-screen bg-background"
      renderSection={(section, index) => {
        const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];

        if (!SectionComponent) {
          console.warn(`No component found for section type: ${section.type}`);
          return null;
        }

        return <SectionComponent data={section.data as any} />;
      }}
    >
      <PreviewToolbar />
    </SectionsRenderer>
  );
}

export default function AboutUsPage() {
  return (
    <PreviewProvider 
      initialData={siteData} 
      schema={siteSchema} 
      pageType="about-us"
      currentLocale="en"
    >
      <AboutUsContent />
    </PreviewProvider>
  );
}
```

## 🎯 Key Concepts

### Section Schema Properties

- **`displayName`** - Human-readable name for the section picker
- **`description`** - Help text for editors
- **`singleton`** - Only one instance allowed per page
- **`region`** - Where this section can be placed ("main", "footer", etc.)
- **`allowedRegions`** - Array of valid regions
- **`schema`** - Field definitions (type, editable, localized, etc.)
- **`defaultData`** - Initial content when section is added

### Field Types

- **`string`** - Basic text input
- **`richtext`** - Rich text editor (supports formatting)
- **`image`** - Image upload/selection
- **`array`** - List of items
- **`boolean`** - Toggle switch
- **`select`** - Dropdown with options
- **`color`** - Color picker
- **`date`** - Date picker

### Field Properties

- **`editable: true`** - Can be edited in preview mode
- **`localized: true`** - Supports multiple languages
- **`maxLength`** - Character limit
- **`description`** - Help text for editors
- **`options`** - For select fields (array of choices)

### EditableText Props

```tsx
<EditableText
  path="sections.section-id.field-name"  // Path to the field in data
  value={data.fieldName}                 // Current value
  className="text-4xl font-bold"         // Styling
  multiline={true}                       // For longer text
/>
```

⚠️ **IMPORTANT: Do NOT pass children to EditableText!**

```tsx
// ❌ WRONG - This breaks styling in non-preview mode
<EditableText
  path="sections.hero.title"
  value={data.title}
  className="text-4xl font-bold"
>
  {data.title}  {/* Don't do this! */}
</EditableText>

// ✅ CORRECT - Let EditableText handle the display
<EditableText
  path="sections.hero.title"
  value={data.title}
  className="text-4xl font-bold"
/>
```

**Why?** When you pass children, EditableText returns them directly in non-preview mode, bypassing the `className` styling. Always use the self-closing syntax.

### EditableImage Props

```tsx
<EditableImage
  path="sections.section-id.image"       // Path to the field in data
  src={data.image}                       // Current image URL
  alt={data.title}                       // Alt text
  width={500}                            // Display width
  height={500}                           // Display height
  className="w-full h-full object-cover" // Styling
/>
```

## 🚀 What You Get Automatically

When you follow this pattern, your page automatically gets:

- ✅ **In-context editing** - Click any text/image to edit
- ✅ **Section management** - Add, remove, reorder sections
- ✅ **Drag & drop** - Reorder sections by dragging
- ✅ **Responsive design** - Works on all devices
- ✅ **Preview toolbar** - Toggle edit mode on/off
- ✅ **Type safety** - Full TypeScript support
- ✅ **Internationalization** - Ready for multiple languages

## 📝 Quick Checklist

For each new page, make sure you:

- [ ] Add section type(s) to `siteSchema.sectionTypes`
- [ ] Add page definition to `siteSchema.pages`
- [ ] Add page content to `site-data.json`
- [ ] Create React component(s) in `components/sections/`
- [ ] Create page route in `app/[page-name]/page.tsx`
- [ ] Map section types to components in the route file
- [ ] Use `SectionsRenderer` for consistent behavior

## 🔧 Advanced Features

### Multiple Sections per Page

```typescript
// In site-schema.ts
"about-us": {
  allowedSectionTypes: ["aboutUsHero", "aboutUsTeam", "aboutUsValues"]
}
```

### Custom Regions

```typescript
// In section definition
region: 'sidebar',
allowedRegions: ['main', 'sidebar'],
```

### Complex Field Types

```typescript
// Array of objects
team: {
  type: "array",
  editable: true,
  maxItems: 10,
  itemSchema: {
    name: { type: "string", editable: true, maxLength: 50 },
    role: { type: "string", editable: true, maxLength: 100 },
    photo: { type: "image", editable: true }
  }
}
```

### Select Fields

```typescript
// Dropdown with options
category: {
  type: "select",
  editable: true,
  options: ["Technology", "Healthcare", "Finance", "Retail"]
}
```

## 🎨 Styling Tips

- Use **Tailwind CSS** classes for consistent styling
- Follow the **mobile-first** responsive approach
- Use **semantic HTML** elements (`<section>`, `<header>`, etc.)
- Keep **accessibility** in mind (alt texts, proper headings)

## 🐛 Troubleshooting

### Common Issues:

1. **Section not appearing** - Check that section type is added to `allowedSectionTypes`
2. **Content not editable** - Ensure `editable: true` in schema and proper `path` in `EditableText`
3. **Styling only works in preview mode** - Remove children from `EditableText` components (use self-closing `<EditableText />`)
4. **TypeScript errors** - Make sure component props match the schema definition
5. **Images not loading** - Verify image paths are correct and files exist in `/public`

### Debug Tips:

- Check browser console for warnings about missing components
- Use React DevTools to inspect component props
- Verify JSON syntax in `site-data.json`
- Test in both preview and non-preview modes

---

Happy coding! 🎉 This pattern scales to any complexity - from simple pages to complex multi-section layouts.
