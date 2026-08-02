import { describe, expect, it } from 'vitest'
import { base, mainnet as ethereum } from 'wagmi/chains'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'

describe('bridge network lists', () => {
  it('returns family-specific source networks', () => {
    expect(getBridgeSourceNetworks('starknet')).toEqual([
      { id: Number(STARKNET_BRIDGE_DESTINATION.id), name: 'Starknet' },
    ])
    expect(getBridgeSourceNetworks('sui')).toEqual([
      { id: Number(SUI_BRIDGE_DESTINATION.id), name: 'Sui' },
    ])
    const evm = getBridgeSourceNetworks('evm')
    expect(evm.some((n) => n.id === ethereum.id)).toBe(true)
    expect(evm.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(false)
  })

  it('filters destination networks by pair rules for an Ethereum source', () => {
    const dest = getBridgeDestinationNetworks(ethereum.id, 'evm')
    expect(dest.some((n) => n.id === base.id)).toBe(true)
    expect(dest.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(true)
    expect(dest.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id))).toBe(true)
    expect(dest.some((n) => n.id === ethereum.id)).toBe(false)
  })

  it('omits Starknet from Starknet-family destination candidates', () => {
    const dest = getBridgeDestinationNetworks(undefined, 'starknet')
    expect(dest.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(false)
    expect(dest.some((n) => n.id === ethereum.id)).toBe(true)
  })
})
