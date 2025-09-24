import { getApiUrl, getAuthHeader } from './theme-config'

export type ContactUsFields = Record<string, string>

export interface SubmitContactUsParams {
  siteSlug?: string
  fields: ContactUsFields
  pagePath?: string
}

export interface SubmitContactUsResult {
  ok: boolean
  status: number
  message?: string
  data?: any
  text?: string
  siteId?: string
  slug?: string
  notified?: boolean
}

export async function submitContactUs({ siteSlug, fields, pagePath }: SubmitContactUsParams): Promise<SubmitContactUsResult> {
  const effectiveSlug = siteSlug
  const payload: Record<string, any> = {
    ...fields,
    ...(effectiveSlug ? { siteSlug: effectiveSlug } : {}),
    ...(pagePath ? { pagePath } : {}),
  }

  const res = await fetch(getApiUrl('/api/contact-us'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthHeader() || {}),
    },
    body: JSON.stringify(payload),
  })

  const contentType = res.headers.get('content-type') || ''
  let data: any = undefined
  let text = ''
  try {
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      text = await res.text()
    }
  } catch {
    // ignore parse errors
  }

  const message = (data && typeof data.message === 'string' ? data.message : undefined) || text || undefined
  const siteId = data && typeof data.siteId === 'string' ? data.siteId : undefined
  const slug = data && typeof data.slug === 'string' ? data.slug : undefined
  const notified = !!(data && typeof data.notified !== 'undefined' ? data.notified : false)

  if (!res.ok) {
    return { ok: false, status: res.status, message: message || 'Contact submission failed', data, text, siteId, slug, notified }
  }
  return { ok: true, status: res.status, message: message || 'OK', data, text, siteId, slug, notified }
}


