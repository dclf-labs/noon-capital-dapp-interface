import { describe, expect, it } from 'vitest'

import {
  chainIconSrc,
  getNetworkOptions,
  HEADER_NETWORK_KEYS,
  NETWORK_OPTIONS,
  networkOptionsForKeys,
  protocolIdForChainKey,
} from '@/components/shell/network'
import { isValidChainId } from '@/lib/chain'

describe('header network registry', () => {
  it('exposes only the product header networks in a stable order', () => {
    expect([...HEADER_NETWORK_KEYS]).toEqual(['ethereum', 'zksync', 'sophon', 'tac', 'starknet'])
  })

  it('builds unique, valid options with https-safe asset paths', () => {
    const options = getNetworkOptions()
    expect(options).toHaveLength(HEADER_NETWORK_KEYS.length)
    expect(NETWORK_OPTIONS).toEqual(options)
    expect(networkOptionsForKeys(HEADER_NETWORK_KEYS)).toEqual(options)

    const keys = new Set(options.map((o) => o.key))
    const chainIds = new Set(options.map((o) => String(o.chainId)))
    expect(keys.size).toBe(options.length)
    expect(chainIds.size).toBe(options.length)

    for (const option of options) {
      expect(isValidChainId(option.chainId)).toBe(true)
      expect(option.name.length).toBeGreaterThan(0)
      expect(option.iconSrc).toMatch(/^\/assets\/chains\/[a-z0-9-]+\.svg$/)
      expect(option.chainId).toBe(protocolIdForChainKey(option.key))
      expect(option.iconSrc).toBe(chainIconSrc(option.chainId))
    }
  })
})
