import { describe, expect, it } from 'vitest'

import { evmAbis, starknetAbis } from '@/lib/abis'

function isSolidityAbi(abi: readonly unknown[]): boolean {
  return abi.some(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      'stateMutability' in entry &&
      (entry as { type?: string }).type === 'function',
  )
}

function isCairoAbi(abi: readonly unknown[]): boolean {
  return abi.some(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      ('interface_name' in entry ||
        ((entry as { type?: string }).type === 'struct' && 'members' in entry)),
  )
}

describe('evmAbis', () => {
  it('exports the expected protocol and DEX contracts', () => {
    expect(Object.keys(evmAbis).sort()).toEqual(
      [
        'curveRouter',
        'directMinter',
        'directRedeemer',
        'hyperlaneMailbox',
        'lagoonVault',
        'layerzeroHyperlaneToken',
        'layerzeroOft',
        'layerzeroOftHelper',
        'mintHandler',
        'permit2',
        'snoon',
        'snoonPermanentStake',
        'snoonRewarder',
        'stakingVault',
        'syncswapV3QuoterV2',
        'syncswapV3Router',
        'uniswapUniversalRouter',
        'uniswapV3QuoterV2',
        'uniswapV3SwapRouter01',
        'uniswapV4Quoter',
        'withdrawHandler',
      ].sort(),
    )
  })

  it('only contains Solidity JSON ABIs', () => {
    for (const [name, abi] of Object.entries(evmAbis)) {
      expect(Array.isArray(abi), name).toBe(true)
      expect(isSolidityAbi(abi), name).toBe(true)
      expect(isCairoAbi(abi), name).toBe(false)
    }
  })

  it('keeps distinct sNOON staking variants', () => {
    const withdrawal = new Set(
      evmAbis.snoon.filter((e) => e.type === 'function').map((e) => e.name),
    )
    const permanent = new Set(
      evmAbis.snoonPermanentStake.filter((e) => e.type === 'function').map((e) => e.name),
    )

    expect(withdrawal.has('claimWithdrawalReward')).toBe(true)
    expect(permanent.has('extendStake')).toBe(true)
    expect(withdrawal.has('extendStake')).toBe(false)
    expect(permanent.has('claimWithdrawalReward')).toBe(false)
  })
})

describe('starknetAbis', () => {
  it('exports Cairo ABIs only', () => {
    expect(Object.keys(starknetAbis).sort()).toEqual(
      ['ekuboRouter', 'hyperlaneMailbox', 'layerzeroHyperlaneToken'].sort(),
    )

    for (const [name, abi] of Object.entries(starknetAbis)) {
      expect(Array.isArray(abi), name).toBe(true)
      expect(isCairoAbi(abi), name).toBe(true)
      expect(isSolidityAbi(abi), name).toBe(false)
    }
  })
})
