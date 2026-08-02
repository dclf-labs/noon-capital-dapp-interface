import { describe, expect, it } from 'vitest'

import { SUI_BRIDGE_DESTINATION } from '@/constants/common'
import { getBridgeOptions, getBridgeOptionsForDestination } from '@/features/bridge/lib/bridge'

describe('bridge LayerZero options', () => {
  it('builds executor options hex', () => {
    const options = getBridgeOptions()
    expect(options.startsWith('0x')).toBe(true)
    expect(options.length).toBeGreaterThan(4)
  })

  it('uses higher gas for Sui destinations', () => {
    const defaultOpts = getBridgeOptionsForDestination(1)
    const suiOpts = getBridgeOptionsForDestination(SUI_BRIDGE_DESTINATION.id)
    expect(suiOpts).not.toBe(defaultOpts)
  })
})
