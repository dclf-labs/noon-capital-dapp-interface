import { useMemo } from 'react'

import { type Abi, zeroAddress } from 'viem'

import { getCurvePool, getToken, getUniV3Pool, getUniV4Pool } from '@/config'
import { type Token } from '@/config/token'
import { encodePath, toDeadline } from '@/features/swap/lib/swap'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import CurveRouter from '@/lib/abis/evm/curve-router.json'
import UniswapUniversalRouter from '@/lib/abis/evm/uniswap-universal-router.json'
import UniswapV3SwapRouter from '@/lib/abis/evm/uniswap-v3-swap-router-01.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { strToBn } from '@/lib/format'

const useBuySubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
) => {
  const params = useMemo(() => {
    if (!tokenIn || !tokenOut || !tokenIn?.decimals) {
      return {
        connection,
        address: zeroAddress,
        args: [],
        configActionKey: 'swap',
        configActionKeyMultiplier: 1,
        abi: UniswapV3SwapRouter as Abi,
        functionName: 'exactInput',
      }
    }

    if (connection?.config?.useCurvePools) {
      const curvePool = getCurvePool(connection.config, tokenIn?.symbol, tokenOut?.symbol)
      if (!curvePool?.route?.length || !curvePool?.swapParams?.length) {
        return {
          connection,
          address: zeroAddress,
          args: [],
          configActionKey: 'swapCurve',
          configActionKeyMultiplier: 1,
          abi: CurveRouter as Abi,
          functionName: 'exchange',
        }
      }

      const amountInParsed = strToBn(`0.${'0'.repeat(tokenIn.decimals - 3)}111`, tokenIn.decimals)
      return {
        connection,
        address: getAddressOrZeroAddress(connection.config?.curveRouter),
        args: [curvePool.route, curvePool.swapParams, amountInParsed.toString(), '0'],
        configActionKey: 'swapCurve',
        configActionKeyMultiplier: curvePool?.swapParams?.length || 1,
        abi: CurveRouter as Abi,
        functionName: 'exchange',
      }
    }

    if (connection?.config?.useUniv4Pools && !connection?.config?.uniUniversalRouter) {
      return {
        connection,
        address: zeroAddress,
        args: [],
        configActionKey: 'swap',
        configActionKeyMultiplier: 1,
        abi: UniswapV3SwapRouter as Abi,
        functionName: 'exactInput',
      }
    }

    if (!connection?.config?.useUniv4Pools && !connection?.config?.uniV3SwapRouter) {
      return {
        connection,
        address: zeroAddress,
        args: [],
        configActionKey: 'swap',
        configActionKeyMultiplier: 1,
        abi: UniswapV3SwapRouter as Abi,
        functionName: 'exactInput',
      }
    }

    if (!connection?.config?.useUniv4Pools) {
      const uniV3Pool = getUniV3Pool(connection.config, tokenIn?.symbol, tokenOut?.symbol)
      if (!uniV3Pool || !uniV3Pool?.path?.length || !uniV3Pool?.feePath?.length) {
        return {
          connection,
          address: zeroAddress,
          args: [],
          configActionKey: 'swap',
          configActionKeyMultiplier: 1,
          abi: UniswapV3SwapRouter as Abi,
          functionName: 'exactInput',
        }
      }

      const route = uniV3Pool.path?.map((token) =>
        getAddressOrZeroAddress(getToken(connection.config, token)?.contractAddress),
      )
      const path = encodePath(route, uniV3Pool.feePath)
      const amountInParsed = strToBn(`0.${'0'.repeat(tokenIn.decimals - 3)}111`, tokenIn.decimals)

      return {
        connection,
        address: getAddressOrZeroAddress(connection.config?.uniV3SwapRouter),
        args: [
          {
            path: path,
            recipient: connection.address,
            deadline: BigInt(toDeadline(15 * 60 * 1000)).toString(),
            amountIn: amountInParsed.toString(),
            amountOutMinimum: '0',
          },
        ],
        configActionKey: 'swap',
        configActionKeyMultiplier: uniV3Pool?.feePath?.length || 1,
        abi: UniswapV3SwapRouter as Abi,
        functionName: 'exactInput',
      }
    }

    if (connection?.config?.useUniv4Pools) {
      const uniV4Pool = getUniV4Pool(connection.config, tokenIn?.symbol, tokenOut?.symbol)
      if (!uniV4Pool?.poolKeyPath?.length) {
        return {
          connection,
          address: zeroAddress,
          args: [],
          configActionKey: 'swapUniv4',
          configActionKeyMultiplier: 1,
          abi: UniswapUniversalRouter as Abi,
          functionName: 'execute',
        }
      }

      return {
        connection,
        address: zeroAddress,
        args: [],
        configActionKey: 'swapUniv4',
        configActionKeyMultiplier: uniV4Pool?.poolKeyPath?.length || 1,
      }
    }

    return {
      connection,
      address: zeroAddress,
      args: [],
      configActionKey: connection?.config?.useUniv4Pools ? 'swapUniv4' : 'swap',
      configActionKeyMultiplier: 1,
    }
  }, [connection, tokenIn, tokenOut])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: params?.abi || (UniswapV3SwapRouter as Abi),
    functionName: params?.functionName || 'exactInput',
    args: params?.args,
    configActionKey: params?.configActionKey || 'swap',
    configActionKeyMultiplier: params?.configActionKeyMultiplier || 1,
  })
}

export default useBuySubmitFee
