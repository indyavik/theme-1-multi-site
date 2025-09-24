# 🎨 Theme System Documentation

Welcome to the theme system! This folder contains all documentation for developers and users.

## 📚 Documentation Index

### **For Developers**
- **[QUICK_START_DEVELOPER.md](QUICK_START_DEVELOPER.md)** - ⚡ 5-minute section creation guide
- **[THEME_DEVELOPER_GUIDE.md](THEME_DEVELOPER_GUIDE.md)** - 📖 Comprehensive developer guide
- **[DEVELOPER_AUDIT_AND_IMPROVEMENTS.md](DEVELOPER_AUDIT_AND_IMPROVEMENTS.md)** - 🔍 System analysis & improvements

### **For Content Creators**
- **[THEME_CREATION_GUIDE.md](THEME_CREATION_GUIDE.md)** - 🎯 Content editing guide
- **[ADDING_NEW_PAGES_GUIDE.md](ADDING_NEW_PAGES_GUIDE.md)** - 📄 Page creation guide

## 🚀 **Quick Start**

### **I want to create a new section (Developer)**
→ Start with **[QUICK_START_DEVELOPER.md](QUICK_START_DEVELOPER.md)**

### **I want to edit content (Content Creator)**
→ Start with **[THEME_CREATION_GUIDE.md](THEME_CREATION_GUIDE.md)**

### **I want to understand the system (Technical)**
→ Start with **[THEME_DEVELOPER_GUIDE.md](THEME_DEVELOPER_GUIDE.md)**

## 🏗️ **New Repository Structure**

After reorganization, the repository follows this clean structure:

```
/
├── 📚 docs/                        ← You are here
│   ├── README.md                   ← This file
│   ├── QUICK_START_DEVELOPER.md    ← 5-minute section creation
│   └── THEME_DEVELOPER_GUIDE.md    ← Comprehensive guide
├── 🎨 theme/
│   ├── site-schema.ts              ← Schema definitions
│   ├── core/                       ← Core editing system
│   │   ├── preview-context.tsx     ← Global state management
│   │   ├── editable-text.tsx       ← Text editing component
│   │   ├── editable-image.tsx      ← Image editing component
│   │   └── editable-section.tsx    ← Section management
│   ├── components/
│   │   ├── sections/               ← Theme sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── about-section.tsx
│   │   │   └── ... (all sections)
│   │   └── pages/                  ← Page wrappers
│   │       ├── HomeContent.tsx
│   │       └── ... (page components)
│   └── lib/                        ← Theme utilities
│       ├── site-loader.ts          ← Site data loading
│       └── site-registry.ts        ← Site configuration
├── 🌐 sites/                       ← Site-specific data
│   ├── site1/lib/site-data.json
│   ├── site2/lib/site-data.json
│   └── site3/lib/site-data.json
├── 🧩 components/ui/                ← Generic UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ... (UI components only)
├── 📱 app/                         ← Next.js app router
└── 🔧 lib/                         ← Generic utilities
    ├── seo.ts
    ├── contact.ts
    └── utils.ts
```

## 🎯 **Key Benefits of New Structure**

### **Clear Separation of Concerns**
- **`theme/`** = Everything related to your specific theme
- **`core/`** = The reusable editing system
- **`components/ui/`** = Generic UI components (shadcn/ui)
- **`docs/`** = All documentation in one place

### **Better Import Paths**
```typescript
// Core editing system
import { EditableText } from "@/theme/core/editable-text"
import { usePreviewContext } from "@/theme/core/preview-context"

// Theme components  
import { HeroSection } from "@/theme/components/sections/hero-section"

// Generic UI
import { Button } from "@/components/ui/button"
```

### **Developer-Friendly**
- **Single entry point**: Start here in `docs/README.md`
- **Quick start**: 5-minute section creation guide
- **Clear structure**: Easy to find what you need
- **Logical organization**: Related files grouped together

## 💡 **Next Steps**

1. **New to the system?** → Read [QUICK_START_DEVELOPER.md](QUICK_START_DEVELOPER.md)
2. **Need comprehensive info?** → Read [THEME_DEVELOPER_GUIDE.md](THEME_DEVELOPER_GUIDE.md)
3. **Want to improve the system?** → Read [DEVELOPER_AUDIT_AND_IMPROVEMENTS.md](DEVELOPER_AUDIT_AND_IMPROVEMENTS.md)

---

**Happy theming! 🎨✨**