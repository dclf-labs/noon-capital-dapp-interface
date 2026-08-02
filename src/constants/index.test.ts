import { describe, expect, it } from 'vitest'

import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  APPKIT_DESCRIPTION,
  APPKIT_URL,
  CURRENT_SEASON_END_DATE,
  CURRENT_SEASON_START_DATE,
  ROUTES,
  SLIPPAGE_PERCENT_IN_BN,
} from '@/constants'

describe('constants', () => {
  it('defines app metadata and primary routes', () => {
    expect(APP_NAME).toBe('Noon Capital')
    expect(APP_DESCRIPTION.length).toBeGreaterThan(0)
    expect(APPKIT_DESCRIPTION.length).toBeGreaterThan(APP_DESCRIPTION.length)
    expect(APP_URL).toBe('https://app.noon.capital')
    expect(APPKIT_URL).toBe('https://noon.capital')
    expect(ROUTES.home).toBe('/')
  })

  it('uses valid ISO season dates and 1% slippage bps', () => {
    expect(Number.isNaN(Date.parse(CURRENT_SEASON_START_DATE))).toBe(false)
    expect(Number.isNaN(Date.parse(CURRENT_SEASON_END_DATE))).toBe(false)
    expect(Date.parse(CURRENT_SEASON_END_DATE)).toBeGreaterThan(
      Date.parse(CURRENT_SEASON_START_DATE),
    )
    expect(SLIPPAGE_PERCENT_IN_BN).toBe(10_000n)
  })
})
