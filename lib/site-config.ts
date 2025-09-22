// Site configuration - simplified exports for better developer experience
// This file provides clean imports and helper functions

import siteData from './site-data.json';
import { siteSchema } from './site-schema';

// Re-export the clean data and schema
export { siteData, siteSchema };

// Helper functions for working with the clean data structure
export function getSection(sectionId: string, pageType: string = 'home') {
  const sections = getPageSections(pageType);
  return sections.find((s: any) => s.id === sectionId);
}

export function getEnabledSections(pageType: string = 'home') {
  const sections = getPageSections(pageType);
  return sections.filter((s: any) => s.enabled).sort((a: any, b: any) => a.order - b.order);
}

// Helper functions for working with page-specific sections
export function getPageSections(pageType: string) {
  if (!siteData.pages || !(siteData.pages as any)[pageType]) {
    return [];
  }
  return (siteData.pages as any)[pageType].sections;
}

export function getEnabledPageSections(pageType: string) {
  const sections = getPageSections(pageType);
  return sections.filter((s: any) => s.enabled).sort((a: any, b: any) => a.order - b.order);
}

// Helper functions for working with services
export function getServiceSlugs() {
  const sections = getPageSections('service-detail');
  const slugs = new Set();
  sections.forEach((section: any) => {
    if (section.serviceSlug) {
      slugs.add(section.serviceSlug);
    }
  });
  return Array.from(slugs) as string[];
}

export function getServiceSections(slug: string) {
  const sections = getPageSections('service-detail');
  return sections.filter((section: any) => section.serviceSlug === slug);
}

export function getEnabledServiceSections(slug: string) {
  const sections = getServiceSections(slug);
  return sections.filter((s: any) => s.enabled).sort((a: any, b: any) => a.order - b.order);
}

// Legacy function for backward compatibility
export function getServiceBySlug(slug: string) {
  const sections = getServiceSections(slug);
  if (sections.length === 0) return null;
  
  // Return a service-like object with sections
  return {
    slug,
    sections
  };
}

// Type definitions for better TypeScript support
export type SiteData = typeof siteData;
export type Section = any; // Section type from pages structure
export type FieldSchema = {
  type: string;
  maxLength?: number;
  editable: boolean;
  description: string;
  itemSchema?: any;
};
