import { describe, expect, it } from 'vitest'
import { base, berachain, hyperEvm, mainnet as ethereum, tac } from 'wagmi/chains'

import type { Token } from '@/config/token'
import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  doesLayerzeroNeedApproval,
  getLayerzeroApproveSpender,
  isBridgePairAllowed,
  isHyperlaneBridgeRoute,
  isLayerzeroBridgeRouteDisabled,
  isSuiToEthBridgeDisabled,
} from '@/features/bridge/route'

const STARKNET = Number(STARKNET_BRIDGE_DESTINATION.id)
const SUI = Number(SUI_BRIDGE_DESTINATION.id)

function tokenStub(partial: Pick<Token, 'contractAddress' | 'layerzeroOftAddress'>): Token {
  return {
    name: 'Test',
    symbol: 'TEST',
    decimals: 18,
    iconSlug: 'test',
    ...partial,
  }
}

describe('isHyperlaneBridgeRoute', () => {
  it('routes Starknet destinations through Hyperlane', () => {
    expect(isHyperlaneBridgeRoute({}, STARKNET)).toBe(true)
  })

  it('uses source useHyperlane map for EVM destinations', () => {
    expect(isHyperlaneBridgeRoute({ [base.id]: true }, base.id)).toBe(true)
    expect(isHyperlaneBridgeRoute({ [base.id]: false }, base.id)).toBe(false)
    expect(isHyperlaneBridgeRoute({}, SUI)).toBe(false)
  })
})

describe('isBridgePairAllowed', () => {
  it('rejects same-chain and known incompatible pairs', () => {
    expect(isBridgePairAllowed(ethereum.id, ethereum.id)).toBe(false)
    expect(isBridgePairAllowed(tac.id, STARKNET)).toBe(false)
    expect(isBridgePairAllowed(hyperEvm.id, STARKNET)).toBe(false)
    expect(isBridgePairAllowed(base.id, berachain.id)).toBe(false)
    expect(isBridgePairAllowed(SUI, berachain.id)).toBe(false)
  })

  it('allows Ethereum ↔ Base / Citrea / Berachain / Sui / Starknet', () => {
    expect(isBridgePairAllowed(ethereum.id, base.id)).toBe(true)
    expect(isBridgePairAllowed(ethereum.id, STARKNET)).toBe(true)
    expect(isBridgePairAllowed(ethereum.id, SUI)).toBe(true)
  })
})

describe('layerzero approve spender', () => {
  it('prefers helper, else OFT address', () => {
    const token = tokenStub({
      layerzeroOftAddress: '0x1111111111111111111111111111111111111111',
      contractAddress: '0x2222222222222222222222222222222222222222',
    })
    expect(getLayerzeroApproveSpender(token, '0x3333333333333333333333333333333333333333')).toBe(
      '0x3333333333333333333333333333333333333333',
    )
    expect(getLayerzeroApproveSpender(token)).toBe(token.layerzeroOftAddress)
  })

  it('skips approval when OFT is the token itself and no helper', () => {
    const token = tokenStub({
      layerzeroOftAddress: '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa',
      contractAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    })
    expect(doesLayerzeroNeedApproval(token)).toBe(false)
    expect(doesLayerzeroNeedApproval(token, '0x1111111111111111111111111111111111111111')).toBe(
      true,
    )
  })
})

describe('isLayerzeroBridgeRouteDisabled', () => {
  it('only disables non-Hyperlane routes when kill switch is on', () => {
    // Default constant is false in this repo.
    expect(isLayerzeroBridgeRouteDisabled(false)).toBe(false)
    expect(isLayerzeroBridgeRouteDisabled(true)).toBe(false)
  })
})

describe('isSuiToEthBridgeDisabled', () => {
  it('blocks Sui source to non-Sui destinations while kill switch is on', () => {
    expect(isSuiToEthBridgeDisabled(SUI, ethereum.id)).toBe(true)
    expect(isSuiToEthBridgeDisabled(ethereum.id, SUI)).toBe(false)
    expect(isSuiToEthBridgeDisabled(SUI, SUI)).toBe(false)
  })
})
