export const BUY_AMOUNT_MAX_FONT_PX = 56
export const BUY_AMOUNT_MIN_FONT_PX = 20

const FONT_FAMILY = 'SuisseIntl, ui-sans-serif, system-ui, sans-serif'

let measureCanvas: HTMLCanvasElement | undefined

function defaultMeasureTextWidth(text: string, fontSizePx: number): number {
  if (typeof document === 'undefined') {
    // SSR / non-DOM fallback — approximate tabular digit width.
    return text.length * fontSizePx * 0.62
  }
  measureCanvas ??= document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return text.length * fontSizePx * 0.62
  ctx.font = `450 ${fontSizePx}px ${FONT_FAMILY}`
  return ctx.measureText(text).width
}

export type FitAmountFontSizeOptions = {
  maxPx?: number
  minPx?: number
  /** Horizontal padding reserved inside the field. */
  paddingPx?: number
  measure?: (text: string, fontSizePx: number) => number
}

/**
 * Largest font size in `[minPx, maxPx]` whose rendered text fits `containerWidthPx`.
 */
export function fitAmountFontSize(
  text: string,
  containerWidthPx: number,
  options: FitAmountFontSizeOptions = {},
): number {
  const maxPx = options.maxPx ?? BUY_AMOUNT_MAX_FONT_PX
  const minPx = options.minPx ?? BUY_AMOUNT_MIN_FONT_PX
  const paddingPx = options.paddingPx ?? 8
  const measure = options.measure ?? defaultMeasureTextWidth

  if (!(containerWidthPx > 0) || maxPx <= minPx) return maxPx

  const content = text.length > 0 ? text : '0'
  const available = Math.max(0, containerWidthPx - paddingPx)

  if (measure(content, maxPx) <= available) return maxPx
  if (measure(content, minPx) >= available) return minPx

  let lo = minPx
  let hi = maxPx
  let best = minPx
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (measure(content, mid) <= available) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return best
}
