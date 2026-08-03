import { describe, expect, it } from 'vitest'
import { base, mainnet as ethereum } from 'wagmi/chains'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  getAllBridgeNetworks,
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'

describe('bridge network lists', () => {
  it('includes EVM, Starknet, and Sui in the full bridge network list', () => {
    const all = getAllBridgeNetworks()
    expect(all.some((n) => n.id === ethereum.id)).toBe(true)
    expect(all.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(true)
    expect(all.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id))).toBe(true)
  })

  it('returns the same full list for every family source selector', () => {
    const evm = getBridgeSourceNetworks('evm')
    const starknet = getBridgeSourceNetworks('starknet')
    const sui = getBridgeSourceNetworks('sui')
    expect(evm).toEqual(starknet)
    expect(evm).toEqual(sui)
    expect(evm.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(true)
    expect(evm.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id))).toBe(true)
  })

  it('filters destination networks by pair rules for an Ethereum source', () => {
    const dest = getBridgeDestinationNetworks(ethereum.id, 'evm')
    expect(dest.some((n) => n.id === base.id)).toBe(true)
    expect(dest.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(true)
    expect(dest.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id))).toBe(true)
    expect(dest.some((n) => n.id === ethereum.id)).toBe(false)
  })

  it('keeps EVM destinations available when sourcing from Starknet', () => {
    const dest = getBridgeDestinationNetworks(Number(STARKNET_BRIDGE_DESTINATION.id), 'starknet')
    expect(dest.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(false)
    expect(dest.some((n) => n.id === ethereum.id)).toBe(true)
  })
})
