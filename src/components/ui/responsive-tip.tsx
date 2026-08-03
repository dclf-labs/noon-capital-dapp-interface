import type { ComponentProps, ReactNode } from 'react'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/ui/useIsMobile'
import { cn } from '@/lib/utils'

type TipSide = NonNullable<ComponentProps<typeof HoverCardContent>['side']>
type TipAlign = NonNullable<ComponentProps<typeof HoverCardContent>['align']>

type ResponsiveTipProps = {
  content: ReactNode
  children: ReactNode
  /** Accessible name for icon / value triggers. */
  label: string
  side?: TipSide
  align?: TipAlign
  contentClassName?: string
  triggerClassName?: string
  disabled?: boolean
  openDelay?: number
  closeDelay?: number
}

/**
 * Shared tip surface: HoverCard on desktop, Popover on mobile.
 * Wrap any trigger (info icon, value, etc.) — do not use native `title` tooltips.
 */
export function ResponsiveTip({
  content,
  children,
  label,
  side = 'top',
  align = 'center',
  contentClassName,
  triggerClassName,
  disabled = false,
  openDelay = 120,
  closeDelay = 80,
}: ResponsiveTipProps) {
  const isMobile = useIsMobile()

  if (disabled || content == null || content === false) {
    return <>{children}</>
  }

  const triggerClass = cn(
    'inline-flex cursor-help items-center',
    'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
    triggerClassName,
  )

  const panelClass = cn('text-sm leading-5 font-book text-stone-700', contentClassName)

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label={label} className={triggerClass}>
            {children}
          </button>
        </PopoverTrigger>
        <PopoverContent side={side} align={align} className={panelClass}>
          {content}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger asChild>
        <button type="button" aria-label={label} className={triggerClass}>
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align} className={panelClass}>
        {content}
      </HoverCardContent>
    </HoverCard>
  )
}
