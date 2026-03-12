declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type LeadEventParams = {
  value?: number
  currency?: string
  leadSource?: string
}

export function trackGenerateLead(params: LeadEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }

  const eventParams: Record<string, string | number> = {
    lead_source: params.leadSource || 'contact_form',
  }

  if (typeof params.value === 'number' && Number.isFinite(params.value) && params.value > 0) {
    eventParams.value = params.value
    eventParams.currency = params.currency || 'CAD'
  }

  window.gtag('event', 'generate_lead', eventParams)
}

export function trackGoogleAdsLeadConversion(params: LeadEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }

  const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID
  const adsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

  if (!adsConversionId || !adsConversionLabel) {
    return
  }

  const eventParams: Record<string, string | number> = {
    send_to: `${adsConversionId}/${adsConversionLabel}`,
  }

  if (typeof params.value === 'number' && Number.isFinite(params.value) && params.value > 0) {
    eventParams.value = params.value
    eventParams.currency = params.currency || 'CAD'
  }

  window.gtag('event', 'conversion', eventParams)
}
