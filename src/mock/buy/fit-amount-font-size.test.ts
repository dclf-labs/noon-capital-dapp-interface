import { describe, expect, it } from 'vitest'

import {
  BUY_AMOUNT_MAX_FONT_PX,
  BUY_AMOUNT_MIN_FONT_PX,
  fitAmountFontSize,
} from '@/mock/buy/fit-amount-font-size'

describe('fitAmountFontSize', () => {
  const measure = (text: string, fontSizePx: number) => text.length * fontSizePx * 0.6

  it('returns the max size when the text fits', () => {
    expect(fitAmountFontSize('0', 400, { measure })).toBe(BUY_AMOUNT_MAX_FONT_PX)
  })

  it('shrinks as digit count grows for a fixed width', () => {
    const short = fitAmountFontSize('100', 200, { measure })
    const long = fitAmountFontSize('1,000,000,000', 200, { measure })
    expect(long).toBeLessThan(short)
    expect(long).toBeGreaterThanOrEqual(BUY_AMOUNT_MIN_FONT_PX)
  })

  it('never goes below the minimum size', () => {
    expect(
      fitAmountFontSize('9'.repeat(40), 80, {
        measure,
        minPx: BUY_AMOUNT_MIN_FONT_PX,
      }),
    ).toBe(BUY_AMOUNT_MIN_FONT_PX)
  })
})
