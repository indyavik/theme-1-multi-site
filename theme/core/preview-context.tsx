/**
 * PREVIEW CONTEXT - Core Editing System
 * 
 * This is the central state management system for the theme's live editing capabilities.
 * It provides:
 * - Preview mode toggle (currently hardcoded to true - see PREVIEW_MODE_ENHANCEMENTS.md)
 * - Live field editing with real-time updates
 * - Section management (add/remove/reorder)
 * - Data persistence to backend via publish API
 * - Multi-site support with site-specific data loading
 * 
 * Key Components:
 * - PreviewProvider: Main context provider that wraps editable content
 * - PreviewToolbar: UI controls for preview mode and publishing
 * - SectionsRenderer: Renders sections with editing capabilities
 * - EditableSection: Individual section wrapper with add/remove controls
 * 
 * Usage: Wrap any page content with <PreviewProvider> to enable editing
 * 
 * TODO: UPDATE PREVIEW MODE LOGIC (Line 475)
 * Currently hardcoded to useState(true) - needs authentication-based logic
 * Should default to false and only enable with ?preview=true + authentication
 * See docs/PREVIEW_MODE_ENHANCEMENTS.md for implementation details
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl, SITE_SLUG, SITE_ID, getAuthHeader } from '@/theme/lib/theme-config';
import { LocalizedValue, FieldSchema, ExtendedFieldType, siteSchema } from '../site-schema';
import { EditableSection } from '@/theme/core/editable-section';

// Utility functions for deep object path operations
function get(obj: any, path: string): any {
  if (!path || typeof path !== 'string') {
    return undefined;
  }
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Locale resolution hierarchy
function resolveCurrentLocale(currentLocale?: string, initialData?: any): string {
  return currentLocale ||           // 1. Explicit prop
         initialData?._meta?.locale || // 2. Site data default  
         'en';                      // 3. System fallback
}

// Translation status detection
function getLocalizedValue(rawValue: any, locale: string): LocalizedValue {
  // Handle legacy string values (not yet localized)
  if (typeof rawValue === 'string') {
    return {
      value: rawValue,
      isTranslated: locale === 'en', // Assume legacy content is English
      isFallback: locale !== 'en',
      availableLocales: ['en']
    };
  }
  
  // Handle localized object values
  if (rawValue && typeof rawValue === 'object') {
    const availableLocales = Object.keys(rawValue);
    const hasCurrentLocale = locale in rawValue;
    const hasFallback = 'en' in rawValue;
    
    return {
      value: rawValue[locale] || rawValue['en'] || '',
      isTranslated: hasCurrentLocale,
      isFallback: !hasCurrentLocale && hasFallback,
      availableLocales
    };
  }
  
  return {
    value: '',
    isTranslated: false,
    isFallback: false,
    availableLocales: []
  };
}

// Immutable deep set utility (always returns a dense array, using base for missing items)
function set(obj: any, path: string, value: any, baseObj?: any): any {
  if (!path || typeof path !== 'string') return obj;
  const tokens = path.split('.');
  function inner(current: any, idx: number, base: any): any {
    const token = tokens[idx];
    const isLast = idx === tokens.length - 1;
    const tokenIsIndex = !isNaN(Number(token));
    if (isLast) {
      if (tokenIsIndex) {
        const orig = Array.isArray(current) ? current : [];
        const baseArr = Array.isArray(base) ? base : [];
        const maxLen = Math.max(orig.length, baseArr.length, Number(token) + 1);
        const arr = [];
        for (let i = 0; i < maxLen; i++) {
          if (i === Number(token)) {
            arr[i] = value;
          } else if (orig[i] !== undefined) {
            arr[i] = orig[i];
          } else if (baseArr[i] !== undefined) {
            arr[i] = baseArr[i];
          } else {
            arr[i] = undefined;
          }
        }
        return arr;
      } else {
        return { ...current, [token]: value };
      }
    }
    if (tokenIsIndex) {
      const orig = Array.isArray(current) ? current : [];
      const baseArr = Array.isArray(base) ? base : [];
      const maxLen = Math.max(orig.length, baseArr.length, Number(token) + 1);
      const arr = [];
      for (let i = 0; i < maxLen; i++) {
        if (i === Number(token)) {
          arr[i] = inner(orig[i], idx + 1, baseArr[i]);
        } else if (orig[i] !== undefined) {
          arr[i] = orig[i];
        } else if (baseArr[i] !== undefined) {
          arr[i] = baseArr[i];
        } else {
          arr[i] = undefined;
        }
      }
      return arr;
    } else {
      return {
        ...current,
        [token]: inner(current ? current[token] : undefined, idx + 1, base ? base[token] : undefined)
      };
    }
  }
  return inner(obj, 0, baseObj);
}

// Helper function to extract data from the new config structure
function extractDataFromConfig() {
  return {
    site: siteData.site,
    features: siteData.features,
    pages: siteData.pages,
    // For backward compatibility, also provide sections at root level
    sections: siteData.pages?.home?.sections || []
  }
}

// Helper function to create schema from config - Updated for new sectionTypes structure
function createSchemaFromConfig() {
  return {
    site: siteSchema.site,
    features: siteSchema.features,
    sectionTypes: siteSchema.sectionTypes,
    pages: siteSchema.pages,
    sections: (siteData.pages?.home?.sections || []).map((section: any) => {
      const sectionType = section.type;
      const baseSectionSchema: any = (siteSchema.sectionTypes as any)[sectionType]?.schema || {};
      const dataSchema: any = Object.fromEntries(
        Object.entries(baseSectionSchema).map(([key, fieldSchema]: [string, any]) => {
          if (fieldSchema && typeof fieldSchema === 'object' && fieldSchema.type === 'array') {
            const dataArray = (section.data as any)[key] || [];

            if (fieldSchema.itemSchema) {
              const itemTemplate = fieldSchema.itemSchema;
              const items = (Array.isArray(dataArray) ? dataArray : []).map(() => {
                if (itemTemplate && typeof itemTemplate === 'object' && !('type' in itemTemplate)) {
                  return Object.fromEntries(
                    Object.entries(itemTemplate).map(([ik, iv]: [string, any]) => [ik, iv])
                  );
                }
                return itemTemplate;
              });

              return [
                key,
                {
                  type: 'array',
                  editable: fieldSchema.editable,
                  description: fieldSchema.description,
                  items,
                },
              ];
            }

            const items = (Array.isArray(dataArray) ? dataArray : []).map(() => ({
              type: 'string',
              editable: true,
              description: 'Array item',
            }));

            return [
              key,
              {
                type: 'array',
                editable: fieldSchema.editable,
                description: fieldSchema.description,
                items,
              },
            ];
          }

          return [key, fieldSchema];
        })
      );

      return {
        id: section.id,
        type: section.type,
        enabled: section.enabled,
        order: section.order,
        data: dataSchema,
      };
    }),
  };
}

// Section configuration for available section types
// Removed hardcoded registry; we now read from schema.sectionTypes

function deriveDefaultFromFieldSchema(fieldSchema: any, fieldKey?: string): any {
  if (!fieldSchema || typeof fieldSchema !== 'object') return '';
  const key = (fieldKey || '').toLowerCase();
  switch (fieldSchema.type) {
    case 'string': {
      if (key.includes('name')) return 'Placeholder Name';
      if (key.includes('title')) return 'Placeholder Title';
      if (key.includes('subtitle')) return 'Placeholder Subtitle';
      if (key.includes('description') || key.includes('excerpt')) return 'Placeholder description...';
      if (key.includes('price')) return '$$';
      if (key.includes('email')) return 'email@example.com';
      if (key.includes('phone')) return '(555) 000-0000';
      if (key.includes('address')) return '123 Main St';
      if (key.includes('date')) return '2024-01-01';
      if (key.includes('company')) return 'Company';
      if (key.includes('slug')) return 'placeholder-slug';
      if (key.includes('message')) return 'Placeholder message';
      if (key.includes('label')) return 'Click me';
      if (key === 'href') return '#';
      return '';
    }
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'image':
      return '';
    case 'array': {
      return [];
    }
    default:
      return '';
  }
}

function deriveDefaultItemFromItemSchema(itemSchema: any): any {
  if (!itemSchema) return '';
  if (itemSchema && typeof itemSchema === 'object' && !('type' in itemSchema)) {
    // Complex item object
    return Object.fromEntries(
      Object.entries(itemSchema).map(([k, v]: [string, any]) => [k, deriveDefaultFromFieldSchema(v, k)])
    );
  }
  // Simple primitive item
  return deriveDefaultFromFieldSchema(itemSchema);
}

function deriveDefaultDataFromSectionSchema(sectionSchema: any): any {
  if (!sectionSchema || typeof sectionSchema !== 'object') return {};
  const result: any = {};
  Object.entries(sectionSchema).forEach(([key, fieldSchema]: [string, any]) => {
    if (fieldSchema?.type === 'array') {
      if (fieldSchema.itemSchema) {
        result[key] = [deriveDefaultItemFromItemSchema(fieldSchema.itemSchema)];
      } else {
        result[key] = [];
      }
    } else if (fieldSchema && typeof fieldSchema === 'object' && !('type' in fieldSchema)) {
      result[key] = Object.fromEntries(
        Object.entries(fieldSchema).map(([nk, nv]: [string, any]) => [nk, deriveDefaultFromFieldSchema(nv, nk)])
      );
    } else {
      result[key] = deriveDefaultFromFieldSchema(fieldSchema, key);
    }
  });
  return result;
}

function resolveArraySchema(arrayPath: string, schema: any, pageType?: string): any {
  if (!arrayPath.startsWith('sections.')) return null;
  const parts = arrayPath.split('.');
  const sectionId = parts[1];
  const fieldPath = parts.slice(2);
  
  // Get section type from live sections
  const section = getSectionsFromState().find((s: any) => s.id === sectionId);
  const sectionType = section?.type;
  
  if (!sectionType) return null;
  
  // Resolve from sectionTypes schema
  let node: any = (schema as any)?.sectionTypes?.[sectionType]?.schema;
  
  for (let i = 0; i < fieldPath.length; i++) {
    const token = fieldPath[i];
    if (!node) return null;
    node = node[token];
  }
  return node;
}

// This will be replaced with actual sections state in the provider
let getSectionsFromState: () => any[] = () => [];

function resolveArrayItemSchema(arrayPath: string, schema: any, pageType?: string): any {
  // Expect arrayPath like: sections.services.items or sections[.id].items
  if (!arrayPath.startsWith('sections.')) return null;
  const parts = arrayPath.split('.');
  const sectionId = parts[1];
  const fieldPath = parts.slice(2); // e.g., ['items'] or nested
  
  // Get section type from live sections
  const section = getSectionsFromState().find((s: any) => s.id === sectionId);
  const sectionType = section?.type;
  
  if (!sectionType) return null;
  
  // Resolve from sectionTypes schema
  let node: any = (schema as any)?.sectionTypes?.[sectionType]?.schema;
  
  for (let i = 0; i < fieldPath.length; i++) {
    const token = fieldPath[i];
    if (!node) return null;
    if (node.type === 'array') {
      // next token should be the array field name or index; if index skip, use itemSchema
      const maybeIndex = token;
      const isIndex = !isNaN(Number(maybeIndex));
      if (isIndex) {
        node = node.itemSchema || { type: 'string', editable: true };
        continue;
      }
    }
    node = node[token];
  }
  // If the target node is an array, return its itemSchema; else return node
  if (node?.type === 'array') return node.itemSchema || { type: 'string', editable: true };
  return node;
}

function getArrayFromLiveState(arrayPath: string, getSectionsFn: () => any[]): any[] {
  if (!arrayPath.startsWith('sections.')) return [];
  const parts = arrayPath.split('.');
  const sectionId = parts[1];
  const innerPath = parts.slice(2).join('.');
  const section = getSectionsFn().find((s: any) => s.id === sectionId);
  if (!section) {
    console.warn(`Section not found for ID: ${sectionId}`);
    return [];
  }
  const arr = get(section.data, innerPath);
  //console.log(`getArrayFromLiveState: ${arrayPath} -> sectionId: ${sectionId}, innerPath: ${innerPath}, arr:`, arr);
  return Array.isArray(arr) ? arr : [];
}

interface PreviewContextType {
  isPreviewMode: boolean;
  setIsPreviewMode: (enabled: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  editedData: Record<string, any>;
  updateField: (path: string, value: any) => void;
  getValue: (path: string) => any;
  publishChanges: () => Promise<void>;
  discardChanges: () => void;
  hasChanges: boolean;
  isFieldEditable: (path: string) => boolean;
  
  // Locale support
  currentLocale: string;
  availableLocales: string[];
  setCurrentLocale: (locale: string) => void;
  getTranslationStatus: (path: string) => LocalizedValue;
  createTranslation: (path: string, locale: string, value: string) => void;
  
  // Schema-driven UI
  getFieldSchema: (path: string) => FieldSchema | null;
  
  // Section operations (enhanced with region support)
  addSection: (sectionType: string, region?: string, position?: number) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, newPosition: number) => void;
  getAvailableSections: () => Record<string, any>;
  getSections: (region?: string) => any[];
  
  // Array item operations
  addArrayItem: (arrayPath: string) => void;
  removeArrayItem: (arrayPath: string, index: number) => void;
  moveArrayItem: (arrayPath: string, from: number, to: number) => void;
  canAddArrayItem: (arrayPath: string) => boolean;
}

const PreviewContext = createContext<PreviewContextType | null>(null);

interface PreviewProviderProps {
  children: ReactNode;
  initialData: any;
  schema: any;
  siteSlug?: string;
  pageType?: string; // optional page context to scope picker
  currentLocale?: string; // optional locale override
  contextSlug?: string; // generic context slug for sub-pages (service, product, category, etc.)
}

function isPlainObject(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function deepMerge(target: any, source: any): any {
  // If either is array, handle specially
  if (Array.isArray(target) || Array.isArray(source)) {
    if (Array.isArray(target) && Array.isArray(source)) {
      // Heuristic: if source is dense (no holes/undefined), treat as replacement (used for add/remove/move)
      // If source is sparse (only some indices provided), treat as overlay by index (used for single-item edits)
      const isSparse = (arr: any[]): boolean => {
        for (let i = 0; i < arr.length; i++) {
          if (!(i in arr)) return true; // hole
          if (arr[i] === undefined) return true;
        }
        return false;
      };
      if (!isSparse(source)) {
        return [...source];
      }
      const maxLen = Math.max(target.length, source.length);
      const merged: any[] = new Array(maxLen);
      for (let i = 0; i < maxLen; i++) {
        const tVal = target[i];
        const sVal = source[i];
        if (sVal === undefined) {
          merged[i] = tVal;
        } else if (tVal === undefined) {
          merged[i] = sVal;
        } else {
          merged[i] = deepMerge(tVal, sVal);
        }
      }
      return merged;
    }
    // If only source is array, clone it; if only target is array, prefer source
    if (Array.isArray(source)) return [...source];
    return source;
  }

  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source;
  }

  const result: any = { ...target };
  Object.keys(source).forEach((key) => {
    const t = (target as any)[key];
    const s = (source as any)[key];
    if (Array.isArray(s) || Array.isArray(t)) {
      result[key] = deepMerge(Array.isArray(t) ? t : [], Array.isArray(s) ? s : []);
    } else if (isPlainObject(t) && isPlainObject(s)) {
      result[key] = deepMerge(t, s);
    } else {
      result[key] = s;
    }
  });
  return result;
}

export function PreviewProvider({ children, initialData, schema, siteSlug, pageType, currentLocale: propLocale, contextSlug }: PreviewProviderProps) {
  // TODO: UPDATE PREVIEW MODE LOGIC
  // Currently hardcoded to true - needs authentication-based logic
  // See docs/PREVIEW_MODE_ENHANCEMENTS.md for implementation details
  // Should default to false and only enable with ?preview=true + authentication
  const [isPreviewMode, setIsPreviewMode] = useState(true); // 🔥 Force preview mode for toolbar integration
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  // Tracks structural changes like add/remove/move section so Publish appears even with no field edits
  const [hasStructuralChanges, setHasStructuralChanges] = useState(false);
  
  // Feature flag: Toggle between theme-based publish and wrapper-based publish
  // Set to true to use new hybrid approach, false for legacy approach
  const USE_HYBRID_PUBLISH = true; // Manual toggle for testing
  
  // Determine context property name based on page type
  const getContextProperty = () => {
    switch (pageType) {
      case 'service-detail': return 'serviceSlug';
      case 'product-detail': return 'productSlug';
      case 'category-detail': return 'categorySlug';
      default: return null;
    }
  };
  
  const contextProperty = getContextProperty();
  
  // Load sections based on pageType
  const getInitialSections = () => {
    if (pageType && initialData.pages?.[pageType]?.sections) {
      return initialData.pages[pageType].sections;
    }
    // Fallback to root-level sections for backward compatibility
    return initialData.sections || [];
  };
  
  const [sections, setSections] = useState(getInitialSections());
  
  // Locale state
  const resolvedLocale = resolveCurrentLocale(propLocale, initialData);
  const [currentLocale, setCurrentLocale] = useState(resolvedLocale);
  const availableLocales = initialData._meta?.availableLocales || ['en'];
  
  // Replace the getSectionsFromState helper
  getSectionsFromState = () => sections;

  const updateField = (path: string, value: any) => {
    console.log(`updateField: ${path} =`, value);
    
    // Check if this field is localized
    const fieldSchema = getFieldSchema(path);
    
    setEditedData(prev => {
      let processedValue = value;
      
      // Handle localized fields
      if (fieldSchema?.localized) {
        // Get current localized object or create new one
        const currentValue = get(prev, path) || get(initialData, path) || {};
        const localizedObject = typeof currentValue === 'string' 
          ? { en: currentValue } // Migrate legacy string to localized object
          : { ...currentValue };
        
        // Update the specific locale
        localizedObject[currentLocale] = value;
        processedValue = localizedObject;
      }
      
      // Check if we're editing the first item of an array
      const isFirstItemEdit = path.match(/^sections\.[^.]+\.[^.]+\.0($|\.)/);
      
      if (isFirstItemEdit) {
        // Extract the array path (e.g., "sections.services.items" from "sections.services.items.0.name")
        const pathParts = path.split('.');
        const arrayPath = pathParts.slice(0, -1).join('.'); // Remove the field name if present
        const isDirectFirstItem = pathParts[pathParts.length - 1] === '0'; // Direct array item vs field in first item
        const actualArrayPath = isDirectFirstItem ? arrayPath : pathParts.slice(0, -2).join('.');
        
        console.log(`First item edit detected. Path: ${path}, Array path: ${actualArrayPath}`);
        
        // Get current live array state
        const currentArray = getArrayFromLiveState(actualArrayPath, () => {
          return sections.map((section: any) => {
            const sectionEdits = get(prev, `sections.${section.id}`);
            if (sectionEdits) {
              const mergedData = deepMerge(section.data, sectionEdits);
              return { ...section, data: mergedData };
            }
            return section;
          });
        });
        
        console.log(`Current array state for ${actualArrayPath}:`, currentArray);
        
        // Save other items (items 1, 2, 3, etc.)
        const otherItems = currentArray.slice(1);
        console.log(`Saved other items:`, otherItems);
        
        // Apply the edit normally
        const newData = set(prev, path, processedValue, initialData);
        
        // If we have other items to preserve, reconstruct the full array
        if (otherItems.length > 0) {
          // Get the original first item from current state
          const originalFirstItem = currentArray[0];
          console.log(`Original first item:`, originalFirstItem);
          
          // Apply the specific field edit to the original first item
          // Extract just the field path within the first item
          const pathParts = path.split('.');
          const fieldPathInItem = pathParts.slice(4).join('.'); // Remove "sections.sectionId.arrayField.0"
          console.log(`Field path in item: ${fieldPathInItem}`);
          
          // Create updated first item by merging the edit with the original item
          let updatedFirstItem;
          if (fieldPathInItem) {
            // It's a field within the item (e.g., "name", "price", "description")
            updatedFirstItem = { ...originalFirstItem };
            if (fieldPathInItem.includes('.')) {
              // Nested field (like "cta.label")
              updatedFirstItem = set({}, fieldPathInItem, value, originalFirstItem);
              updatedFirstItem = deepMerge(originalFirstItem, updatedFirstItem);
            } else {
            // Simple field
            updatedFirstItem[fieldPathInItem] = processedValue;
            }
          } else {
            // Direct item replacement (rare case)
            updatedFirstItem = processedValue;
          }
          
          console.log(`Updated first item with preserved fields:`, updatedFirstItem);
          
          // Reconstruct array: updated first item + preserved other items
          const reconstructedArray = [updatedFirstItem, ...otherItems];
          console.log(`Reconstructed array:`, reconstructedArray);
          
          // Set the complete array
          const finalData = set(newData, actualArrayPath, reconstructedArray, initialData);
          
          // Auto-save to localStorage for persistence
          if (typeof window !== 'undefined') {
            const storageKey = `preview-${siteSlug || 'default'}`;
            localStorage.setItem(storageKey, JSON.stringify(finalData));
          }
          
          return finalData;
        }
      }
      
      // Normal edit handling for non-first-item edits
      const newData = set(prev, path, processedValue, initialData);
      // Auto-save to localStorage for persistence
      if (typeof window !== 'undefined') {
        const storageKey = `preview-${siteSlug || 'default'}`;
        localStorage.setItem(storageKey, JSON.stringify(newData));
      }
      return newData;
    });
  };

  // Schema-driven field resolution
  const getFieldSchema = (path: string): FieldSchema | null => {
    try {
      if (!schema) return null;

      // Site-level fields like "site.brand" or "features.blogEnabled"
      if (!path.startsWith('sections.')) {
        const fieldSchema = get(schema, path);
        return fieldSchema || null;
      }

      // Section fields like "sections.services.items.0.price"
      const parts = path.split('.');
      const sectionId = parts[1];
      const fieldPathTokens = parts.slice(2);

      // Get section type from live sections
      const section = getSections().find((s: any) => s.id === sectionId);
      const sectionType = section?.type;

      if (!sectionType) return null;

      // Look up the schema from sectionTypes
      const baseSectionSchema: any = (schema as any)?.sectionTypes?.[sectionType]?.schema;
      if (!baseSectionSchema) return null;

      // Walk the schema following the field path tokens
      let node: any = baseSectionSchema;
      for (let i = 0; i < fieldPathTokens.length; i++) {
        const token = fieldPathTokens[i];
        if (!node) return null;

        // If current node defines an array field, handle numeric indices via itemSchema
        if (node && typeof node === 'object' && node.type === 'array') {
          const maybeIndex = token;
          const isIndex = !isNaN(Number(maybeIndex));
          if (isIndex) {
            // Move into item schema if available
            node = node.itemSchema || { editable: true };
            continue;
          }
        }

        // Regular object traversal
        node = node[token];
      }

      return node || null;
    } catch {
      return null;
    }
  };

  const getValue = (path: string): any => {
    const fieldSchema = getFieldSchema(path);
    const editedValue = get(editedData, path);
    const rawValue = editedValue !== undefined ? editedValue : get(initialData, path);

    // Handle localized fields - return the actual string value, not the LocalizedValue object
    if (fieldSchema?.localized) {
      const localizedValue = getLocalizedValue(rawValue, currentLocale);
      return localizedValue.value;
    }

    // Support section-scoped paths like "sections.{sectionId}.items.0.name"
    if (path.startsWith('sections.')) {
      const parts = path.split('.');
      const sectionId = parts[1];
      const innerPath = parts.slice(2).join('.');
      const section = getSections().find((s: any) => s.id === sectionId);
      if (!section) return undefined;
      if (!innerPath) return section;
      return get(section.data, innerPath);
    }

    return rawValue;
  };

  const getSections = (region?: string): any[] => {
    // Return sections with any edits applied
    let filteredSections = sections;
    
    // Filter by region if specified
    if (region) {
      filteredSections = sections.filter((section: any) => section.region === region);
    }
    
    return filteredSections.map((section: any) => {
      // Get all edits for this section (both section-level and field-level)
      const sectionEdits = get(editedData, `sections.${section.id}`);
      if (sectionEdits) {
        const mergedData = deepMerge(section.data, sectionEdits);
        return { ...section, data: mergedData };
      }
      return section;
    });
  };

  // Locale-aware methods
  const getTranslationStatus = (path: string): LocalizedValue => {
    const fieldSchema = getFieldSchema(path);
    const rawValue = get(editedData, path) || get(initialData, path);
    
    if (fieldSchema?.localized) {
      return getLocalizedValue(rawValue, currentLocale);
    }
    
    // Non-localized field
    return {
      value: typeof rawValue === 'string' ? rawValue : String(rawValue || ''),
      isTranslated: true,
      isFallback: false,
      availableLocales: ['en']
    };
  };

  const createTranslation = (path: string, locale: string, value: string) => {
    const fieldSchema = getFieldSchema(path);
    if (!fieldSchema?.localized) return;
    
    const currentValue = get(editedData, path) || get(initialData, path) || {};
    const localizedObject = typeof currentValue === 'string' 
      ? { en: currentValue } // Migrate legacy string to localized object
      : { ...currentValue };
    
    localizedObject[locale] = value;
    updateField(path, localizedObject);
  };

  const addSection = (sectionType: string, region: string = 'main', position?: number) => {
    const registry = (schema as any)?.sectionTypes || {};
    const meta = registry[sectionType] as any;
    if (!meta) return;

    const defaultData = meta.defaultData || deriveDefaultDataFromSectionSchema(meta.schema);

    // For singleton, id should match sectionType to align with schema lookups;
    // For non-singleton, generate a unique id while keeping type for schema lookups.
    const baseId = meta.singleton ? sectionType : `${sectionType}-${Date.now()}`;
    const newId = contextSlug && contextProperty ? `${contextSlug}-${baseId}` : baseId;

    const newSection: any = {
      id: newId,
      type: sectionType,
      enabled: true,
      region: region,
      order: position !== undefined ? position * 10 : (sections.length + 1) * 10,
      data: defaultData,
    };

    // Add context property for sub-pages (serviceSlug, productSlug, etc.)
    if (contextSlug && contextProperty) {
      newSection[contextProperty] = contextSlug;
    }

    setSections((prev: any) => {
      const newSections = [...prev];
      if (position !== undefined) {
        newSections.splice(position, 0, newSection);
        return newSections.map((section: any, index: number) => ({ ...section, order: (index + 1) * 10 }));
      } else {
        newSections.push(newSection);
        return newSections;
      }
    });
    // Mark structural change
    setHasStructuralChanges(true);

    // Don't call updateField here - it would overwrite individual field edits!
    // The sections state is the source of truth for section structure,
    // while editedData contains individual field edits that get merged in getSections()
  };

  const removeSection = (sectionId: string) => {
    setSections((prev: any) => {
      const nextSections = prev.filter((section: any) => section.id !== sectionId);
      return nextSections;
    });
    
    // Remove any field edits for the deleted section
    setEditedData(prevData => {
      const newData = { ...prevData };
      // Remove section-specific edits (e.g., sections.hero-main.*)
      Object.keys(newData).forEach(key => {
        if (key.startsWith(`sections.${sectionId}.`) || key === `sections.${sectionId}`) {
          delete newData[key];
        }
      });
      return newData;
    });
    // Mark structural change
    setHasStructuralChanges(true);
  };

  const moveSection = (sectionId: string, newPosition: number) => {
    setSections((prev: any) => {
      const currentIndex = prev.findIndex((section: any) => section.id === sectionId);
      if (currentIndex === -1 || newPosition === currentIndex) return prev;
      
      // Create new array with moved section
      const nextSections = [...prev];
      const [movedSection] = nextSections.splice(currentIndex, 1);
      nextSections.splice(newPosition, 0, movedSection);
      
      // Update order property based on new positions
      const reorderedSections = nextSections.map((section: any, index: number) => ({
        ...section,
        order: (index + 1) * 10
      }));
      
      return reorderedSections;
    });
    // Mark structural change
    setHasStructuralChanges(true);
    
    // Don't overwrite editedData - section moves should preserve field edits
    // The sections state handles the structure, editedData contains field edits
  };

  // Array editing APIs
  const addArrayItem = (arrayPath: string) => {
    const current = getArrayFromLiveState(arrayPath, getSections);
    const arraySchema = resolveArraySchema(arrayPath, schema, pageType);
    const maxItems = arraySchema?.maxItems as number | undefined;
    if (typeof maxItems === 'number' && current.length >= maxItems) {
      return;
    }
    const itemSchema = arraySchema?.itemSchema || resolveArrayItemSchema(arrayPath, schema, pageType);
    const newItem = deriveDefaultItemFromItemSchema(itemSchema);
    const next = [...current, newItem];
    updateField(arrayPath, next);
  };

  const canAddArrayItem = (arrayPath: string): boolean => {
    const current = getArrayFromLiveState(arrayPath, getSections);
    const arraySchema = resolveArraySchema(arrayPath, schema, pageType);
    const maxItems = arraySchema?.maxItems as number | undefined;
    if (typeof maxItems === 'number') {
      return current.length < maxItems;
    }
    return true;
  };

  const removeArrayItem = (arrayPath: string, index: number) => {
    const current = getArrayFromLiveState(arrayPath, getSections);
    if (!Array.isArray(current) || index < 0 || index >= current.length) return;
    const next = current.filter((_: any, i: number) => i !== index);
    updateField(arrayPath, next);
  };

  const moveArrayItem = (arrayPath: string, from: number, to: number) => {
    const current = getArrayFromLiveState(arrayPath, getSections);
    if (!Array.isArray(current) || from === to || from < 0 || from >= current.length || to < 0 || to >= current.length) return;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateField(arrayPath, next);
  };

  const getAvailableSections = () => {
    const registry = (schema as any)?.sectionTypes || {};
    
    // For sub-pages, only check sections for the current context
    let relevantSections = sections;
    if (contextSlug && contextProperty) {
      relevantSections = sections.filter((section: any) => section[contextProperty] === contextSlug);
    }
    
    const currentSectionTypes = relevantSections.map((section: any) => section.type);

    // Optional page-scoped allowlist
    const allowed = pageType ? (schema as any)?.pages?.[pageType]?.allowedSectionTypes : undefined;

    const sectionsWithStatus: Record<string, any> = {};
    Object.entries(registry).forEach(([typeKey, meta]: [string, any]) => {
      if (Array.isArray(allowed) && !allowed.includes(typeKey)) return; // filtered out for this page
      const isAdded = currentSectionTypes.includes(typeKey);
      const canAdd = meta.singleton ? !isAdded : true;
      sectionsWithStatus[typeKey] = {
        displayName: meta.displayName,
        description: meta.description,
        isAdded,
        canAdd,
      };
    });

    return sectionsWithStatus;
  };

  const publishChanges = async () => {
    try {
      if (USE_HYBRID_PUBLISH) {
        // NEW: Hybrid approach - let wrapper handle publish
        console.log('Theme: Using hybrid publish approach - requesting payload');
        
        // Build publish-ready payload
        const payloadSiteData = buildPublishPayload({
          baseSiteData: initialData,
          initialData,
          editedData,
          pageType: pageType || 'home',
          currentLocale,
          getSections,
        });

        // Send publish payload to wrapper app
        if (typeof window !== 'undefined') {
          window.parent.postMessage({
            type: 'PUBLISH_PAYLOAD_READY',
            data: {
              payloadSiteData,
              siteSlug: siteSlug || SITE_SLUG,
              siteId: SITE_ID,
              currentLocale
            }
          }, '*');
        }
        return; // Exit early - wrapper will handle the rest
      }

      // LEGACY: Original publish approach (direct from theme)
      console.log('Theme: Using legacy publish approach - handling directly');
      
      // 🔥 NEW: Notify toolbar that publishing started
      if (typeof window !== 'undefined') {
        window.parent.postMessage({
          type: 'PUBLISH_START',
          data: {}
        }, '*');
      }

      // Build publish-ready siteData:
      // - Clone base site data
      // - Overwrite only the current page's sections with merged live sections
      // - Flatten localized values to plain strings for the active locale
      const payloadSiteData = buildPublishPayload({
        baseSiteData: initialData,
        initialData,
        editedData,
        pageType: pageType || 'home',
        currentLocale,
        getSections,
      });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(getAuthHeader() || {}),
      };

      const payload: any = {
        siteData: payloadSiteData,
        publish: true,
      };
      if (SITE_SLUG) payload.siteSlug = SITE_SLUG;
      else if (siteSlug) payload.siteSlug = siteSlug;
      if (SITE_ID) payload.siteId = SITE_ID;

      console.log('📝 Publish payload:', {
        siteSlug: payload.siteSlug,
        hasSiteData: !!payload.siteData,
        sectionsCount: payload.siteData?.pages?.home?.sections?.length || 0,
        editedDataKeys: Object.keys(editedData),
        apiUrl: getApiUrl('/api/sites/publish')
      });

      const res = await fetch(getApiUrl('/api/sites/publish'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });



      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Publish failed: ${res.status}`);
      }

      // 🔥 NEW: Notify toolbar of success
      if (typeof window !== 'undefined') {
        window.parent.postMessage({
          type: 'PUBLISH_SUCCESS',
          data: {}
        }, '*');
      }

      // On success: reset edits and autosave
      setEditedData({});
      setHasStructuralChanges(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`preview-${siteSlug || 'default'}`);
      }
    } catch (error) {
      console.error('Error publishing changes:', error);
      
      // 🔥 NEW: Notify toolbar of error
      if (typeof window !== 'undefined') {
        window.parent.postMessage({
          type: 'PUBLISH_ERROR',
          data: { 
            error: error instanceof Error ? error.message : String(error)
          }
        }, '*');
      }
    }
  };

  const discardChanges = () => {
    console.log('Theme: Discarding changes, preserving original data structure');
    setEditedData({});
    // Reset sections to original page-specific sections, not root-level sections
    const originalSections = getInitialSections();
    setSections(originalSections);
    setHasStructuralChanges(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`preview-${siteSlug || 'default'}`);
    }
    
    // Send updated data back to toolbar with clean state
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.parent.postMessage({
          type: 'DISCARD_SUCCESS',
          data: {
            siteSlug,
            pageType,
            editedData: {},
            sections: getSections(),
            pages: initialData?.pages,
            isPreviewMode,
            sidebarOpen,
          }
        }, '*');
      }
    }, 100);
  };

  const hasChanges = hasStructuralChanges || Object.keys(editedData).length > 0;

  // Enhanced isFieldEditable using new sectionTypes structure
  const isFieldEditable = (path: string): boolean => {
    const fieldSchema = getFieldSchema(path);
    return fieldSchema?.editable === true;
  };

  // 🔥 NEW: Listen for commands from toolbar app
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, verify origin for security
      // if (event.origin !== 'http://localhost:3001') return;
      
      const { type, data } = event.data;
      console.log('Theme: Received message:', type, data);

      switch (type) {
        case 'ACTIVATE_EDITING':
          console.log('Theme: Activating editing mode');
          setIsPreviewMode(true);
          if (data.open !== undefined) {
            setSidebarOpen(data.open);
          }
          break;
          
        case 'DEACTIVATE_EDITING':
          setIsPreviewMode(false);
          break;
          
        case 'TOGGLE_EDITING':
          setIsPreviewMode(prev => !prev);
          break;
          
        case 'TOGGLE_SIDEBAR':
          setSidebarOpen(data.open);
          break;
          
        case 'ADD_SECTION':
          addSection(data.sectionType, data.position);
          break;
          
        case 'REMOVE_SECTION':
          removeSection(data.sectionId);
          break;
          
        case 'NAVIGATE':
          window.location.href = data.url;
          break;
          
        case 'PUBLISH_CHANGES':
          publishChanges();
          break;
          
        case 'DISCARD_CHANGES':
          discardChanges();
          break;
        
        case 'PUBLISH_SUCCESS':
          // Handle successful publish received from wrapper
          console.log('Theme: Received publish success from wrapper');
          setEditedData({});
          setHasStructuralChanges(false);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`preview-${siteSlug || 'default'}`);
          }
          // Notify parent about success
          if (typeof window !== 'undefined') {
            window.parent.postMessage({
              type: 'PUBLISH_SUCCESS',
              data: {}
            }, '*');
          }
          break;
          
        case 'PUBLISH_ERROR':
          // Handle publish error received from wrapper
          console.error('Theme: Received publish error from wrapper:', data.error);
          if (typeof window !== 'undefined') {
            window.parent.postMessage({
              type: 'PUBLISH_ERROR',
              data: { 
                error: data.error
              }
            }, '*');
          }
          break;
          
        case 'SCROLL_TO_SECTION':
        case 'SCROLL_TO_ELEMENT':
          // Handle section navigation
          const elementId = data.sectionId || data.elementId;
          console.log(`Theme: Received scroll request for section: ${elementId}`);
          
          if (elementId) {
            // Try multiple ID formats that might be used
            const possibleIds = [
              elementId,                    // Direct ID (e.g., "about")
              `section-${elementId}`,      // Section ID format (e.g., "section-about")
              `#${elementId}`,             // CSS selector format
              `#section-${elementId}`      // CSS selector with section prefix
            ];
            
            console.log(`Theme: Trying IDs:`, possibleIds);
            
            let element = null;
            for (const id of possibleIds) {
              console.log(`Theme: Looking for element with ID: ${id}`);
              element = document.getElementById(id) || document.querySelector(id);
              if (element) {
                console.log(`Theme: Found element with ID: ${id}`, element);
                break;
              }
            }
            
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              console.log(`Theme: Scrolled to section: ${elementId}`);
            } else {
              console.log(`Theme: Could not find section with ID: ${elementId}`);
              console.log(`Theme: Available elements with IDs:`, 
                Array.from(document.querySelectorAll('[id]')).map(el => el.id)
              );
              
              // Try to find by section type or other patterns as fallback
              const possibleSelectors = [
                `[data-section-id="${elementId}"]`,
                `[data-section="${elementId}"]`,
                `.${elementId}`,
                `section[id*="${elementId}"]`
              ];
              
              console.log(`Theme: Trying fallback selectors:`, possibleSelectors);
              
              for (const selector of possibleSelectors) {
                const found = document.querySelector(selector);
                if (found) {
                  found.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  console.log(`Theme: Found section via selector: ${selector}`);
                  break;
                }
              }
            }
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addSection, removeSection, publishChanges]);

  // 🔥 NEW: Send data to toolbar app when ready
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sections = getSections();
      console.log('Theme: Available sections:', sections);
      console.log('Theme: Section IDs:', sections.map(s => s.id));
      console.log('Theme: Initial data pages:', initialData?.pages);
      
      // Send initial data to toolbar app with complete theme data
      window.parent.postMessage({
        type: 'THEME_READY',
        data: {
          siteSlug,
          pageType,
          editedData,
          sections: sections,
          pages: initialData?.pages, // Include the complete pages structure
          isPreviewMode,
          sidebarOpen,
        }
      }, '*');
    }
  }, [siteSlug, pageType, getSections, initialData]);

  // 🔥 NEW: Send updates when data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.parent.postMessage({
        type: 'THEME_UPDATED',
        data: {
          siteSlug,
          pageType,
          editedData,
          sections: getSections(),
          pages: initialData?.pages, // Include the complete pages structure
          isPreviewMode,
          sidebarOpen,
        }
      }, '*');
    }
  }, [editedData, getSections, isPreviewMode, sidebarOpen, initialData]);

  const contextValue: PreviewContextType = {
    isPreviewMode,
    setIsPreviewMode,
    sidebarOpen,
    setSidebarOpen,
    editedData,
    updateField,
    getValue,
    publishChanges,
    discardChanges,
    hasChanges,
    isFieldEditable,
    
    // Locale support
    currentLocale,
    availableLocales,
    setCurrentLocale,
    getTranslationStatus,
    createTranslation,
    
    // Schema-driven UI
    getFieldSchema,
    
    // Section operations (enhanced with region support)
    addSection,
    removeSection,
    moveSection,
    getAvailableSections,
    getSections,
    
    // Array item operations
    addArrayItem,
    removeArrayItem,
    moveArrayItem,
    canAddArrayItem
  };

  return (
    <PreviewContext.Provider value={contextValue}>
      <div
        className={`transition-[margin] duration-200`}
        style={{ marginLeft: isPreviewMode && sidebarOpen ? '16rem' : 0 }}
      >
        {children}
      </div>
    </PreviewContext.Provider>
  );
}

export function usePreviewContext(): PreviewContextType {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreviewContext must be used within a PreviewProvider');
  }
  return context;
}

// Section picker modal component
export function SectionPicker({ isOpen, onClose, onSelect }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionType: string) => void;
}) {
  const { getAvailableSections } = usePreviewContext();
  const sectionsWithStatus = getAvailableSections();

  if (!isOpen) return null;

  const entries = Object.entries(sectionsWithStatus);
  const available = entries.filter(([, config]) => config.canAdd);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Add New Section</h3>

        {available.length === 0 ? (
          <div className="text-sm text-gray-600">
            No sections are available to add.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map(([key, config]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 ${
                  config.canAdd 
                    ? 'hover:bg-gray-50 cursor-pointer border-gray-200' 
                    : 'bg-gray-100 cursor-not-allowed border-gray-300'
                }`}
                onClick={() => {
                  if (config.canAdd) {
                    onSelect(key);
                    onClose();
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-medium ${config.canAdd ? 'text-gray-900' : 'text-gray-500'}`}>
                    {config.displayName}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    config.isAdded 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {config.isAdded ? 'Added' : 'Available'}
                  </span>
                </div>
                <p className={`text-sm ${config.canAdd ? 'text-gray-600' : 'text-gray-400'}`}>
                  {config.description}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Sections Renderer component - handles all section rendering logic automatically
export function SectionsRenderer({
  children,
  className = '',
  emptyStateLabel = "Add First Section", 
  bottomLabel = "Add Section at Bottom",
  filterSections,
  renderSection
}: {
  children?: React.ReactNode;
  className?: string;
  emptyStateLabel?: string;
  bottomLabel?: string;
  filterSections?: (sections: any[]) => any[];
  renderSection: (section: any, index: number) => React.ReactNode;
}) {
  const { getSections, isPreviewMode } = usePreviewContext();
  
  // Get sections and apply filtering if provided
  let sections = getSections();
  if (filterSections) {
    sections = filterSections(sections);
  }
  
  // Filter enabled sections and sort by order
  const enabledSections = sections
    .filter((section: any) => section.enabled)
    .sort((a: any, b: any) => a.order - b.order);

  return (
    <div className={className}>
      {children}
      
      {/* Add section at the very top if no sections */}
      {enabledSections.length === 0 && isPreviewMode && (
        <FloatingAddSection position={0} label={emptyStateLabel} className="mt-16" />
      )}
      
      {/* Render sections */}
      {enabledSections.map((section: any, index: number) => {
        // Determine section capabilities based on type and position
        const canRemove = section.type !== 'hero' && section.type !== 'footer';
        const canAddBefore = index > 0; // Can add before any section except the first
        const canAddAfter = true; // Can add after any section

        return (
          <EditableSection
            key={section.id}
            sectionId={section.id}
            sectionType={section.type}
            path={`sections.${section.id}`}
            sectionIndex={index}
            canRemove={canRemove}
            canAddBefore={canAddBefore}
            canAddAfter={canAddAfter}
          >
            {renderSection(section, index)}
          </EditableSection>
        );
      })}
      
      {/* Add section at the very bottom */}
      {enabledSections.length > 0 && isPreviewMode && (
        <FloatingAddSection 
          position={enabledSections.length} 
          label={bottomLabel} 
          className="mb-16" 
        />
      )}
    </div>
  );
}

