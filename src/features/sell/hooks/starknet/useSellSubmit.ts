import { useMemo } from 'react'

import { useSendTransaction } from '@starknet-react/core'
import { uint256 } from 'starknet'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { slippageAdjustedAmount } from '@/features/swap/lib/swap'
import { type EkuboSwapInfoRoute } from '@/lib/api'
import { type StarknetConnection } from '@/lib/connection'
import { strToBn, toBn } from '@/lib/format'
import { canWriteSession } from '@/lib/wallet-session'

const useSellSubmit = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
  minimumAmountOut: number | undefined,
  route: EkuboSwapInfoRoute[],
) => {
  const { send, data, isPending, isError, isSuccess } = useSendTransaction({
    calls:
      canWriteSession(connection) &&
      !!connection?.config?.id &&
      !!tokenIn &&
      !!tokenOut &&
      !!amountIn &&
      !!route?.length &&
      !!tokenIn?.contractAddress &&
      !!tokenOut?.contractAddress &&
      !!connection?.config?.ekuboRouter
        ? [
            // 1. ERC20 transfer to router
            {
              contractAddress: tokenIn.contractAddress as Address,
              entrypoint: 'transfer',
              calldata: [
                connection.config.ekuboRouter as Address,
                uint256.bnToUint256(strToBn(amountIn, tokenIn.decimals)).low.toString(),
                uint256.bnToUint256(strToBn(amountIn, tokenIn.decimals)).high.toString(),
              ],
            },
            // 2. multihop_swap
            {
              contractAddress: connection.config.ekuboRouter as Address,
              entrypoint: 'multihop_swap',
              calldata: [
                // array length
                route.length.toString(),
                // flatten each RouteNode
                ...route.flatMap((r) => {
                  const poolKey = [
                    r.pool_key.token0 as Address,
                    r.pool_key.token1 as Address,
                    r.pool_key.fee?.toString() || '0',
                    r.pool_key.tick_spacing?.toString() || '0',
                    r.pool_key.extension?.toString() || '0x0',
                  ]
                  const sqrt = uint256.bnToUint256(toBn(r.sqrt_ratio_limit?.toString() || '0'))
                  return [
                    ...poolKey,
                    sqrt.low.toString(),
                    sqrt.high.toString(),
                    r.skip_ahead?.toString() || '0',
                  ]
                }),
                // tokenAmount
                tokenIn.contractAddress as Address,
                strToBn(amountIn, tokenIn.decimals).toString(),
                '0', // bool False
              ],
            },
            // 3. clear_minimum
            {
              contractAddress: connection.config.ekuboRouter as Address,
              entrypoint: 'clear_minimum',
              calldata: [
                tokenOut.contractAddress as Address,
                uint256
                  .bnToUint256(
                    slippageAdjustedAmount(strToBn(minimumAmountOut, tokenOut.decimals), 1),
                  )
                  .low.toString(),
                uint256
                  .bnToUint256(
                    slippageAdjustedAmount(strToBn(minimumAmountOut, tokenOut.decimals), 1),
                  )
                  .high.toString(),
              ],
            },
            // 4. clear
            {
              contractAddress: connection.config.ekuboRouter as Address,
              entrypoint: 'clear',
              calldata: [tokenIn.contractAddress as Address],
            },
          ]
        : undefined,
  })

  return useMemo(
    () => ({
      mutationStatus: {
        isPending,
        isError,
        isSuccess,
      },
      onSubmit: send,
      txnHash: data?.transaction_hash || undefined,
    }),
    [isPending, isError, isSuccess, send, data?.transaction_hash],
  )
}

export default useSellSubmit
