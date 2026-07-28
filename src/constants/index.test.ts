import { describe, expect, it } from 'vitest'

import { APP_DESCRIPTION, APP_NAME, APP_URL, ROUTES } from '@/constants'

describe('constants', () => {
  it('defines app metadata and primary routes', () => {
    expect(APP_NAME).toBe('Noon Capital')
    expect(APP_DESCRIPTION.length).toBeGreaterThan(0)
    expect(APP_URL).toBe('https://app.noon.capital')
    expect(ROUTES.home).toBe('/')
  })
})
