import fs from 'fs/promises';
import path from 'path';
import { unstable_noStore as noStore } from 'next/cache';
import { DEFAULT_SITE, SiteId, isValidSiteId } from './site-registry';
import { siteSchema } from '../site-schema';

export type SiteContext = {
  siteId: SiteId;
  data: any;
  schema: typeof siteSchema;
};

export function resolveSiteIdFromParam(param?: string | null): SiteId {
  if (isValidSiteId(param)) return param;
  return DEFAULT_SITE;
}

export async function loadSiteData(siteId: SiteId): Promise<any> {
  // Ensure Next.js does not cache this read — always fetch freshest on each request
  // This complements page-level noStore() and defends against accidental caching.
  try { noStore(); } catch {}

  // Source of truth: per-site data under /sites/<siteId>/lib/site-data.json
  const siteDataPath = path.join(process.cwd(), 'sites', siteId, 'lib', 'site-data.json');
  try {
    const buf = await fs.readFile(siteDataPath, 'utf-8');
    const json = JSON.parse(buf);
    if (!json || typeof json !== 'object' || !json._meta || !json.pages) {
      throw new Error(`Invalid site data shape for site: ${siteId}`);
    }
    return json;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load site data from ${siteDataPath}: ${message}`);
  }
}

export async function getSiteContext(siteId: SiteId): Promise<SiteContext> {
  const data = await loadSiteData(siteId);
  // Annotate the loaded data with current siteId for client components
  if (data && typeof data === 'object') {
    data._meta = { ...(data._meta || {}), siteId };
  }
  return { siteId, data, schema: siteSchema };
}

// No deep merge utilities needed when each site is authoritative


