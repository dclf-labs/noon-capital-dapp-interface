import { InfoIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'

export type StatusCalloutType = 'neutral' | 'warning' | 'error'

export type StatusCalloutProps = {
  title: string
  description?: string
  type?: StatusCalloutType
  className?: string
}

/**
 * Compact status / warning banner (icon + title + optional description, left-aligned).
 */
export function StatusCallout({
  title,
  description,
  type = 'neutral',
  className,
}: StatusCalloutProps) {
  const tone =
    type === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : type === 'error'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-stone-200 bg-stone-100 text-stone-800'

  const iconTone =
    type === 'warning' ? 'text-amber-600' : type === 'error' ? 'text-red-600' : 'text-stone-700'

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn('flex w-full items-start gap-1 rounded-lg border p-3', tone, className)}
    >
      <InfoIcon className={cn('mt-0.5 size-5 shrink-0', iconTone)} aria-hidden />
      <div className="grid min-w-0 flex-1 gap-0.5 text-left">
        <p className="text-sm leading-5 font-medium text-wrap">{title}</p>
        {description ? (
          <p
            className={cn(
              'text-sm leading-5 font-book text-wrap',
              type === 'warning'
                ? 'text-amber-700'
                : type === 'error'
                  ? 'text-red-600'
                  : 'text-stone-600',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
