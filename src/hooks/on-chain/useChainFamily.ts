import { useMemo } from 'react'

import type { Connection } from '@/lib/connection'

type ChainFamilySelectorParams<TResult> = {
  connection: Connection | undefined
  evm: () => TResult
  starknet: () => TResult
  /** Optional Sui branch — defaults to `fallback` when omitted. */
  sui?: () => TResult
  fallback: TResult
}

/**
 * Executes network-specific hooks once per render and returns the
 * appropriate result based on the current connection's chain family.
 * Callers must still provide safe params for inactive hooks (e.g. empty
 * connection stubs) so React hook order stays stable.
 */
const useChainFamily = <TResult>({
  connection,
  evm,
  starknet,
  sui,
  fallback,
}: ChainFamilySelectorParams<TResult>): TResult => {
  const evmResult = evm()
  const starknetResult = starknet()
  const suiResult = sui?.()

  return useMemo(() => {
    if (!connection) return fallback
    if (connection.chainFamily === 'starknet') return starknetResult
    if (connection.chainFamily === 'sui') return suiResult ?? fallback
    return evmResult
  }, [connection, evmResult, fallback, starknetResult, suiResult])
}

export default useChainFamily
