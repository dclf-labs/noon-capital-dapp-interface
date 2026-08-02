import { useMemo } from 'react'

import type { Connection } from '@/lib/connection'

type ChainFamilySelectorParams<TResult> = {
  connection: Connection | undefined
  evm: TResult
  starknet: TResult
  /** Optional Sui branch — defaults to `fallback` when omitted. */
  sui?: TResult
  fallback: TResult
}

/**
 * Picks the network-specific result for the active connection family.
 *
 * Call every family hook unconditionally above this helper (with empty/disabled
 * stubs for inactive families) so React hook order stays stable, then pass the
 * results in here.
 */
const useChainFamily = <TResult>({
  connection,
  evm,
  starknet,
  sui,
  fallback,
}: ChainFamilySelectorParams<TResult>): TResult => {
  return useMemo(() => {
    if (!connection) return fallback
    if (connection.chainFamily === 'starknet') return starknet
    if (connection.chainFamily === 'sui') return sui ?? fallback
    return evm
  }, [connection, evm, fallback, starknet, sui])
}

export default useChainFamily
