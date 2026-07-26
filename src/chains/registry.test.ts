import { describe, expect, it } from 'vitest'

import { chainList, chains, getChain, getChainsByFamily, getEvmChainByChainId } from '@/chains'

describe('chain registry', () => {
  it('registers all expected chains', () => {
    expect(Object.keys(chains).sort()).toEqual(
      [
        'base',
        'berachain',
        'citrea',
        'ethereum',
        'hyperevm',
        'sophon',
        'starknet',
        'sui',
        'tac',
        'zksync',
      ].sort(),
    )
    expect(chainList).toHaveLength(10)
  })

  it('groups by family', () => {
    expect(getChainsByFamily('evm')).toHaveLength(8)
    expect(getChainsByFamily('starknet')).toHaveLength(1)
    expect(getChainsByFamily('sui')).toHaveLength(1)
  })

  it('resolves EVM chains by chain id', () => {
    expect(getEvmChainByChainId(1)?.key).toBe('ethereum')
    expect(getEvmChainByChainId(8453)?.key).toBe('base')
    expect(getEvmChainByChainId(999)?.key).toBe('hyperevm')
  })

  it('returns definitions by key', () => {
    expect(getChain('sui').family).toBe('sui')
    expect(getChain('starknet').family).toBe('starknet')
  })
})
