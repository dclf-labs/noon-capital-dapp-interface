import { describe, expect, it } from 'vitest'

import { APP_NAME, ROUTES } from '@/constants'

describe('constants', () => {
  it('defines app name and primary routes', () => {
    expect(APP_NAME).toBe('Noon Capital')
    expect(ROUTES.home).toBe('/')
    expect(ROUTES.markets).toBe('/markets')
    expect(ROUTES.portfolio).toBe('/portfolio')
  })
})
