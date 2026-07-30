import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ACTIVE_CHAIN_STORAGE_KEY } from '@/constants/ui'
import { getStarknetChainId, getSuiChainId } from '@/lib/chain'
import { getInitialChainId, useActiveChainStore } from '@/state/active-chain'

const memory = new Map<string, string>()

describe('useActiveChainStore', () => {
  beforeEach(() => {
    memory.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
      clear: () => memory.clear(),
      key: () => null,
      length: 0,
    })
    useActiveChainStore.setState({ selectedChainId: 1 })
    useActiveChainStore.persist.clearStorage()
  })

  it('defaults to Ethereum', () => {
    expect(getInitialChainId()).toBe(1)
    expect(useActiveChainStore.getState().selectedChainId).toBe(1)
  })

  it('accepts a valid chain id', () => {
    useActiveChainStore.getState().setSelectedChainId(8453)
    expect(useActiveChainStore.getState().selectedChainId).toBe(8453)
  })

  it('resets invalid chain ids to Ethereum', () => {
    useActiveChainStore.getState().setSelectedChainId(8453)
    useActiveChainStore.getState().setSelectedChainId(999999 as never)
    expect(useActiveChainStore.getState().selectedChainId).toBe(1)
  })

  it('treats null as a reset to Ethereum', () => {
    useActiveChainStore.getState().setSelectedChainId(8453)
    useActiveChainStore.getState().setSelectedChainId(null)
    expect(useActiveChainStore.getState().selectedChainId).toBe(1)
  })

  it('switches between EVM, Starknet, and Sui product chains', () => {
    const starknetId = getStarknetChainId()!
    const suiId = getSuiChainId()!

    useActiveChainStore.getState().setSelectedChainId(1)
    expect(useActiveChainStore.getState().selectedChainId).toBe(1)

    useActiveChainStore.getState().setSelectedChainId(8453)
    expect(useActiveChainStore.getState().selectedChainId).toBe(8453)

    useActiveChainStore.getState().setSelectedChainId(starknetId)
    expect(useActiveChainStore.getState().selectedChainId).toBe(starknetId)

    useActiveChainStore.getState().setSelectedChainId(suiId)
    expect(useActiveChainStore.getState().selectedChainId).toBe(suiId)

    useActiveChainStore.getState().setSelectedChainId(1)
    expect(useActiveChainStore.getState().selectedChainId).toBe(1)
  })

  it('persists the latest selection for other pages / reloads', () => {
    const starknetId = getStarknetChainId()!
    useActiveChainStore.getState().setSelectedChainId(starknetId)

    const raw = memory.get(ACTIVE_CHAIN_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(raw).toContain(String(starknetId))
  })

  it('rehydrates a persisted selection', async () => {
    const suiId = getSuiChainId()!
    memory.set(
      ACTIVE_CHAIN_STORAGE_KEY,
      JSON.stringify({ state: { selectedChainId: suiId }, version: 0 }),
    )

    await useActiveChainStore.persist.rehydrate()
    expect(useActiveChainStore.getState().selectedChainId).toBe(suiId)
  })

  it('rehydrates invalid persisted values to Ethereum', async () => {
    memory.set(
      ACTIVE_CHAIN_STORAGE_KEY,
      JSON.stringify({ state: { selectedChainId: 999999 }, version: 0 }),
    )
    await useActiveChainStore.persist.rehydrate()
    expect(useActiveChainStore.getState().selectedChainId).toBe(1)
  })

  it('persists Base and rehydrates it for cross-page consistency', async () => {
    useActiveChainStore.getState().setSelectedChainId(8453)
    await useActiveChainStore.persist.rehydrate()
    expect(useActiveChainStore.getState().selectedChainId).toBe(8453)
  })
})
