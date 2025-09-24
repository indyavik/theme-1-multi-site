# Preview Mode Enhancements

## 🔍 **Current Implementation**

### **Where Preview Mode is Set**
Preview mode is currently **hardcoded to `true`** in:
- **File**: `theme/core/preview-context.tsx`
- **Line**: 451
- **Code**: `const [isPreviewMode, setIsPreviewMode] = useState(true);`

### **Current Behavior**
- ✅ Preview mode is **always enabled by default**
- ✅ Users can toggle it via checkbox in PreviewToolbar
- ❌ **No authentication required** - anyone can access preview mode
- ❌ **No URL parameter control** - `?preview=true` doesn't affect initial state

## 🚀 **Recommended Future Enhancements**

### **Option 1: Server-Side Authentication (Most Secure)**
Validate authentication in page routes before allowing preview mode:

```typescript
// In each page route (app/page.tsx, app/blog/page.tsx, etc.)
import { getServerSession } from "next-auth/next"

export default async function HomePage({ searchParams }) {
  const session = await getServerSession()
  const isAuthenticated = !!session?.user
  
  // Only allow preview mode for authenticated users
  const isPreviewMode = searchParams?.preview === 'true' && isAuthenticated
  
  // Redirect if preview requested but not authenticated
  if (searchParams?.preview === 'true' && !isAuthenticated) {
    redirect('/login')
  }
  
  // Pass to PreviewProvider
  return <PreviewProvider initialPreviewMode={isPreviewMode} ... />
}
```

### **Option 2: Client-Side Authentication (Preferred)**
Use authentication library to check user session in PreviewProvider:

```typescript
// theme/core/preview-context.tsx
import { useSession } from "next-auth/react"

export function PreviewProvider({ children, initialData, schema, siteSlug, pageType, currentLocale, contextSlug }: PreviewProviderProps) {
  const { data: session, status } = useSession()
  
  // Only allow preview mode if authenticated
  const canPreview = status === "authenticated" && !!session?.user
  
  // Default to false, only enable if URL param + authenticated
  const [isPreviewMode, setIsPreviewMode] = useState(() => {
    const urlPreview = typeof window !== 'undefined' && 
      new URLSearchParams(window.location.search).get('preview') === 'true'
    return urlPreview && canPreview
  })
  
  // Rest of provider logic...
}
```

## 🔧 **Implementation Steps**

### **Step 1: Choose Authentication Library**
- **NextAuth.js** (recommended for Next.js)
- **Clerk** (modern, full-featured)
- **Supabase Auth** (if using Supabase)
- **Custom JWT** (if you have existing auth system)

### **Step 2: Update PreviewProvider**
- Change `useState(true)` to `useState(false)`
- Add authentication check
- Respect URL parameter `?preview=true`

### **Step 3: Add SessionProvider**
- Wrap app with authentication provider
- Configure auth routes and callbacks

### **Step 4: Update Page Validation**
- Current validation already supports preview mode detection
- No changes needed to existing 404 logic

## 🎯 **Benefits of Option 2 (Client-Side)**

- ✅ **Immediate implementation** - works with existing code
- ✅ **Flexible** - easy to add role-based permissions later
- ✅ **User-friendly** - clear login prompts when needed
- ✅ **SEO-friendly** - no server-side auth complexity
- ✅ **Development-friendly** - easy to test and debug

## 📝 **Current Files That Need Updates**

1. **`theme/core/preview-context.tsx`** - Line 451 (hardcoded `true`)
2. **`app/layout.tsx`** - Add SessionProvider wrapper
3. **Authentication setup** - Choose and configure auth library
4. **Environment variables** - Add auth provider credentials

## 🔒 **Security Considerations**

- **Preview mode should be read-only** by default
- **Publishing changes** should require additional permissions
- **Audit logging** for who makes changes when
- **Role-based access** for different levels of editing

---

**Priority**: High - Preview mode should not be publicly accessible in production environments.
