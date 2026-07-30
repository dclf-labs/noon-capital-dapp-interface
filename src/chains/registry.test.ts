import { describe, expect, it } from 'vitest'

import {
  chainList,
  chains,
  getChain,
  getChainsByFamily,
  getEvmAppKitNetwork,
  getEvmChainByChainId,
  isEvmChain,
  starknetMainnet,
  suiMainnet,
} from '@/chains'

describe('chain registry', () => {
  it('registers all expected chains', () => {
    expect(Object.keys(chains).sort()).toEqual(
      [
        'base',
        'berachain',
        'citrea',
        'ethereum',
        'hyperevm',
        'monad',
        'sophon',
        'starknet',
        'sui',
        'tac',
        'zksync',
      ].sort(),
    )
    expect(chainList).toHaveLength(11)
  })

  it('groups by family', () => {
    expect(getChainsByFamily('evm')).toHaveLength(9)
    expect(getChainsByFamily('starknet')).toHaveLength(1)
    expect(getChainsByFamily('sui')).toHaveLength(1)
  })

  it('resolves EVM chains by chain id', () => {
    expect(getEvmChainByChainId(1)?.key).toBe('ethereum')
    expect(getEvmChainByChainId(8453)?.key).toBe('base')
    expect(getEvmChainByChainId(999)?.key).toBe('hyperevm')
    expect(getEvmChainByChainId(123456)).toBeUndefined()
  })

  it('returns definitions by key', () => {
    expect(getChain('sui').family).toBe('sui')
    expect(getChain('starknet').family).toBe('starknet')
  })

  it('exposes AppKit networks with matching chain ids', () => {
    expect(getEvmAppKitNetwork('ethereum').id).toBe(1)
    expect(getEvmAppKitNetwork('base').id).toBe(8453)
    expect(getEvmAppKitNetwork('ethereum').rpcUrls.default.http.length).toBeGreaterThan(0)
  })

  it('keeps Starknet and Sui RPC URLs configured', () => {
    expect(starknetMainnet.rpcUrls[0]).toMatch(/^https:\/\//)
    expect(suiMainnet.rpcUrls[0]).toMatch(/^https:\/\//)
    expect(suiMainnet.network).toBe('mainnet')
    expect(starknetMainnet.chainId).toBe('SN_MAIN')
  })

  it('exposes AppKit networks for every registered EVM chain', () => {
    for (const chain of getChainsByFamily('evm')) {
      expect(isEvmChain(chain)).toBe(true)
      if (!isEvmChain(chain)) continue
      const network = getEvmAppKitNetwork(chain.key)
      expect(network.id).toBe(chain.chainId)
      expect(network.name).toBeTruthy()
      expect(network.rpcUrls.default.http.length).toBeGreaterThan(0)
    }
  })

  it('aligns registry chain ids with protocol configs where shared', () => {
    const ethereum = getChain('ethereum')
    const base = getChain('base')
    const zksync = getChain('zksync')
    const tac = getChain('tac')
    expect(isEvmChain(ethereum) && ethereum.chainId).toBe(1)
    expect(isEvmChain(base) && base.chainId).toBe(8453)
    expect(isEvmChain(zksync) && zksync.chainId).toBe(324)
    expect(isEvmChain(tac) && getEvmChainByChainId(tac.chainId)?.key).toBe('tac')
  })
})
