import { describe, expect, it, vi } from 'vitest'
import { base, mainnet as ethereum } from 'wagmi/chains'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  canFlipBridgeNetworks,
  isSameFamilyBridgeFlip,
  requestBridgeNetworkFlip,
} from '@/features/bridge/flip'
import { isBridgePairAllowed } from '@/features/bridge/route'
import { useBridgeFlipStore } from '@/state/bridge-flip'

const STARKNET = Number(STARKNET_BRIDGE_DESTINATION.id)
const SUI = Number(SUI_BRIDGE_DESTINATION.id)
const ETH = ethereum.id
const BASE = base.id

describe('canFlipBridgeNetworks', () => {
  it('allows flip for every structurally allowed reverse pair, including ETH↔Sui', () => {
    expect(canFlipBridgeNetworks(ETH, BASE)).toBe(true)
    expect(canFlipBridgeNetworks(ETH, STARKNET)).toBe(true)
    expect(canFlipBridgeNetworks(STARKNET, ETH)).toBe(true)
    expect(canFlipBridgeNetworks(ETH, SUI)).toBe(true)
    expect(canFlipBridgeNetworks(SUI, ETH)).toBe(true)
  })

  it('matches isBridgePairAllowed on the reversed route', () => {
    const pairs: Array<[number, number]> = [
      [ETH, BASE],
      [ETH, STARKNET],
      [BASE, STARKNET],
      [ETH, SUI],
      [SUI, ETH],
    ]
    for (const [source, dest] of pairs) {
      expect(canFlipBridgeNetworks(source, dest)).toBe(isBridgePairAllowed(dest, source))
    }
  })

  it('rejects missing chains / same chain', () => {
    expect(canFlipBridgeNetworks(ETH, undefined)).toBe(false)
    expect(canFlipBridgeNetworks(ETH, ETH)).toBe(false)
  })
})

describe('isSameFamilyBridgeFlip', () => {
  it('detects same vs cross family', () => {
    expect(isSameFamilyBridgeFlip(ETH, BASE)).toBe(true)
    expect(isSameFamilyBridgeFlip(ETH, STARKNET)).toBe(false)
    expect(isSameFamilyBridgeFlip(STARKNET, ETH)).toBe(false)
    expect(isSameFamilyBridgeFlip(ETH, SUI)).toBe(false)
  })
})

describe('requestBridgeNetworkFlip', () => {
  it('same-family EVM flip applies in-place and selects the new source', () => {
    const selectActiveChain = vi.fn()
    const applySameFamilyFlip = vi.fn()
    useBridgeFlipStore.getState().setPending(null)

    expect(requestBridgeNetworkFlip(ETH, BASE, { selectActiveChain, applySameFamilyFlip })).toBe(
      true,
    )
    expect(applySameFamilyFlip).toHaveBeenCalledWith(BASE, ETH)
    expect(selectActiveChain).toHaveBeenCalledWith(BASE)
    expect(useBridgeFlipStore.getState().pending).toBeNull()
  })

  it('cross-family flip stashes pending pair and switches product network', () => {
    const selectActiveChain = vi.fn()
    const applySameFamilyFlip = vi.fn()
    useBridgeFlipStore.getState().setPending(null)

    expect(
      requestBridgeNetworkFlip(ETH, STARKNET, { selectActiveChain, applySameFamilyFlip }),
    ).toBe(true)
    expect(applySameFamilyFlip).not.toHaveBeenCalled()
    expect(selectActiveChain).toHaveBeenCalledWith(STARKNET)
    expect(useBridgeFlipStore.getState().pending).toEqual({
      sourceChainId: STARKNET,
      destinationChainId: ETH,
    })
  })
})
