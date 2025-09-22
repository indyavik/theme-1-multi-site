# Text Length Guidelines for Site Data

Based on the template's CSS classes and layout constraints, here are the recommended maximum character lengths for different sections to prevent layout distortion:

## 🎯 Hero Section
```typescript
shortHeadline: string // MAX: 60-80 characters
subHeadline: string   // MAX: 120-150 characters
```
**Layout Context:**
- `text-4xl lg:text-6xl` (large heading)
- `max-w-2xl` constraint on subtitle
- `text-balance` for optimal line breaks

**Examples:**
- ✅ Good: "Stress-Free Bookkeeping for Small Businesses" (47 chars)
- ❌ Too long: "Comprehensive Stress-Free Professional Bookkeeping and Tax Services for Small to Medium Businesses Across All Industries" (120+ chars)

## 📖 About Section
```typescript
title: string  // MAX: 40-50 characters
story: string  // MAX: 200-250 characters
credentials: string[] // MAX: 20 chars per item, 3-5 items
badges: string[]      // MAX: 25 chars per item, 2-4 items
```
**Layout Context:**
- `max-w-2xl mx-auto` for story text
- `text-lg` for story
- Badge layout in `flex-wrap`

## 🛠️ Services Section
```typescript
name: string     // MAX: 25-30 characters
summary?: string // MAX: 40-50 characters
bullets: string[] // MAX: 35-40 chars per bullet, 3-5 bullets
```
**Layout Context:**
- `lg:grid-cols-4` (4 columns on large screens)
- `text-xl` for service names
- `text-sm` for bullets
- Card-based layout with fixed heights

**Examples:**
- ✅ Good: "Monthly Bookkeeping" (18 chars)
- ❌ Too long: "Comprehensive Monthly Financial Bookkeeping Services" (52 chars)

## 🏢 Industries Section
```typescript
items: string[] // MAX: 15-20 chars per item, 4-8 items
```
**Layout Context:**
- `flex-wrap` layout with badges
- `text-base` font size
- Badge styling with padding

## 💰 Pricing Section
```typescript
name: string         // MAX: 20-25 characters
priceDisplay: string // MAX: 15-20 characters
ctaLabel: string     // MAX: 20-25 characters
includes: string[]   // MAX: 30-35 chars per item, 3-5 items
```

## 💬 Testimonials Section
```typescript
quote: string   // MAX: 120-150 characters
author: string  // MAX: 25-30 characters
company?: string // MAX: 30-35 characters
```
**Layout Context:**
- `md:grid-cols-2` (2 columns)
- `text-lg` for quotes
- Card-based layout

**Examples:**
- ✅ Good: "They cleaned up a year of books fast." (37 chars)
- ❌ Too long: "They provided exceptional service and cleaned up over a year of completely disorganized books in record time with amazing accuracy." (135+ chars)

## ✅ Why Choose Us Section
```typescript
bullets: string[] // MAX: 45-55 chars per bullet, 4-6 bullets
```
**Layout Context:**
- `md:grid-cols-2` layout
- `text-lg` font size
- Checkmark icons take space

## 📞 Contact Section
```typescript
phone: string        // MAX: 20 characters
email: string        // MAX: 35 characters
address: string      // MAX: 50 characters
primaryCta.label: string // MAX: 30 characters
```

## 📝 Blog Section
```typescript
title: string    // MAX: 50-60 characters
excerpt?: string // MAX: 80-100 characters
```
**Layout Context:**
- `md:grid-cols-2` layout
- `text-xl` for titles
- Card-based layout

## 🦶 Footer Section
```typescript
brand: string    // MAX: 30 characters
links[].label: string // MAX: 15-20 chars per link, 3-6 links
```

---

## 📏 General Rules

### Character Count Estimation
- **English**: ~5 characters per word (including spaces)
- **Headlines**: Aim for 6-12 words
- **Descriptions**: Aim for 15-25 words
- **Bullets**: Aim for 4-8 words

### Typography Scale Impact
- `text-6xl` (Hero): Very restrictive, keep short
- `text-4xl` (Section headers): Moderately restrictive
- `text-xl` (Subheadings): More flexible
- `text-lg` (Body): Most flexible
- `text-sm` (Bullets/Details): Can be longer but should be concise

### Layout Constraints
- **Grid layouts**: Text must fit within column width
- **Card layouts**: Fixed heights can cause overflow
- **Flex-wrap**: Too many long items create messy layouts
- **Mobile responsiveness**: Text that fits desktop may not fit mobile

### Testing Strategy
1. **Desktop first**: Test at 1440px width
2. **Mobile critical**: Test at 375px width (iPhone)
3. **Tablet check**: Test at 768px width
4. **Content variety**: Test with short and long content mixes

### Validation Tools
Consider adding to your duplication script:
- Character count validation
- Word count estimation
- Layout impact warnings 