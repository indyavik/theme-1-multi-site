# ⚡ Quick Start: Creating Theme Sections

**TL;DR: 3 files, 5 minutes, done!** 🚀

## 🎯 The Essentials

### **The Process:**
1. **Schema** → Define fields
2. **Component** → Render with EditableText
3. **Data** → Add to allowed sections

### **The Rules:**
- Wrap everything in `EditableText`, `EditableImage`, or `EditableList`
- Use camelCase IDs that match your paths
- Arrays MUST use `EditableList` (never `.map()`)

## 🚀 **5-Minute Section Creation**

### **Step 1: Add to Schema** (`lib/site-schema.ts`)
```typescript
sectionTypes: {
  // Add your section here
  myAwesomeSection: {
    displayName: 'My Awesome Section',
    singleton: true,
    region: 'main',
    allowedRegions: ['main'],
    schema: {
      title: { type: "string", editable: true, localized: true, maxLength: 100 },
      subtitle: { type: "string", editable: true, localized: true, maxLength: 200 },
      items: {
        type: "array",
        editable: true,
        itemSchema: {
          name: { type: "string", editable: true, localized: true, maxLength: 50 }
        }
      }
    },
    defaultData: {
      title: 'My Awesome Title',
      subtitle: 'This is a great subtitle',
      items: [
        { name: 'Item 1' },
        { name: 'Item 2' }
      ]
    }
  }
}
```

### **Step 2: Allow on Pages** (same file)
```typescript
pages: {
  home: {
    allowedSectionTypes: [
      "hero", "about", "services", 
      "myAwesomeSection"  // ← Add here
    ]
  }
}
```

### **Step 3: Create Component** (`components/sections/my-awesome-section.tsx`)
```typescript
import { EditableText, EditableList } from "@/components/ui/editable-text"

interface MyAwesomeSectionProps {
  data: {
    title: string
    subtitle: string
    items: Array<{ name: string }>
  }
}

export function MyAwesomeSection({ data }: MyAwesomeSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* ✅ CRITICAL: Use camelCase paths matching schema */}
        <EditableText
          path="sections.myAwesomeSection.title"
          value={data.title}
          className="text-3xl font-bold mb-4"
        />
        
        <EditableText
          path="sections.myAwesomeSection.subtitle"
          value={data.subtitle}
          className="text-lg text-gray-600 mb-8"
        />

        {/* ✅ CRITICAL: Use EditableList for arrays */}
        <EditableList
          path="sections.myAwesomeSection.items"
          items={data.items}
          renderItem={(item, index) => (
            <div className="mb-4">
              <EditableText
                path={`sections.myAwesomeSection.items.${index}.name`}
                value={item.name}
                className="font-medium"
              />
            </div>
          )}
        />
      </div>
    </section>
  )
}
```

### **Step 4: Register Component** (in your sections renderer)
```typescript
// Add to your component mapping
const sectionComponents = {
  hero: HeroSection,
  about: AboutSection,
  myAwesomeSection: MyAwesomeSection,  // ← Add here
}
```

### **Step 5: Test** 
- Start dev server: `npm run dev`
- Enable preview mode
- Click "Add Section" → should see "My Awesome Section"
- Add it and test editing

## ⚠️ **The 4 Deadly Mistakes**

### **1. ID/Path Mismatch**
```typescript
// ❌ BROKEN
{ "id": "my-awesome-section", "type": "myAwesomeSection" }
<EditableText path="sections.myAwesomeSection.title" />

// ✅ FIXED  
{ "id": "myAwesomeSection", "type": "myAwesomeSection" }
<EditableText path="sections.myAwesomeSection.title" />
```

### **2. Using .map() Instead of EditableList**
```typescript
// ❌ BROKEN - Can't add/remove items
{data.items.map(item => <div>{item.name}</div>)}

// ✅ FIXED - Full editing
<EditableList path="sections.mySection.items" items={data.items} />
```

### **3. Wrong Data Structure**
```typescript
// ❌ BROKEN - Schema expects objects
"items": ["Item 1", "Item 2"]

// ✅ FIXED - Objects with name property
"items": [{ "name": "Item 1" }, { "name": "Item 2" }]
```

### **4. Forgetting EditableText**
```typescript
// ❌ BROKEN - Not editable
<h1>{data.title}</h1>

// ✅ FIXED - Editable
<EditableText path="sections.mySection.title" value={data.title} />
```

## 🎯 **Copy-Paste Templates**

### **Simple Text Section**
```typescript
// Schema
myTextSection: {
  displayName: 'Text Section',
  singleton: true,
  schema: {
    title: { type: "string", editable: true, localized: true, maxLength: 100 },
    content: { type: "richtext", editable: true, localized: true, maxLength: 1000 }
  },
  defaultData: {
    title: 'Section Title',
    content: 'Section content goes here...'
  }
}

// Component
export function MyTextSection({ data }: { data: { title: string, content: string } }) {
  return (
    <section className="py-16">
      <EditableText path="sections.myTextSection.title" value={data.title} className="text-3xl font-bold" />
      <EditableText path="sections.myTextSection.content" value={data.content} className="text-lg mt-4" />
    </section>
  )
}
```

### **List Section**
```typescript
// Schema
myListSection: {
  displayName: 'List Section',
  singleton: true,
  schema: {
    title: { type: "string", editable: true, localized: true },
    items: {
      type: "array",
      editable: true,
      itemSchema: {
        name: { type: "string", editable: true, localized: true },
        description: { type: "string", editable: true, localized: true }
      }
    }
  },
  defaultData: {
    title: 'My List',
    items: [
      { name: 'Item 1', description: 'Description 1' }
    ]
  }
}

// Component
export function MyListSection({ data }: { data: { title: string, items: Array<{name: string, description: string}> } }) {
  return (
    <section className="py-16">
      <EditableText path="sections.myListSection.title" value={data.title} className="text-3xl font-bold mb-8" />
      <EditableList
        path="sections.myListSection.items"
        items={data.items}
        renderItem={(item, index) => (
          <div className="mb-4">
            <EditableText path={`sections.myListSection.items.${index}.name`} value={item.name} className="font-bold" />
            <EditableText path={`sections.myListSection.items.${index}.description`} value={item.description} className="text-gray-600" />
          </div>
        )}
      />
    </section>
  )
}
```

## 🔧 **Debug Checklist**

### **Section Not Appearing in Add Menu?**
- [ ] Added to `sectionTypes` in schema
- [ ] Added to `allowedSectionTypes` for the page
- [ ] Restarted dev server

### **Section Not Editable?**
- [ ] Wrapped content in `EditableText`/`EditableImage`/`EditableList`
- [ ] Path matches section ID exactly (camelCase)
- [ ] Fields marked as `editable: true` in schema

### **Arrays Not Working?**
- [ ] Used `EditableList` (not `.map()`)
- [ ] Data structure matches schema (objects, not strings)
- [ ] Paths include array index: `items.${index}.field`

### **"[object Object]" Showing?**
- [ ] Component expects objects but data has strings
- [ ] Update data to match schema structure

## 🎯 **That's It!**

Follow this pattern and you'll have working, editable sections every time. The key is consistency:

1. **Schema first** - define your fields
2. **Component second** - wrap everything in Editable components  
3. **Test immediately** - catch mistakes early

**Remember:** When in doubt, copy an existing working section and modify it! 🚀
