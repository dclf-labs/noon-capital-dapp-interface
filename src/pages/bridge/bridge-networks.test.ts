import { describe, expect, it } from 'vitest'
import { base, mainnet as ethereum } from 'wagmi/chains'

import { activeProtocolConfigs } from '@/config/chains'
import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  getAllBridgeNetworks,
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'

describe('bridge network lists', () => {
  it('includes every active protocol chain that supports bridging', () => {
    const all = getAllBridgeNetworks()
    const expected = Object.values(activeProtocolConfigs).filter((c) => c?.bridgeTokens?.length)
    expect(all).toHaveLength(expected.length)
    expect(all.some((n) => n.id === ethereum.id)).toBe(true)
    expect(all.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(true)
    expect(all.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id))).toBe(true)
    expect(all.map((n) => n.name)).toEqual(
      expect.arrayContaining(['Ethereum', 'Starknet', 'Sui', 'Base', 'ZKsync Era']),
    )
  })

  it('returns the full list for source with all options enabled when no destination', () => {
    const source = getBridgeSourceNetworks()
    expect(source).toHaveLength(getAllBridgeNetworks().length)
    expect(source.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id))).toBe(true)
    expect(source.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id))).toBe(true)
    expect(source.every((n) => !n.disabled)).toBe(true)
  })

  it('keeps all destination networks listed and disables incompatible pairs', () => {
    const dest = getBridgeDestinationNetworks(ethereum.id)
    expect(dest.some((n) => n.id === base.id && !n.disabled)).toBe(true)
    expect(dest.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id) && !n.disabled)).toBe(
      true,
    )
    expect(dest.some((n) => n.id === Number(SUI_BRIDGE_DESTINATION.id) && !n.disabled)).toBe(true)
    // Same chain stays visible but not selectable.
    expect(dest.some((n) => n.id === ethereum.id && n.disabled)).toBe(true)
  })

  it('disables Starknet as a destination when sourcing from Starknet', () => {
    const dest = getBridgeDestinationNetworks(Number(STARKNET_BRIDGE_DESTINATION.id))
    expect(dest.some((n) => n.id === Number(STARKNET_BRIDGE_DESTINATION.id) && n.disabled)).toBe(
      true,
    )
    expect(dest.some((n) => n.id === ethereum.id && !n.disabled)).toBe(true)
  })

  it('disables incompatible sources once a destination is chosen', () => {
    const source = getBridgeSourceNetworks(ethereum.id)
    expect(source.some((n) => n.id === ethereum.id && n.disabled)).toBe(true)
    expect(source.some((n) => n.id === base.id && !n.disabled)).toBe(true)
  })
})
