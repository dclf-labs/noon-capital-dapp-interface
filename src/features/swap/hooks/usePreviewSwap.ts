import { useMemo } from 'react'

import { type Token } from '@/config/token'
import { getEvmPoolQuote } from '@/features/swap/lib/evm-quotes'
import { useChainQuery } from '@/hooks/query/useChainQuery'
import { isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'

export type SwapSide = 'buy' | 'sell'

/**
 * Shared EVM DEX preview for buy and sell (identical quote path; distinct cache keys).
 */
export function usePreviewSwap(
  side: SwapSide,
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
) {
  const enabled = useMemo(
    () =>
      isAddressValid(tokenIn?.contractAddress) &&
      isAddressValid(tokenOut?.contractAddress) &&
      !!connection.config?.id,
    [connection.config?.id, tokenIn, tokenOut],
  )

  const queryKey = useMemo(
    () =>
      queryKeys[side].preview(
        tokenIn?.contractAddress,
        tokenOut?.contractAddress,
        amountIn,
        connection.config?.id,
        connection.config?.useUniv4Pools,
      ),
    [
      side,
      tokenIn?.contractAddress,
      tokenOut?.contractAddress,
      amountIn,
      connection.config?.id,
      connection.config?.useUniv4Pools,
    ],
  )

  return useChainQuery({
    queryKey,
    enabled,
    fallback: 0,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async () => {
      if (!amountIn) return 0
      if (!tokenIn || !tokenOut) throw new Error('Chains not synced')
      return getEvmPoolQuote(connection, tokenIn, tokenOut, amountIn)
    },
  })
}
