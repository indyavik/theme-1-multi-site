# Theme-1-Sections - Editable Website Template with Section Management

A Next.js website template with **in-place editing capabilities** and **section-level management** for easy content management without a traditional CMS.

## 🎯 Features

- **In-place text editing** - Click any text to edit directly on the page
- **Section-level management** - Add, remove, and reorder entire sections
- **Image upload functionality** - Upload and replace images with hover overlay
- **Preview mode toggle** - Switch between viewing and editing modes
- **Real-time character limits** - Enforce content constraints as you type
- **Auto-save to localStorage** - Changes persist across browser sessions
- **Publish/Discard system** - Save changes permanently or revert
- **Schema-driven editing** - Only fields marked as `editable: true` can be modified
- **Section picker modal** - Choose from available section types when adding new sections
- **Confirmation dialogs** - Safe section removal with confirmation prompts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## ✏️ How to Edit Content

1. **Enable Preview Mode**: Click the "Editing OFF" toggle in the top toolbar
2. **Edit Text**: Click on any editable text to modify it directly
3. **Manage Sections**: Hover over sections to see add/remove controls
4. **Add Sections**: Click "+ Add Section" buttons or use the main "Add New Section" button
5. **Remove Sections**: Click the trash icon and confirm removal
6. **Upload Images**: Hover over images and click "Upload Image" button
7. **Save Changes**: Click "Publish Changes" to save permanently
8. **Discard Changes**: Click "Discard All" to revert to original

## 🏗️ Architecture Overview

### Core Components

The editable functionality is built with **4 custom components**:

#### 1. **EditableText Component** (`components/ui/editable-text.tsx`)
- **Purpose**: In-place text editing with `contentEditable`
- **Features**: 
  - Real-time character limit enforcement
  - Keyboard shortcuts (Enter to save, Escape to cancel)
  - Preserves original styling during editing
  - Schema-driven validation

#### 2. **EditableImage Component** (`components/ui/editable-image.tsx`)
- **Purpose**: Image upload and editing with hover overlay
- **Features**:
  - File upload with validation (image types only, max 5MB)
  - Instant preview using data URLs
  - Remove image functionality
  - Hover overlay with upload/remove buttons

#### 3. **EditableSection Component** (`components/ui/editable-section.tsx`)
- **Purpose**: Section-level management with add/remove controls
- **Features**:
  - Hover overlay with section controls
  - Add section buttons (before/after)
  - Remove section with confirmation dialog
  - Drag handle for future reordering
  - Visual feedback during interactions

#### 4. **PreviewContext Provider** (`lib/preview-context.tsx`)
- **Purpose**: Global state management for editing mode
- **Features**:
  - Preview mode toggle
  - Field-level editing state
  - Section management (add/remove/reorder)
  - Auto-save to localStorage
  - Publish/discard functionality
  - Section picker modal

## 🔧 Implementation Guide

### Step 1: Add Editable Fields to Schema

In `lib/site-data-schema.ts`, mark fields as editable:

```typescript
yourField: { 
  type: 'string', 
  maxLength: 100, 
  editable: true,  // ← Add this
  description: 'Field description'
}
```

### Step 2: Add Data to Site Data

In `lib/site-data.ts`, add the field value:

```typescript
data: {
  yourField: "Your content here"
}
```

### Step 3: Wrap with EditableText

In your section component:

```typescript
import { EditableText } from "@/components/ui/editable-text"

// Replace this:
<div>{data.yourField}</div>

// With this:
<EditableText
  path="sections.yourSection.yourField"
  value={data.yourField}
  className="your-styling-classes"
/>
```

### Step 4: For Images, Use EditableImage

```typescript
import { EditableImage } from "@/components/ui/editable-image"

// Replace this:
<img src={data.imagePath} alt="Description" />

// With this:
<EditableImage
  path="sections.yourSection.imagePath"
  src={data.imagePath}
  alt="Description"
  width={500}
  height={500}
  className="your-styling-classes"
/>
```

### Step 5: For Sections, Use EditableSection

```typescript
import { EditableSection } from "@/components/ui/editable-section"

// Wrap your section component:
<EditableSection
  sectionId={section.id}
  sectionType={section.type}
  path={`sections.${section.id}`}
  onRemove={() => handleRemoveSection(section.id)}
  onAddBefore={() => handleAddSection(index)}
  onAddAfter={() => handleAddSection(index + 1)}
>
  <YourSectionComponent data={section.data} />
</EditableSection>
```

