/**
 * Returns a normalized absolute https URL, or undefined if the input is missing
 * or not a safe external destination (blocks javascript:, data:, http:, etc.).
 */
export function safeExternalHref(href: string | undefined | null): string | undefined {
  if (href == null) return undefined
  const trimmed = href.trim()
  if (!trimmed) return undefined

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:') return undefined
    // Reject embedded credentials (https://user:pass@host/…).
    if (url.username || url.password) return undefined
    return url.href
  } catch {
    return undefined
  }
}
