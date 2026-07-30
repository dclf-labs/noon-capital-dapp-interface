import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const setSelectedChainId = vi.fn()
let selectedChainId = 1
let wallet = { chainId: 1 as number | undefined, isConnected: true }

vi.mock('@/state/active-chain', () => ({
  useActiveChainStore: (
    selector: (s: {
      selectedChainId: number
      setSelectedChainId: typeof setSelectedChainId
    }) => unknown,
  ) => selector({ selectedChainId, setSelectedChainId }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => wallet,
}))

vi.mock('@/wallet/evm/config', () => ({
  wagmiAdapter: { wagmiConfig: {} },
}))

import { useSyncActiveChainFromEvmWallet } from '@/hooks/connection/useSyncActiveChainFromEvmWallet'
import { getStarknetChainId, getSuiChainId } from '@/lib/chain'

describe('useSyncActiveChainFromEvmWallet', () => {
  beforeEach(() => {
    setSelectedChainId.mockReset()
    selectedChainId = 1
    wallet = { chainId: 1, isConnected: true }
  })

  it('adopts the wallet network on connect when the dapp is on EVM', () => {
    wallet = { chainId: 8453, isConnected: true }
    renderHook(() => useSyncActiveChainFromEvmWallet())
    expect(setSelectedChainId).toHaveBeenCalledWith(8453)
  })

  it('follows a later EVM wallet network change while the dapp is on EVM', () => {
    const { rerender } = renderHook(() => useSyncActiveChainFromEvmWallet())
    expect(setSelectedChainId).not.toHaveBeenCalled()

    wallet = { chainId: 8453, isConnected: true }
    rerender()
    expect(setSelectedChainId).toHaveBeenCalledWith(8453)
  })

  it('does not overwrite a dapp EVM pick while the wallet has not changed yet', () => {
    const { rerender } = renderHook(() => useSyncActiveChainFromEvmWallet())
    setSelectedChainId.mockClear()

    // User picked Base in the dapp; MetaMask still on Ethereum.
    selectedChainId = 8453
    rerender()
    expect(setSelectedChainId).not.toHaveBeenCalled()
  })

  it('does not follow wallet changes while the dapp is on Starknet', () => {
    selectedChainId = getStarknetChainId()!
    const { rerender } = renderHook(() => useSyncActiveChainFromEvmWallet())
    setSelectedChainId.mockClear()

    wallet = { chainId: 8453, isConnected: true }
    rerender()
    expect(setSelectedChainId).not.toHaveBeenCalled()
  })

  it('does not follow wallet changes while the dapp is on Sui', () => {
    selectedChainId = getSuiChainId()!
    wallet = { chainId: 1, isConnected: true }
    const { rerender } = renderHook(() => useSyncActiveChainFromEvmWallet())
    setSelectedChainId.mockClear()

    wallet = { chainId: 8453, isConnected: true }
    rerender()
    expect(setSelectedChainId).not.toHaveBeenCalled()
  })

  it('does nothing when the wallet is disconnected', () => {
    wallet = { chainId: undefined, isConnected: false }
    renderHook(() => useSyncActiveChainFromEvmWallet())
    expect(setSelectedChainId).not.toHaveBeenCalled()
  })

  it('ignores unsupported wallet chain ids', () => {
    wallet = { chainId: 999999, isConnected: true }
    renderHook(() => useSyncActiveChainFromEvmWallet())
    expect(setSelectedChainId).not.toHaveBeenCalled()
  })

  it('does not re-set when wallet and dapp are already aligned on connect', () => {
    wallet = { chainId: 1, isConnected: true }
    selectedChainId = 1
    renderHook(() => useSyncActiveChainFromEvmWallet())
    expect(setSelectedChainId).not.toHaveBeenCalled()
  })

  it('follows wallet again after reconnect (previous cleared on disconnect)', () => {
    const { rerender } = renderHook(() => useSyncActiveChainFromEvmWallet())
    setSelectedChainId.mockClear()

    wallet = { chainId: undefined, isConnected: false }
    rerender()
    expect(setSelectedChainId).not.toHaveBeenCalled()

    wallet = { chainId: 8453, isConnected: true }
    rerender()
    expect(setSelectedChainId).toHaveBeenCalledWith(8453)
  })
})
