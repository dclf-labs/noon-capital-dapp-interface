import { InfoIcon } from '@/assets/icons'
import { ResponsiveTip } from '@/components/ui/responsive-tip'
import { cn } from '@/lib/utils'

type InfoTipIconProps = {
  content: string
  label: string
  size?: 12 | 16
  className?: string
}

/** Small info glyph tip — HoverCard on desktop, Popover on mobile. */
export function InfoTipIcon({ content, label, size = 12, className }: InfoTipIconProps) {
  return (
    <ResponsiveTip
      label={label}
      content={content}
      side="top"
      align="start"
      contentClassName="max-w-[240px] whitespace-normal"
      triggerClassName={cn(
        'rounded-sm text-stone-500 transition-colors hover:text-primary',
        className,
      )}
    >
      <InfoIcon
        width={size}
        height={size}
        className={cn('shrink-0', size === 12 ? 'size-3' : 'size-4')}
        aria-hidden
      />
    </ResponsiveTip>
  )
}
