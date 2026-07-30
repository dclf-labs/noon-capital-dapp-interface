import { useMemo } from 'react'

import { type Token } from '@/config/token'
import { type SwapSide } from '@/features/swap/hooks/usePreviewSwap'
import { useChainQuery } from '@/hooks/query/useChainQuery'
import { isAddressValid } from '@/lib/address'
import { type EkuboSwapInfoResponse, type EkuboSwapInfoRoute } from '@/lib/api'
import { type StarknetConnection } from '@/lib/connection'
import { bnToStr, strToBn, toBn, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

export type EkuboPreviewResult = {
  quote: number
  route: EkuboSwapInfoRoute[]
}

const EMPTY_PREVIEW: EkuboPreviewResult = { quote: 0, route: [] }

const EKUBO_QUOTER_BASE = 'https://prod-api-quoter.ekubo.org/23448594291968334'

async function fetchEkuboPreview(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
): Promise<EkuboPreviewResult> {
  const amountInBn = strToBn(amountIn, tokenIn.decimals)
  const response = await fetch(
    `${EKUBO_QUOTER_BASE}/${amountInBn}/${tokenIn.contractAddress}/${tokenOut.contractAddress}`,
  )
  if (!response.ok) {
    throw new Error('Failed to fetch ekubo swap info.')
  }

  const data = (await response.json()) as EkuboSwapInfoResponse
  const quote = toNum(
    bnToStr(
      data.total_calculated ||
        data.splits?.reduce((acc, curr) => toBn(acc) + toBn(curr.amount_calculated), toBn(0)) /
          toBn(data.splits?.length || 0) ||
        0,
      tokenOut.decimals,
    ),
  )

  return {
    quote,
    route: (data.splits?.flatMap((split) => split.route || []) || []) as EkuboSwapInfoRoute[],
  }
}

/**
 * Shared Starknet Ekubo preview for buy and sell.
 */
export function usePreviewEkuboSwap(
  side: SwapSide,
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
) {
  const enabled = useMemo(
    () =>
      isAddressValid(tokenIn?.contractAddress) &&
      isAddressValid(tokenOut?.contractAddress) &&
      isAddressValid(connection.config?.ekuboRouter) &&
      !!connection.config?.id &&
      !!amountIn,
    [
      amountIn,
      connection.config?.ekuboRouter,
      connection.config?.id,
      tokenIn?.contractAddress,
      tokenOut?.contractAddress,
    ],
  )

  const queryKey = useMemo(
    () =>
      queryKeys[side].preview(
        tokenIn?.contractAddress,
        tokenOut?.contractAddress,
        amountIn,
        connection.config?.ekuboRouter,
        connection.config?.id,
      ),
    [
      side,
      tokenIn?.contractAddress,
      tokenOut?.contractAddress,
      amountIn,
      connection.config?.ekuboRouter,
      connection.config?.id,
    ],
  )

  return useChainQuery({
    queryKey,
    enabled,
    fallback: EMPTY_PREVIEW,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async () => {
      if (!amountIn) return EMPTY_PREVIEW
      if (!tokenIn || !tokenOut || !tokenIn.decimals || !tokenOut.decimals) {
        throw new Error('Chains not synced')
      }
      return fetchEkuboPreview(tokenIn, tokenOut, amountIn)
    },
  })
}
