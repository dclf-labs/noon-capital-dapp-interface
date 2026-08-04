import { describe, expect, it } from 'vitest'

import { protocolIdForChainKey } from '@/components/shell/network'
import {
  BUY_SUPPORTED_NETWORK_KEYS,
  BUY_SUPPORTED_NETWORK_OPTIONS,
  BUY_SUPPORTED_NETWORKS_COPY,
  isBuySupportedChainId,
  resolveBuyEvmChainId,
} from '@/features/buy/supported-networks'
import { getDefaultChainId, getSuiChainId, getTacChainId } from '@/lib/chain'

describe('buy supported networks', () => {
  it('allowlists Ethereum, zkSync, Sophon, and Starknet only', () => {
    expect([...BUY_SUPPORTED_NETWORK_KEYS]).toEqual(['ethereum', 'zksync', 'sophon', 'starknet'])
    expect(BUY_SUPPORTED_NETWORK_OPTIONS.map((n) => n.key)).toEqual([
      'ethereum',
      'zksync',
      'sophon',
      'starknet',
    ])
  })

  it('accepts buy-supported chain ids', () => {
    for (const key of BUY_SUPPORTED_NETWORK_KEYS) {
      expect(isBuySupportedChainId(protocolIdForChainKey(key))).toBe(true)
    }
  })

  it('rejects TAC, Sui, and unrelated chains', () => {
    expect(isBuySupportedChainId(getTacChainId())).toBe(false)
    expect(isBuySupportedChainId(getSuiChainId())).toBe(false)
    expect(isBuySupportedChainId(8453)).toBe(false)
    expect(isBuySupportedChainId(null)).toBe(false)
  })

  it('exposes shared gate copy for the switch modal', () => {
    expect(BUY_SUPPORTED_NETWORKS_COPY).toMatch(/Ethereum/)
    expect(BUY_SUPPORTED_NETWORKS_COPY).toMatch(/Starknet/)
  })

  it('resolves unsupported product networks to Ethereum for the EVM buy form', () => {
    expect(resolveBuyEvmChainId(protocolIdForChainKey('ethereum'))).toBe(
      protocolIdForChainKey('ethereum'),
    )
    expect(resolveBuyEvmChainId(protocolIdForChainKey('zksync'))).toBe(
      protocolIdForChainKey('zksync'),
    )
    expect(resolveBuyEvmChainId(protocolIdForChainKey('sophon'))).toBe(
      protocolIdForChainKey('sophon'),
    )
    expect(resolveBuyEvmChainId(getTacChainId())).toBe(getDefaultChainId())
    expect(resolveBuyEvmChainId(getSuiChainId())).toBe(getDefaultChainId())
    expect(resolveBuyEvmChainId(8453)).toBe(getDefaultChainId())
  })
})
