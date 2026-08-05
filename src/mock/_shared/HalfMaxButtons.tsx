import { cn } from '@/lib/utils'
import { FOCUS_RESET, preventMouseDownFocus } from '@/mock/_shared/ui-classes'

type HalfMaxButtonsProps = {
  disabled?: boolean
  onHalf: () => void
  onMax: () => void
  /** Figma bridge uses uppercase; legacy panels / buy-hero pills use title case. */
  casing?: 'upper' | 'title'
  /**
   * `chip` — compact stone chip (bridge / amount cards).
   * `pill` — rounded-full preset style (home Buy USD buttons).
   */
  variant?: 'chip' | 'pill'
}

const LABELS = {
  upper: { half: 'HALF', max: 'MAX' },
  title: { half: 'Half', max: 'Max' },
} as const

/** Shared HALF/MAX preset chips (mousedown guard preserves amount-input focus). */
export function HalfMaxButtons({
  disabled = false,
  onHalf,
  onMax,
  casing = 'upper',
  variant = 'chip',
}: HalfMaxButtonsProps) {
  const labels = LABELS[casing]
  const chip = cn(
    variant === 'pill'
      ? 'rounded-full border border-stone-200 px-1.5 py-1 text-sm leading-5 font-book text-stone-500 transition-colors hover:text-primary focus:border-stone-200 focus-visible:border-stone-200 active:border-stone-200'
      : 'rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-sm leading-5 font-medium text-stone-600 transition-colors hover:text-primary',
    FOCUS_RESET,
    disabled && 'cursor-not-allowed opacity-50',
  )

  return (
    <div className={cn('flex items-center', variant === 'pill' ? 'gap-1.5' : 'gap-1')}>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={preventMouseDownFocus}
        onClick={onHalf}
        className={chip}
      >
        {labels.half}
      </button>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={preventMouseDownFocus}
        onClick={onMax}
        className={chip}
      >
        {labels.max}
      </button>
    </div>
  )
}