// Floating Add Section component
function FloatingAddSection({ 
  position, 
  className = '',
  label = "Add First Section"
}: {
  position: number;
  className?: string;
  label?: string;
}) {
  const { isPreviewMode, addSection } = usePreviewContext();
  const [showSectionPicker, setShowSectionPicker] = useState(false);

  // If not in preview mode, don't render
  if (!isPreviewMode) {
    return null;
  }

  const handleSelectSection = (sectionType: string) => {
    addSection(sectionType, 'main', position);
    setShowSectionPicker(false);
  };

  return (
    <>
      <div className={`flex justify-center py-8 ${className}`}>
        <button
          className="border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 px-6 py-3 rounded-lg font-medium"
          onClick={() => setShowSectionPicker(true)}
        >
          <span className="inline-block w-5 h-5 mr-2">+</span>
          {label}
        </button>
      </div>

      {/* Section Picker Modal */}
      <SectionPicker 
        isOpen={showSectionPicker}
        onClose={() => setShowSectionPicker(false)}
        onSelect={handleSelectSection}
      />
    </>
  );
}

// ---------- Publish helpers ----------
// Build a publish-ready payload without changing site-data.json at rest.
// - Clones base site data
// - Overwrites only pages.[pageType].sections with the merged live sections
// - Flattens localized values to plain strings using currentLocale (fallback 'en')
// - Removes any root-level 'sections' to avoid ambiguity
function buildPublishPayload(opts: {
  baseSiteData: any;
  initialData: any;
  editedData: any;
  pageType: string;
  currentLocale: string;
  getSections?: () => any[];
}): any {
  const { baseSiteData, initialData, editedData, pageType, currentLocale, getSections } = opts;

  // Merge edits into initial data first to avoid losing field edits when sections are added/moved
  const mergedData = deepMerge(initialData, editedData || {});

  // Start payload from base to preserve fields not part of the current page
  let payload = deepMerge(baseSiteData, mergedData);

  // Determine sections source (prefer live state via getSections to avoid stale/invalid shapes)
  let rawSections: any = undefined;
  try {
    rawSections = getSections ? getSections() : undefined;
  } catch {}
  if (!Array.isArray(rawSections)) {
    rawSections = pageType === 'home'
      ? (mergedData as any)?.sections || (mergedData as any)?.pages?.home?.sections || []
      : (mergedData as any)?.pages?.[pageType]?.sections || [];
  }
  if (!Array.isArray(rawSections)) {
    rawSections = [];
  }

  // Flatten localized values to strings for publish
  const flattened = (rawSections as any[]).map((sec: any) => ({
    ...sec,
    data: flattenLocalizedForLocale(sec.data, currentLocale),
  }));

  // Overwrite only this page’s sections
  const targetPath = pageType === 'home' ? `pages.home.sections` : `pages.${pageType}.sections`;
  payload = set(payload, targetPath, flattened, payload);

  // Ensure no root-level 'sections' remains in final payload
  if ('sections' in payload) delete (payload as any).sections;

  return payload;
}

