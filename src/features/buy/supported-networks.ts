import type { ChainKey } from '@/chains'
import { networkOptionsForKeys, protocolIdForChainKey } from '@/components/shell/network'
import { type ChainId, getDefaultChainId, isEvmChainId } from '@/lib/chain'

/** Buy product networks — Ethereum, zkSync, Sophon, Starknet. */
export const BUY_SUPPORTED_NETWORK_KEYS = [
  'ethereum',
  'zksync',
  'sophon',
  'starknet',
] as const satisfies readonly ChainKey[]

export type BuySupportedNetworkKey = (typeof BUY_SUPPORTED_NETWORK_KEYS)[number]

/** Shared copy for the buy network gate + switch modal. */
export const BUY_SUPPORTED_NETWORKS_COPY =
  'Choose Ethereum, ZKsync, Sophon, or Starknet to continue.'

/** True when the active product chain can run the buy flow. */
export function isBuySupportedChainId(chainId: ChainId | null | undefined): boolean {
  if (chainId == null) return false
  return BUY_SUPPORTED_NETWORK_KEYS.some(
    (key) => Number(protocolIdForChainKey(key)) === Number(chainId),
  )
}

/**
 * EVM buy tree target chain.
 * Supported buy EVM networks use themselves; anything else (TAC, Base, Sui, …)
 * falls back to Ethereum so the form stays fully populated while Switch network
 * gates the CTA.
 */
export function resolveBuyEvmChainId(selectedChainId: ChainId | null | undefined): ChainId {
  if (
    selectedChainId != null &&
    isEvmChainId(selectedChainId) &&
    isBuySupportedChainId(selectedChainId)
  ) {
    return selectedChainId
  }
  return getDefaultChainId()
}

/** Network options for the buy “Switch network” modal. */
export function getBuySupportedNetworkOptions() {
  return networkOptionsForKeys(BUY_SUPPORTED_NETWORK_KEYS)
}

export const BUY_SUPPORTED_NETWORK_OPTIONS = getBuySupportedNetworkOptions()
