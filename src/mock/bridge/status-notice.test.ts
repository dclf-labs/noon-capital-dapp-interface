import { describe, expect, it } from 'vitest'

import { resolveBridgeStatusNotice } from '@/mock/bridge/status-notice'

describe('resolveBridgeStatusNotice', () => {
  it('returns undefined for empty warnings', () => {
    expect(resolveBridgeStatusNotice(undefined)).toBeUndefined()
    expect(resolveBridgeStatusNotice('')).toBeUndefined()
  })

  it('classifies maintenance-style strings as warning', () => {
    expect(resolveBridgeStatusNotice('Bridge disabled for maintenance')).toEqual({
      title: 'Bridge disabled for maintenance',
      type: 'warning',
    })
    expect(resolveBridgeStatusNotice('Route unavailable')).toEqual({
      title: 'Route unavailable',
      type: 'warning',
    })
    expect(resolveBridgeStatusNotice('Adapter not configured')).toEqual({
      title: 'Adapter not configured',
      type: 'warning',
    })
  })

  it('classifies other strings as neutral', () => {
    expect(resolveBridgeStatusNotice('Fees may vary by network')).toEqual({
      title: 'Fees may vary by network',
      type: 'neutral',
    })
  })

  it('passes through structured notices with a default type', () => {
    expect(
      resolveBridgeStatusNotice({ title: 'Custom', description: 'Details', type: 'warning' }),
    ).toEqual({
      title: 'Custom',
      description: 'Details',
      type: 'warning',
    })
    expect(resolveBridgeStatusNotice({ title: 'Info only' })).toEqual({
      title: 'Info only',
      type: 'neutral',
    })
  })
})
