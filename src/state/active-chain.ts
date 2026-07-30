import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { ACTIVE_CHAIN_STORAGE_KEY } from '@/constants/ui'
import { type ChainId, getDefaultChainId, isValidChainId } from '@/lib/chain'

type ActiveChainStore = {
  /**
   * Dapp product network (EVM, Starknet, or Sui).
   * Always a valid chain id — defaults to Ethereum and persists across pages.
   * Does **not** authorize signing; wallet SDKs remain the only connection authority.
   */
  selectedChainId: ChainId
  setSelectedChainId: (chainId: ChainId | null) => void
}

function normalizeChainId(chainId: ChainId | null | undefined): ChainId {
  return isValidChainId(chainId) ? chainId : getDefaultChainId()
}

/** Always reads `globalThis.localStorage` at call time (test-friendly). */
const browserLocalStorage = {
  getItem: (name: string) => {
    try {
      return globalThis.localStorage?.getItem(name) ?? null
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      globalThis.localStorage?.setItem(name, value)
    } catch {
      // Ignore quota / private-mode failures
    }
  },
  removeItem: (name: string) => {
    try {
      globalThis.localStorage?.removeItem(name)
    } catch {
      // Ignore
    }
  },
}

/**
 * UI-selected product chain for the whole dapp.
 * - Default / invalid → Ethereum
 * - Persisted so navigation and reloads keep the last network
 */
export const useActiveChainStore = create<ActiveChainStore>()(
  persist(
    (set) => ({
      selectedChainId: getDefaultChainId(),
      setSelectedChainId: (chainId: ChainId | null) => {
        set({ selectedChainId: normalizeChainId(chainId) })
      },
    }),
    {
      name: ACTIVE_CHAIN_STORAGE_KEY,
      storage: createJSONStorage(() => browserLocalStorage),
      partialize: (state) => ({ selectedChainId: state.selectedChainId }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === 'object' && 'selectedChainId' in persisted
            ? (persisted as { selectedChainId?: ChainId }).selectedChainId
            : undefined
        return {
          ...current,
          selectedChainId: normalizeChainId(raw),
        }
      },
    },
  ),
)

export const getInitialChainId = () => getDefaultChainId()
