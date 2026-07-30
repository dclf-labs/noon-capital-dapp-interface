import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getEvmNativeBalance, getStarknetNativeBalance, getSuiNativeBalance } = vi.hoisted(() => ({
  getEvmNativeBalance: vi.fn(),
  getStarknetNativeBalance: vi.fn(),
  getSuiNativeBalance: vi.fn(),
}))

vi.mock('@/wallet/evm/reader', () => ({
  getEvmNativeBalance,
}))

vi.mock('@/wallet/starknet/reader', () => ({
  getStarknetNativeBalance,
}))

vi.mock('@/wallet/sui/reader', () => ({
  getSuiNativeBalance,
}))

import { createChainReader, getChainReader } from '@/wallet/readers'

describe('createChainReader', () => {
  beforeEach(() => {
    getEvmNativeBalance.mockReset()
    getStarknetNativeBalance.mockReset()
    getSuiNativeBalance.mockReset()
    getEvmNativeBalance.mockResolvedValue(11n)
    getStarknetNativeBalance.mockResolvedValue(22n)
    getSuiNativeBalance.mockResolvedValue(33n)
  })

  it('routes EVM balance reads by family', async () => {
    const reader = createChainReader('ethereum')
    expect(reader.family).toBe('evm')
    expect(reader.chainKey).toBe('ethereum')

    await expect(reader.getNativeBalance('0xabc')).resolves.toBe(11n)
    expect(getEvmNativeBalance).toHaveBeenCalledWith('ethereum', '0xabc')
    expect(getStarknetNativeBalance).not.toHaveBeenCalled()
    expect(getSuiNativeBalance).not.toHaveBeenCalled()
  })

  it('routes Starknet balance reads by family', async () => {
    const reader = createChainReader('starknet')
    expect(reader.family).toBe('starknet')

    await expect(reader.getNativeBalance('0xstark')).resolves.toBe(22n)
    expect(getStarknetNativeBalance).toHaveBeenCalledWith('0xstark')
  })

  it('routes Sui balance reads by family', async () => {
    const reader = createChainReader('sui')
    expect(reader.family).toBe('sui')

    await expect(reader.getNativeBalance('0xsui')).resolves.toBe(33n)
    expect(getSuiNativeBalance).toHaveBeenCalledWith('0xsui')
  })

  it('routes EVM balance reads for additional AppKit networks', async () => {
    for (const key of ['base', 'zksync', 'hyperevm'] as const) {
      getEvmNativeBalance.mockClear()
      const reader = createChainReader(key)
      expect(reader.family).toBe('evm')
      await expect(reader.getNativeBalance('0xabc')).resolves.toBe(11n)
      expect(getEvmNativeBalance).toHaveBeenCalledWith(key, '0xabc')
    }
  })
})

describe('getChainReader', () => {
  it('caches readers per chain key', () => {
    const a = getChainReader('base')
    const b = getChainReader('base')
    const c = getChainReader('sophon')

    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a.chainKey).toBe('base')
    expect(c.chainKey).toBe('sophon')
  })
})
