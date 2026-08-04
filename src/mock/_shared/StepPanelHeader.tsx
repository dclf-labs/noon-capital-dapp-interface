import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { FOCUS_RESET, preventMouseDownFocus } from '@/mock/_shared/ui-classes'

type StepPanelHeaderProps = {
  title: string
  onBack?: () => void
  /** Optional leading control when there is no back button (e.g. success check). */
  leading?: ReactNode
}

/**
 * Step 2/3 panel header.
 *
 * Title owns the full width and is text-centered. Back/leading is overlaid on
 * the left and vertically centered to that same title block (`top-1/2`).
 */
export function StepPanelHeader({ title, onBack, leading }: StepPanelHeaderProps) {
  return (
    <div className="relative flex w-full items-center justify-center">
      {/* Full-width centered title — defines the row height. */}
      <h2
        className={cn(
          'm-0 w-full px-12 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900',
          'md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]',
        )}
      >
        {title}
      </h2>

      {/* Left control — out of flow so it does not shift the title center. */}
      {onBack ? (
        <button
          type="button"
          aria-label="Back"
          onMouseDown={preventMouseDownFocus}
          onClick={onBack}
          className={cn(
            'absolute top-1/2 left-0 flex size-9 -translate-y-1/2 items-center justify-center rounded-md bg-stone-100',
            'transition-opacity hover:opacity-80',
            FOCUS_RESET,
          )}
        >
          <img src="/assets/buy/arrow-back.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : leading ? (
        <div className="absolute top-1/2 left-0 flex -translate-y-1/2 items-center justify-center">
          {leading}
        </div>
      ) : null}
    </div>
  )
}
