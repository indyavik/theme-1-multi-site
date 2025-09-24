// Registry of available sites and defaults
export const SITES = [
  'site1',
  'site2',
  'site3',
] as const;

export type SiteId = typeof SITES[number];

export const DEFAULT_SITE: SiteId = 'site1';

export function isValidSiteId(siteId: string | undefined | null): siteId is SiteId {
  return !!siteId && (SITES as readonly string[]).includes(siteId);
}


