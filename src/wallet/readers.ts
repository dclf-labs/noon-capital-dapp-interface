import { type ChainKey, getChain } from '@/chains'
import { getEvmNativeBalance } from '@/wallet/evm/reader'
import { getStarknetNativeBalance } from '@/wallet/starknet/reader'
import { getSuiNativeBalance } from '@/wallet/sui/reader'
import type { ChainReader } from '@/wallet/types'

/**
 * Factory for read-only clients. Safe to call for any registered chain
 * regardless of which wallet family is currently connected (bridge use-case).
 */
export function createChainReader(chainKey: ChainKey): ChainReader {
  const chain = getChain(chainKey)

  return {
    chainKey,
    family: chain.family,
    async getNativeBalance(address: string) {
      switch (chain.family) {
        case 'evm':
          return getEvmNativeBalance(chain.key, address as `0x${string}`)
        case 'starknet':
          return getStarknetNativeBalance(address)
        case 'sui':
          return getSuiNativeBalance(address)
        default: {
          const _exhaustive: never = chain
          return _exhaustive
        }
      }
    },
  }
}

const readerCache = new Map<ChainKey, ChainReader>()

export function getChainReader(chainKey: ChainKey): ChainReader {
  const cached = readerCache.get(chainKey)
  if (cached) return cached
  const reader = createChainReader(chainKey)
  readerCache.set(chainKey, reader)
  return reader
}