// Recursively convert any {locale: value} objects to a single string for the active locale
function flattenLocalizedForLocale(data: any, locale: string): any {
  if (Array.isArray(data)) {
    return data.map((item) => flattenLocalizedForLocale(item, locale));
  }
  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    const looksLikeLocalizedMap = keys.length > 0 && keys.every((k) => typeof (data as any)[k] === 'string');
    if (looksLikeLocalizedMap && (((data as any)['en']) !== undefined || (data as any)[locale] !== undefined)) {
      return (data as any)[locale] ?? (data as any)['en'] ?? '';
    }
    const out: any = {};
    for (const k of keys) out[k] = flattenLocalizedForLocale((data as any)[k], locale);
    return out;
  }
  return data;
}

// Simplified Preview toolbar component
export function PreviewToolbar() {
  const {
    isPreviewMode,
    setIsPreviewMode,
    publishChanges,
    discardChanges,
    editedData,
    sidebarOpen,
    setSidebarOpen,
    getValue,
  } = usePreviewContext();

  const router = useRouter();

  const changesCount = Object.keys(editedData).length;

  // Build a simple site tree from base site data for navigation
  const buildSiteTree = () => {
    const pages: Record<string, any> = getValue('pages') || {};
    const tree: Array<{ key: string; label: string; children?: Array<{ key: string; label: string; href: string }> }> = [];

    const routeFor = (pageType: string, slug?: string) => {
      if (pageType === 'home') return '/';
      if (pageType === 'about-us') return '/about-us';
      if (pageType === 'service-detail') return `/services/${slug || ''}`;
      return '/';
    };

    Object.keys(pages).forEach((pageKey) => {
      const pageSections = pages[pageKey]?.sections || [];

      if (pageKey === 'service-detail') {
        const sections = pageSections;
        const slugs = Array.from(new Set<string>(
          sections.map((s: any) => s.serviceSlug as string).filter((v: string): v is string => Boolean(v))
        ));
        const children = slugs.map((slug: string) => {
          const slugSections = sections.filter((s: any) => s.serviceSlug === slug);
          const sectionChildren = slugSections.map((sec: any) => ({
            key: `${pageKey}:${slug}:${sec.id}`,
            label: (siteSchema as any)?.sectionTypes?.[sec.type]?.displayName || sec.id,
            href: `${routeFor(pageKey, slug)}#section-${sec.id}`,
          }));
          return { key: `${pageKey}:${slug}`, label: slug, href: routeFor(pageKey, slug), children: sectionChildren } as any;
        });
        tree.push({ key: pageKey, label: 'Services', children });
      } else {
        const sectionChildren = pageSections.map((sec: any) => ({
          key: `${pageKey}:${sec.id}`,
          label: (siteSchema as any)?.sectionTypes?.[sec.type]?.displayName || sec.id,
          href: `${routeFor(pageKey)}#section-${sec.id}`,
        }));
        const label = pageKey === 'home' ? 'Home' : pageKey === 'about-us' ? 'About Us' : pageKey;
        tree.push({ key: pageKey, label, children: sectionChildren });
      }
    });

    return tree;
  };

  const siteTree = buildSiteTree();

  const handleNavigate = (href: string) => {
    try {
      router.push(href);
      // Keep sidebar open; user decides when to close it
    } catch {}
  };

  return (
    <>
      {/* Top preview strip */}
      <div className="fixed top-0 inset-x-0 z-50 bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-wide">PREVIEW MODE</span>
            <label className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={isPreviewMode}
                onChange={(e) => setIsPreviewMode(e.target.checked)}
                className="rounded w-4 h-4"
              />
              <span>{isPreviewMode ? 'Editing ON' : 'Editing OFF'}</span>
            </label>

            {changesCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 ml-3">
                <span className="text-[11px] text-blue-200">{changesCount} edit{changesCount !== 1 ? 's' : ''}</span>
                <button
                  onClick={publishChanges}
                  className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white text-[11px] rounded"
                >
                  Publish
                </button>
                <button
                  onClick={discardChanges}
                  className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white text-[11px] rounded"
                >
                  Discard
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Site tree"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Left sidebar */}
      {isPreviewMode && sidebarOpen && (
        <div className="fixed top-10 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto">
          <div className="p-3 border-b flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-700">⌘</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">Site Structure</div>
                <div className="text-[11px] text-gray-500 -mt-0.5">Pages and contexts</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600"
              title="Close"
            >
              ×
            </button>
          </div>
          <div className="p-3">
            <ul className="space-y-2">
              {siteTree.map((node) => (
                <li key={node.key}>
                  <div className="text-xs font-semibold text-gray-700 mb-1">{node.label}</div>
                  <ul className="space-y-1 pl-2">
                    {(node.children || []).map((child: any) => (
                      <li key={child.key}>
                        <button
                          onClick={() => handleNavigate(child.href)}
                          className="w-full text-left text-[13px] px-2 py-1 rounded hover:bg-gray-100"
                        >
                          {child.label}
                        </button>
                        {Array.isArray(child.children) && child.children.length > 0 && (
                          <ul className="space-y-1 pl-3 mt-1">
                            {child.children.map((grand: any) => (
                              <li key={grand.key}>
                                <button
                                  onClick={() => handleNavigate(grand.href)}
                                  className="w-full text-left text-[12px] px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
                                >
                                  {grand.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}