## 🎨 Customization

### Adding New Editable Fields

1. **Update Schema**: Add field definition with `editable: true`
2. **Update Data**: Add field value to site data
3. **Update Component**: Wrap with `EditableText` or `EditableImage`
4. **Test**: Enable preview mode and verify editing works

### Adding New Section Types

1. **Update Schema**: Add section configuration in `sectionConfig`
2. **Update PreviewContext**: Add default data in `AVAILABLE_SECTIONS`
3. **Create Component**: Build the section component
4. **Update Page**: Add to `sectionComponents` mapping
5. **Test**: Verify section can be added/removed

### Styling Editable Elements

EditableText preserves original styling:

```typescript
<EditableText
  path="sections.hero.title"
  value={data.title}
  className="text-4xl font-bold text-blue-600"  // ← Styling preserved
/>
```

### Character Limits

Set in schema and enforced automatically:

```typescript
title: { 
  type: 'string', 
  maxLength: 50,  // ← Enforced in real-time
  editable: true 
}
```

## 🔄 State Management

### Preview Mode States

- **Viewing Mode**: Normal website display, no editing
- **Preview Mode**: Editable elements show hover states and editing capabilities
- **Editing State**: Individual fields being actively edited
- **Section Management**: Hover controls for section operations

### Data Flow

1. **Initial Load**: Site data loaded from `site-data.ts`
2. **Preview Mode**: Context provides editing capabilities
3. **User Edits**: Changes stored in `editedData` state
4. **Auto-save**: Changes persisted to localStorage
5. **Publish**: Changes sent to backend (TODO: implement API)
6. **Discard**: Changes reverted to original state

## 🎯 Section Management Features

### Available Section Types

- **Hero Section**: Main banner (required, cannot be removed)
- **About Section**: Business information
- **Services Section**: List of services offered
- **Contact Section**: Contact information and form
- **Testimonials Section**: Customer reviews
- **Why Choose Us Section**: Business advantages
- **Blog Section**: Latest articles/posts
- **Industries Section**: Industries served
- **Footer Section**: Site footer (required, cannot be removed)

### Section Operations

- **Add Section**: Choose from available section types
- **Remove Section**: Confirmation dialog prevents accidental removal
- **Reorder Sections**: Drag and drop (future feature)
- **Edit Section Content**: Use existing EditableText/EditableImage components

## 🚀 Future Enhancements

- [ ] Drag and drop section reordering
- [ ] Section templates and presets
- [ ] Bulk section operations
- [ ] Section duplication
- [ ] Undo/redo for section operations
- [ ] Section visibility controls
- [ ] Mobile-optimized section management
- [ ] Section analytics and performance metrics

## 📝 Notes

- Hero and footer sections cannot be removed for site structure integrity
- All section operations are preserved in localStorage until published
- Section picker modal shows available section types with descriptions
- Confirmation dialogs prevent accidental section removal
- Original theme1 editing capabilities are fully preserved

## Multi‑site: Adding a new site

1) Register the site
- Edit `lib/site-registry.ts` and add your site id to `SITES`.
- Example: `export const SITES = ['site1', 'site2', 'site3'] as const;`

2) Create per‑site files
- Create `sites/<siteId>/lib/site-data.json` as a full copy of `lib/site-data.json` and customize:
  - `site.brand`, `site.city`, `site.slug`, etc.
  - `pages.<page>.sections` with `enabled: true` for sections you want visible.
- Put site‑specific assets in `sites/<siteId>/public/` (folders exist with `.gitkeep`).

3) Image resolution order
- In your JSON, use paths like `"/accountant.png"`.
- At runtime, images resolve as:
  1. `/sites/<siteSlug>/accountant.png` → served from root `public/sites/<siteSlug>/accountant.png`
  2. Fallback to `/accountant.png` in the root `public/` (shared)
- External URLs (`http(s)://...`) are used as‑is.

4) Run/test
- Visit `/?site=<siteId>` (also `/about-us?site=<siteId>`, `/blog?site=<siteId>`, etc.).
- Schema is shared in `lib/site-schema.ts`. Only data and assets are per‑site.

Optional
- Add middleware to persist `?site` in a cookie so the param isn’t needed on every page.
