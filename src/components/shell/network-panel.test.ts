import { describe, expect, it } from 'vitest'

import { computeNetworkPanelCoords, isHeaderNetworkChainId } from '@/components/shell/network-panel'

describe('computeNetworkPanelCoords', () => {
  it('anchors the panel under the trigger with an 8px gap', () => {
    expect(computeNetworkPanelCoords({ bottom: 100, right: 300 }, 400)).toEqual({
      top: 108,
      right: 100,
    })
  })

  it('keeps at least 8px from the viewport’s right edge', () => {
    expect(computeNetworkPanelCoords({ bottom: 40, right: 398 }, 400)).toEqual({
      top: 48,
      right: 8,
    })
  })
})

describe('isHeaderNetworkChainId', () => {
  const options = [{ chainId: 1 }, { chainId: 324 }, { chainId: 'SN_MAIN' }]

  it('allowlists known header network ids', () => {
    expect(isHeaderNetworkChainId(1, options)).toBe(true)
    expect(isHeaderNetworkChainId(324, options)).toBe(true)
    expect(isHeaderNetworkChainId('SN_MAIN', options)).toBe(true)
  })

  it('rejects unknown or invalid ids', () => {
    expect(isHeaderNetworkChainId(8453, options)).toBe(false)
    expect(isHeaderNetworkChainId(null, options)).toBe(false)
    expect(isHeaderNetworkChainId(undefined, options)).toBe(false)
    expect(isHeaderNetworkChainId(Number.NaN, options)).toBe(false)
  })
})
