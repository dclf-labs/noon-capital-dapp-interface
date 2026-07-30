import { describe, expect, it } from 'vitest'

import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  APPKIT_DESCRIPTION,
  APPKIT_URL,
  ROUTES,
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
})
