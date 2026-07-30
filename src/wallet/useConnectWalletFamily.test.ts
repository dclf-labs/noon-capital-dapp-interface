import { beforeEach, describe, expect, it, vi } from 'vitest'

const openEvmAppKit = vi.fn()
const starknetConnect = vi.fn()
const suiOnOpen = vi.fn()

vi.mock('@/wallet/evm/open-appkit', () => ({
  openEvmAppKit: (...args: unknown[]) => openEvmAppKit(...args),
}))

vi.mock('@/wallet/starknet/useStarknetWallet', () => ({
  useStarknetWallet: () => ({
    connect: (...args: unknown[]) => starknetConnect(...args),
  }),
}))

vi.mock('@/features/shell', () => ({
  useSuiWalletSelector: () => ({
    onOpen: (...args: unknown[]) => suiOnOpen(...args),
  }),
}))

import { renderHook } from '@testing-library/react'

import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

describe('useConnectWalletFamily', () => {
  beforeEach(() => {
    openEvmAppKit.mockReset().mockResolvedValue(undefined)
    starknetConnect.mockReset().mockResolvedValue(undefined)
    suiOnOpen.mockReset()
  })

  it('opens AppKit for EVM', async () => {
    const { result } = renderHook(() => useConnectWalletFamily())
    await result.current('evm')
    expect(openEvmAppKit).toHaveBeenCalledOnce()
    expect(starknetConnect).not.toHaveBeenCalled()
    expect(suiOnOpen).not.toHaveBeenCalled()
  })

  it('opens starknetkit for Starknet', async () => {
    const { result } = renderHook(() => useConnectWalletFamily())
    await result.current('starknet')
    expect(starknetConnect).toHaveBeenCalledOnce()
    expect(openEvmAppKit).not.toHaveBeenCalled()
  })

  it('opens the Sui selector for Sui', async () => {
    const { result } = renderHook(() => useConnectWalletFamily())
    await result.current('sui')
    expect(suiOnOpen).toHaveBeenCalledOnce()
    expect(openEvmAppKit).not.toHaveBeenCalled()
  })
})
