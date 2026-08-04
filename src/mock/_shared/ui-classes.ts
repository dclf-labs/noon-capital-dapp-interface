import { cn } from '@/lib/utils'

/** Opt-in class matching global focus-ring suppression (kept for local clarity). */
export const FOCUS_RESET =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

/**
 * Outer stone shell used by buy / bridge confirm & success cards.
 * Figma `4819:59985` / `4819:60239`: 12px outer radius.
 */
export const PANEL_OUTER =
  'w-full overflow-hidden rounded-[12px] border border-stone-200 bg-stone-50 shadow-panel'

/**
 * Inner white card nested inside `PANEL_OUTER`.
 * 11px keeps the inner border parallel to the 12px outer (1px shell).
 */
export const PANEL_INNER =
  'flex w-full flex-col gap-4 overflow-hidden rounded-[11px] border border-stone-200 bg-white px-2 pt-2 pb-6 shadow-panel'

/** Bridge step-0 single-shell (Figma: stone-300 border, white fill). */
export const BRIDGE_PANEL_SHELL =
  'w-full overflow-hidden rounded-[12px] border border-stone-300 bg-white shadow-panel'

const CTA_BASE =
  'flex items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-base leading-6 font-medium whitespace-nowrap'

/** Full-width primary CTA (enabled / disabled / loading). */
export function primaryCtaClassName(
  options: {
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
  } = {},
): string {
  const { disabled = false, loading = false, fullWidth = true } = options
  const inactive = disabled || loading
  return cn(
    CTA_BASE,
    FOCUS_RESET,
    fullWidth && 'w-full',
    inactive
      ? 'cursor-not-allowed bg-cta-disabled text-cta-disabled-fg'
      : 'bg-accent text-stone-50 transition-opacity hover:opacity-90',
    loading && 'animate-pulse',
  )
}

/** Flex-1 accent CTA used on success panels (always enabled). */
export function accentCtaClassName(fullWidth = false): string {
  return cn(
    CTA_BASE,
    FOCUS_RESET,
    fullWidth ? 'w-full' : 'flex-1',
    'bg-accent text-stone-50 transition-opacity hover:opacity-90',
  )
}

/** Secondary stone CTA / explorer link styling. */
export function secondaryCtaClassName(options: { disabled?: boolean; fullWidth?: boolean } = {}) {
  const { disabled = false, fullWidth = false } = options
  return cn(
    CTA_BASE,
    FOCUS_RESET,
    fullWidth ? 'w-full' : 'flex-1',
    disabled
      ? 'cursor-not-allowed bg-stone-100 text-stone-400'
      : 'bg-stone-100 text-stone-900 transition-opacity hover:opacity-90',
  )
}

/** Prevent mousedown from stealing focus from amount inputs before click handlers run. */
export function preventMouseDownFocus(event: { preventDefault: () => void }) {
  event.preventDefault()
}
