import type { CSSProperties, ReactNode } from 'react'

import { safeExternalHref } from '@/lib/safe-external-href'

type SafeExplorerLinkProps = {
  href?: string | null
  children: ReactNode
  style?: CSSProperties
  className?: string
  /** Rendered when `href` is missing or unsafe. */
  fallback?: ReactNode
}

/**
 * Renders an external explorer anchor only for sanitized https URLs.
 * Blocks javascript:/data:/http: and credentialed URLs.
 */
export function SafeExplorerLink({
  href,
  children,
  style,
  className,
  fallback = null,
}: SafeExplorerLinkProps) {
  const safe = safeExternalHref(href)
  if (!safe) return <>{fallback}</>
  return (
    <a href={safe} target="_blank" rel="noreferrer noopener" style={style} className={className}>
      {children}
    </a>
  )
}
