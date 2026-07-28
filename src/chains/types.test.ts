import { describe, expect, it } from 'vitest'

import { chains, isEvmChain, isStarknetChain, isSuiChain } from '@/chains'

describe('chain type guards', () => {
  it('identifies EVM chains', () => {
    expect(isEvmChain(chains.ethereum)).toBe(true)
    expect(isEvmChain(chains.base)).toBe(true)
    expect(isEvmChain(chains.starknet)).toBe(false)
    expect(isEvmChain(chains.sui)).toBe(false)
  })

  it('identifies Starknet', () => {
    expect(isStarknetChain(chains.starknet)).toBe(true)
    expect(isStarknetChain(chains.ethereum)).toBe(false)
    expect(isStarknetChain(chains.sui)).toBe(false)
  })

  it('identifies Sui', () => {
    expect(isSuiChain(chains.sui)).toBe(true)
    expect(isSuiChain(chains.ethereum)).toBe(false)
    expect(isSuiChain(chains.starknet)).toBe(false)
  })
})
