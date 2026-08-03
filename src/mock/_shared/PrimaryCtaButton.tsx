import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { preventMouseDownFocus, primaryCtaClassName } from '@/mock/_shared/ui-classes'

type PrimaryCtaButtonProps = {
  children: ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  'aria-label'?: string
}

/** Shared indigo primary CTA with loading/disabled states + mousedown focus guard. */
export function PrimaryCtaButton({
  children,
  disabled = false,
  loading = false,
  onClick,
  className,
  type = 'button',
  'aria-label': ariaLabel,
}: PrimaryCtaButtonProps) {
  const inactive = disabled || loading
  return (
    <button
      type={type}
      disabled={inactive}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      onMouseDown={preventMouseDownFocus}
      onClick={onClick}
      className={className ?? primaryCtaClassName({ disabled, loading })}
    >
      {children}
    </button>
  )
}
