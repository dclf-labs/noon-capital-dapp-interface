import { type RefObject, useLayoutEffect, useState } from 'react'

import {
  BUY_AMOUNT_MAX_FONT_PX,
  BUY_AMOUNT_MIN_FONT_PX,
  fitAmountFontSize,
} from '@/mock/buy/fit-amount-font-size'

/**
 * Keep the buy-amount font large, but shrink it so the current value always
 * fits the measured container width (ResizeObserver + text measurement).
 */
export function useFitAmountFontSize(
  text: string,
  containerRef: RefObject<HTMLElement | null>,
  maxPx: number = BUY_AMOUNT_MAX_FONT_PX,
  minPx: number = BUY_AMOUNT_MIN_FONT_PX,
): number {
  const [fontSize, setFontSize] = useState(maxPx)

  useLayoutEffect(() => {
    const node = containerRef.current
    if (!node) return

    const update = () => {
      setFontSize(fitAmountFontSize(text, node.clientWidth, { maxPx, minPx }))
    }

    update()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }

    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [containerRef, maxPx, minPx, text])

  return fontSize
}
