# Theme Creation Guide - Editable Website Pattern

A concise guide for creating new themes with in-place editing capabilities.

## 🎯 Core Pattern

Every editable theme follows this **3-component + schema pattern**:

### Required Components (Copy These)
1. **`components/ui/editable-text.tsx`** - Text editing with contentEditable
2. **`components/ui/editable-image.tsx`** - Image upload with hover overlay  
3. **`lib/preview-context.tsx`** - State management for preview mode

### Required Files (Create These)
4. **`lib/site-data-schema.ts`** - Define editable fields and constraints
5. **`lib/site-data.ts`** - Actual content data
6. **`app/page.tsx`** - Wrap with PreviewProvider

## 📁 File Structure Template

```
your-theme/
├── components/
│   ├── ui/
│   │   ├── editable-text.tsx      # ← Copy from theme1
│   │   ├── editable-image.tsx     # ← Copy from theme1
│   │   └── button.tsx             # ← Standard UI component
│   └── sections/
│       ├── hero-section.tsx       # ← One file per section
│       ├── about-section.tsx      # ← One file per section
│       └── contact-section.tsx    # ← One file per section
├── lib/
│   ├── preview-context.tsx        # ← Copy from theme1
│   ├── site-data-schema.ts        # ← Define your fields
│   └── site-data.ts              # ← Your content
└── app/
    └── page.tsx                   # ← Wrap with PreviewProvider
```

## 🔧 Implementation Steps

### Step 1: Copy Core Components
```bash
# Copy these 3 files from theme1 to your new theme
cp theme1/components/ui/editable-text.tsx your-theme/components/ui/
cp theme1/components/ui/editable-image.tsx your-theme/components/ui/
cp theme1/lib/preview-context.tsx your-theme/lib/
```

### Step 2: Create Schema (`lib/site-data-schema.ts`)
```typescript
export const siteDataSchema = {
  site: {
    brand: { type: 'string', maxLength: 50, editable: true },
    city: { type: 'string', maxLength: 50, editable: true }
  },
  sections: {
    hero: {
      title: { type: 'string', maxLength: 100, editable: true },
      image: { type: 'image', editable: true }
    }
  }
}
```

### Step 3: Create Data (`lib/site-data.ts`)
```typescript
export const siteData = {
  site: { brand: "Your Business", city: "Your City" },
  sections: [
    {
      id: "hero",
      type: "hero", 
      enabled: true,
      data: {
        title: "Your Headline",
        image: "/your-image.png"
      }
    }
  ]
}
```

### Step 4: Wrap Page (`app/page.tsx`)
```typescript
import { PreviewProvider } from "@/lib/preview-context"
import { siteDataSchema } from "@/lib/site-data-schema"
import { siteData } from "@/lib/site-data"

export default function Page() {
  return (
    <PreviewProvider 
      initialData={siteData} 
      schema={siteDataSchema} 
      siteSlug="your-theme"
    >
      {/* Your page content */}
    </PreviewProvider>
  )
}
```

### Step 5: Create Section Components
**One file per section** following this pattern:

```typescript
// components/sections/hero-section.tsx
import { EditableText } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"

interface HeroSectionProps {
  data: {
    title: string
    image: string
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section>
      <EditableText
        path="sections.hero.title"
        value={data.title}
        className="text-4xl font-bold"
      />
      <EditableImage
        path="sections.hero.image"
        src={data.image}
        alt="Hero image"
        width={500}
        height={300}
      />
    </section>
  )
}
```

## 🎨 Schema Rules

### Field Types
- **`type: 'string'`** - Text fields (use EditableText)
- **`type: 'image'`** - Image fields (use EditableImage)
- **`type: 'array'`** - Lists (wrap each item with EditableText)

### Required Properties
```typescript
fieldName: {
  type: 'string',           // Required
  maxLength: 100,          // Required for strings
  editable: true,          // Required - makes field editable
  description: 'Field description', // Optional but recommended
  example: 'Example value'  // Optional but recommended
}
```

### Editable vs Non-Editable
- **`editable: true`** - Field can be edited in preview mode
- **`editable: false`** - Field is read-only (like IDs, hrefs, etc.)

