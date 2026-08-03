import { beforeEach, describe, expect, it, vi } from 'vitest'

const openEvmAppKit = vi.fn()
const starknetOnOpen = vi.fn()
const suiOnOpen = vi.fn()

vi.mock('@/wallet/evm/open-appkit', () => ({
  openEvmAppKit: (...args: unknown[]) => openEvmAppKit(...args),
}))

vi.mock('@/features/shell/hooks/useStarknetWalletSelector', () => ({
  default: () => ({
    onOpen: (...args: unknown[]) => starknetOnOpen(...args),
  }),
}))

vi.mock('@/features/shell/hooks/useSuiWalletSelector', () => ({
  default: () => ({
    onOpen: (...args: unknown[]) => suiOnOpen(...args),
  }),
}))

import { renderHook } from '@testing-library/react'

import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

describe('useConnectWalletFamily', () => {
  beforeEach(() => {
    openEvmAppKit.mockReset().mockResolvedValue(undefined)
    starknetOnOpen.mockReset()
    suiOnOpen.mockReset()
  })

  it('opens AppKit for EVM only', async () => {
    const { result } = renderHook(() => useConnectWalletFamily())
    await result.current('evm')
    expect(openEvmAppKit).toHaveBeenCalledOnce()
    expect(starknetOnOpen).not.toHaveBeenCalled()
    expect(suiOnOpen).not.toHaveBeenCalled()
  })

  it('opens the Starknet selector for Starknet only', async () => {
    const { result } = renderHook(() => useConnectWalletFamily())
    await result.current('starknet')
    expect(starknetOnOpen).toHaveBeenCalledOnce()
    expect(openEvmAppKit).not.toHaveBeenCalled()
    expect(suiOnOpen).not.toHaveBeenCalled()
  })

  it('opens the Sui selector for Sui only', async () => {
    const { result } = renderHook(() => useConnectWalletFamily())
    await result.current('sui')
    expect(suiOnOpen).toHaveBeenCalledOnce()
    expect(openEvmAppKit).not.toHaveBeenCalled()
    expect(starknetOnOpen).not.toHaveBeenCalled()
  })
})
