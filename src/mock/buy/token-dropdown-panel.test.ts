import { describe, expect, it } from 'vitest'

import { computeTokenDropdownCoords } from '@/mock/buy/token-dropdown-panel'

describe('computeTokenDropdownCoords', () => {
  it('opens below the trigger when there is room', () => {
    expect(
      computeTokenDropdownCoords(
        { top: 100, bottom: 140, left: 40, right: 120 },
        { width: 390, height: 800 },
        { width: 180, height: 160 },
      ),
    ).toEqual({
      top: 146,
      left: 40,
      maxHeight: 800 - 140 - 6 - 8,
    })
  })

  it('clamps to the viewport when the trigger is near the right edge', () => {
    const coords = computeTokenDropdownCoords(
      { top: 200, bottom: 240, left: 300, right: 380 },
      { width: 390, height: 800 },
      { width: 180, height: 120 },
    )
    expect(coords.left).toBeGreaterThanOrEqual(8)
    expect(coords.left + 180).toBeLessThanOrEqual(390 - 8)
  })

  it('flips above the trigger when space below is tight', () => {
    const coords = computeTokenDropdownCoords(
      { top: 700, bottom: 740, left: 40, right: 120 },
      { width: 390, height: 780 },
      { width: 180, height: 200 },
    )
    expect(coords.top).toBeLessThan(700)
    expect(coords.maxHeight).toBeGreaterThan(0)
  })
})
