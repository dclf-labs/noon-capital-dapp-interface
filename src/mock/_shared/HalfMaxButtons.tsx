import { cn } from '@/lib/utils'
import { FOCUS_RESET, preventMouseDownFocus } from '@/mock/_shared/ui-classes'

type HalfMaxButtonsProps = {
  disabled?: boolean
  onHalf: () => void
  onMax: () => void
  /** Figma bridge uses uppercase; legacy panels use title case. */
  casing?: 'upper' | 'title'
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
}: HalfMaxButtonsProps) {
  const labels = LABELS[casing]
  const chip = cn(
    'rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5',
    'text-sm leading-5 font-medium text-stone-600',
    FOCUS_RESET,
    disabled && 'cursor-not-allowed opacity-50',
  )

  return (
    <div className="flex items-center gap-1">
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
