import { describe, expect, it } from 'vitest'

import { BRIDGE_FEE_TIP, BRIDGE_NETWORK_FEE_TIP, PROTOCOL_FEE_TIP } from '@/mock/bridge/constants'

describe('bridge fee tip copy', () => {
  it('explains bridge fee as cross-chain delivery paid in source gas token', () => {
    expect(BRIDGE_FEE_TIP).toMatch(/cross-chain delivery/i)
    expect(BRIDGE_FEE_TIP).toMatch(/source chain/i)
    expect(BRIDGE_FEE_TIP).toMatch(/estimate/i)
  })

  it('explains network fee as source-chain submit gas', () => {
    expect(BRIDGE_NETWORK_FEE_TIP).toMatch(/source-chain gas/i)
    expect(BRIDGE_NETWORK_FEE_TIP).toMatch(/bridge transaction/i)
    expect(BRIDGE_NETWORK_FEE_TIP).toMatch(/estimate/i)
  })

  it('states Noon protocol fee stays at $0', () => {
    expect(PROTOCOL_FEE_TIP).toMatch(/does not charge/i)
    expect(PROTOCOL_FEE_TIP).toMatch(/\$0/)
  })
})