## 🔄 Component Usage Patterns

### Text Fields
```typescript
<EditableText
  path="sections.sectionName.fieldName"
  value={data.fieldName}
  className="your-css-classes"
/>
```

### Image Fields
```typescript
<EditableImage
  path="sections.sectionName.imageField"
  src={data.imageField}
  alt="Description"
  width={500}
  height={300}
  className="your-css-classes"
/>
```

### Array Fields (Lists)
```typescript
{data.items.map((item, index) => (
  <EditableText
    key={index}
    path={`sections.sectionName.items.${index}`}
    value={item}
    className="list-item-class"
  />
))}
```

## ✅ Checklist for New Themes

- [ ] Copy 3 core components (editable-text, editable-image, preview-context)
- [ ] Create schema with all editable fields marked `editable: true`
- [ ] Create site-data with actual content
- [ ] Wrap page.tsx with PreviewProvider
- [ ] Create one component file per section
- [ ] Wrap all editable content with EditableText/EditableImage
- [ ] Test preview mode toggle works
- [ ] Test text editing preserves styling
- [ ] Test image upload works
- [ ] Verify character limits are enforced

## 🚀 Quick Start Template

```bash
# 1. Create theme directory
mkdir your-theme
cd your-theme

# 2. Copy core components from theme1
cp ../theme1/components/ui/editable-*.tsx components/ui/
cp ../theme1/lib/preview-context.tsx lib/

# 3. Create your schema, data, and sections
# 4. Wrap with PreviewProvider
# 5. Test in browser
```

---

## 🤖 LLM Prompt for Theme Creation

Use this prompt with LLMs to generate new themes following this pattern:

```
Create a new editable website theme following this exact pattern:

REQUIRED COMPONENTS (copy these from theme1):
- components/ui/editable-text.tsx (text editing)
- components/ui/editable-image.tsx (image upload) 
- lib/preview-context.tsx (state management)

REQUIRED FILES TO CREATE:
- lib/site-data-schema.ts (define editable fields)
- lib/site-data.ts (content data)
- app/page.tsx (wrap with PreviewProvider)
- components/sections/[section-name]-section.tsx (one file per section)

SCHEMA PATTERN:
```typescript
export const siteDataSchema = {
  site: {
    brand: { type: 'string', maxLength: 50, editable: true },
    city: { type: 'string', maxLength: 50, editable: true }
  },
  sections: {
    [sectionName]: {
      [fieldName]: { 
        type: 'string'|'image', 
        maxLength: number, 
        editable: true,
        description: 'Field description'
      }
    }
  }
}
```

DATA PATTERN:
```typescript
export const siteData = {
  site: { brand: "Business Name", city: "City" },
  sections: [
    {
      id: "sectionName",
      type: "sectionName",
      enabled: true,
      data: { fieldName: "value" }
    }
  ]
}
```

COMPONENT PATTERN:
```typescript
import { EditableText } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"

interface SectionProps {
  data: { fieldName: string }
}

export function Section({ data }: SectionProps) {
  return (
    <section>
      <EditableText
        path="sections.sectionName.fieldName"
        value={data.fieldName}
        className="styling-classes"
      />
    </section>
  )
}
```

PAGE WRAPPER:
```typescript
import { PreviewProvider } from "@/lib/preview-context"
import { siteDataSchema } from "@/lib/site-data-schema"
import { siteData } from "@/lib/site-data"

export default function Page() {
  return (
    <PreviewProvider 
      initialData={siteData} 
      schema={siteDataSchema} 
      siteSlug="theme-name"
    >
      {/* Render sections */}
    </PreviewProvider>
  )
}
```

RULES:
1. One file per section component
2. All editable fields must be wrapped with EditableText or EditableImage
3. Schema must define all fields with editable: true/false
4. Use path="sections.sectionName.fieldName" format
5. Preserve original styling with className prop
6. Include proper TypeScript interfaces
7. Follow the exact file structure shown above

Create a [THEME_TYPE] theme with [SPECIFIC_REQUIREMENTS]. Include these sections: [SECTION_LIST].
```

This pattern ensures consistency, maintainability, and easy replication across all themes.
