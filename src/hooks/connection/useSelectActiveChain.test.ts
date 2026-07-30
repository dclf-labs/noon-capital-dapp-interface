import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const setSelectedChainId = vi.fn()
const switchChainAsync = vi.fn()
let isConnected = true

vi.mock('@/state/active-chain', () => ({
  useActiveChainStore: (
    selector: (s: {
      selectedChainId: number
      setSelectedChainId: typeof setSelectedChainId
    }) => unknown,
  ) => selector({ selectedChainId: 1, setSelectedChainId }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected }),
  useSwitchChain: () => ({
    switchChainAsync,
    isPending: false,
  }),
}))

vi.mock('@/wallet/evm/config', () => ({
  wagmiAdapter: { wagmiConfig: {} },
}))

import { useSelectActiveChain } from '@/hooks/connection/useSelectActiveChain'
import { getStarknetChainId, getSuiChainId } from '@/lib/chain'

describe('useSelectActiveChain', () => {
  beforeEach(() => {
    setSelectedChainId.mockReset()
    switchChainAsync.mockReset().mockResolvedValue(undefined)
    isConnected = true
  })

  it('selects an EVM network in the dapp and requests a wallet switch when connected', async () => {
    const { result } = renderHook(() => useSelectActiveChain())
    await act(async () => {
      await result.current.selectActiveChain(8453)
    })
    expect(setSelectedChainId).toHaveBeenCalledWith(8453)
    expect(switchChainAsync).toHaveBeenCalledWith({ chainId: 8453 })
  })

  it('updates the dapp only when EVM wallet is not connected', async () => {
    isConnected = false
    const { result } = renderHook(() => useSelectActiveChain())
    await act(async () => {
      await result.current.selectActiveChain(8453)
    })
    expect(setSelectedChainId).toHaveBeenCalledWith(8453)
    expect(switchChainAsync).not.toHaveBeenCalled()
  })

  it('selects Starknet / Sui without calling switchChain', async () => {
    const starknetId = getStarknetChainId()!
    const suiId = getSuiChainId()!
    const { result } = renderHook(() => useSelectActiveChain())

    await act(async () => {
      await result.current.selectActiveChain(starknetId)
    })
    expect(setSelectedChainId).toHaveBeenCalledWith(starknetId)
    expect(switchChainAsync).not.toHaveBeenCalled()

    switchChainAsync.mockClear()
    setSelectedChainId.mockClear()

    await act(async () => {
      await result.current.selectActiveChain(suiId)
    })
    expect(setSelectedChainId).toHaveBeenCalledWith(suiId)
    expect(switchChainAsync).not.toHaveBeenCalled()
  })

  it('keeps the dapp selection when the wallet rejects switchChain', async () => {
    switchChainAsync.mockRejectedValue(new Error('user rejected'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { result } = renderHook(() => useSelectActiveChain())

    await act(async () => {
      await result.current.selectActiveChain(8453)
    })

    expect(setSelectedChainId).toHaveBeenCalledWith(8453)
    warn.mockRestore()
  })

  it('ignores invalid chain ids', async () => {
    const { result } = renderHook(() => useSelectActiveChain())
    await act(async () => {
      await result.current.selectActiveChain(999999 as never)
    })
    expect(setSelectedChainId).not.toHaveBeenCalled()
    expect(switchChainAsync).not.toHaveBeenCalled()
  })

  it('selects Ethereum and requests switchChain when connected', async () => {
    const { result } = renderHook(() => useSelectActiveChain())
    await act(async () => {
      await result.current.selectActiveChain(1)
    })
    expect(setSelectedChainId).toHaveBeenCalledWith(1)
    expect(switchChainAsync).toHaveBeenCalledWith({ chainId: 1 })
  })
})
