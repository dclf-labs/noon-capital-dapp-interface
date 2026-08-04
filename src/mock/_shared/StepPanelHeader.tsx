import type { ReactNode } from 'react'

import { ArrowBackIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { FOCUS_RESET, preventMouseDownFocus } from '@/mock/_shared/ui-classes'

type StepPanelHeaderProps = {
  title: string
  onBack?: () => void
  /** Optional leading control when there is no back button (e.g. success check). */
  leading?: ReactNode
}

/**
 * Step 2/3 panel header — flex row with back/leading + title, vertically centered.
 * A matching trailing spacer keeps the title optically centered.
 */
export function StepPanelHeader({ title, onBack, leading }: StepPanelHeaderProps) {
  const control = onBack ? (
    <button
      type="button"
      aria-label="Back"
      onMouseDown={preventMouseDownFocus}
      onClick={onBack}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-md bg-stone-100',
        'text-stone-500 transition-colors hover:text-primary',
        FOCUS_RESET,
      )}
    >
      <ArrowBackIcon width={24} height={24} className="size-6" aria-hidden />
    </button>
  ) : leading ? (
    <div className="flex size-9 shrink-0 items-center justify-center">{leading}</div>
  ) : null

  return (
    <div className="flex w-full items-baseline gap-2">
      {control}

      <h2
        className={cn(
          'm-0 min-w-0 flex-1 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900',
          'md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]',
        )}
      >
        {title}
      </h2>

      {control ? <div className="size-9 shrink-0" aria-hidden /> : null}
    </div>
  )
}
