/**
 * Goldsky / holdings subgraph URL helpers.
 *
 * Protocol configs declare `holdingsSubgraphChain`; actual URLs come from
 * `appEnv.subgraphs` (never hardcode Goldsky hosts in feature code).
 */
import type { ProtocolChainConfig } from '@/config/types'
import { type AppEnv, appEnv } from '@/lib/env'

export type HoldingsToken = 'usn' | 'susn'

/** Resolve a holdings subgraph URL for a protocol chain + token. */
export function getHoldingsSubgraphUrl(
  config: ProtocolChainConfig | undefined,
  token: HoldingsToken,
  source: AppEnv = appEnv,
): string | undefined {
  const chain = config?.holdingsSubgraphChain
  if (!chain) return undefined
  const url = source.subgraphs.holdings[chain][token]
  return url || undefined
}

/** Ethereum meta subgraph used for aggregated on-chain indexing. */
export function getEthMetaSubgraphUrl(source: AppEnv = appEnv): string | undefined {
  return source.subgraphs.ethMeta || undefined
}
