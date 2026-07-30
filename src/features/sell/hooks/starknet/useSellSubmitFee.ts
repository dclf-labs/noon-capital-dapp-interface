import { useMemo } from 'react'

import { uint256 } from 'starknet'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { slippageAdjustedAmount } from '@/features/swap/lib/swap'
import useGasFee from '@/hooks/on-chain/starknet/useGasFee'
import { type EkuboSwapInfoRoute } from '@/lib/api'
import { type StarknetConnection } from '@/lib/connection'
import { strToBn, toBn } from '@/lib/format'

const useSellSubmitFee = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
  minimumAmountOut: number | undefined,
  route: EkuboSwapInfoRoute[],
) => {
  const params = useMemo(() => {
    // pick a fallback tiny amount if undefined
    const _amountIn = amountIn
      ? strToBn(amountIn, tokenIn?.decimals)
      : strToBn(`0.${'0'.repeat((tokenIn?.decimals || 2) - 2)}11`, tokenIn?.decimals || 18)

    const router = connection?.config?.ekuboRouter as Address

    // transfer calldata
    const transferCalldata = [
      router,
      uint256.bnToUint256(_amountIn).low.toString(),
      uint256.bnToUint256(_amountIn).high.toString(),
    ]

    // multihop_swap calldata
    const routeCalldata =
      route && route.length > 0
        ? [
            route.length.toString(),
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
            tokenIn?.contractAddress || '0x0',
            _amountIn.toString(),
            '0', // bool False
          ]
        : ['0'] // empty array length

    // clear_minimum calldata
    const minAmount = slippageAdjustedAmount(strToBn(minimumAmountOut, tokenOut?.decimals || 18), 1)
    const clearMinimumCalldata = [
      tokenOut?.contractAddress || '0x0',
      uint256.bnToUint256(minAmount).low.toString(),
      uint256.bnToUint256(minAmount).high.toString(),
    ]

    // clear calldata
    const clearCalldata = [tokenIn?.contractAddress || '0x0']

    return {
      connection,
      address: tokenIn?.contractAddress as Address,
      functionName: 'transfer',
      calls: [
        {
          contractAddress: tokenIn?.contractAddress || '0x0',
          entrypoint: 'transfer',
          calldata: transferCalldata,
        },
        {
          contractAddress: router,
          entrypoint: 'multihop_swap',
          calldata: routeCalldata,
        },
        {
          contractAddress: router,
          entrypoint: 'clear_minimum',
          calldata: clearMinimumCalldata,
        },
        {
          contractAddress: router,
          entrypoint: 'clear',
          calldata: clearCalldata,
        },
      ],
    }
  }, [amountIn, connection, minimumAmountOut, route, tokenIn, tokenOut])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    functionName: params?.functionName,
    calls: params?.calls,
    configActionKey: 'swap',
  })
}

export default useSellSubmitFee
