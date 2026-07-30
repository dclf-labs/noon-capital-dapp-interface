import { type Config, getPublicClient } from '@wagmi/core'
import { type Abi } from 'viem'
import { mainnet } from 'wagmi/chains'

import { getCurvePool, getToken, getUniV3Pool, getUniV4Pool } from '@/config'
import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { encodePath, encodeUniV4Path } from '@/features/swap/lib/swap'
import CurveRouter from '@/lib/abis/evm/curve-router.json'
import SyncswapV3QuoterV2 from '@/lib/abis/evm/syncswap-v3-quoter-v2.json'
import UniswapV3QuoterV2 from '@/lib/abis/evm/uniswap-v3-quoter-v2.json'
import UniswapV4Quoter from '@/lib/abis/evm/uniswap-v4-quoter.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, strToBn, toNum } from '@/lib/format'
import { wagmiConfig } from '@/wallet/evm/config'

type PublicClient = NonNullable<ReturnType<typeof getPublicClient>>

async function getCurvePoolQuote(
  read: PublicClient,
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
) {
  const curvePool = getCurvePool(connection.config, tokenIn.symbol, tokenOut.symbol)
  if (
    !curvePool?.route?.length ||
    !connection.config?.curveRouter ||
    !curvePool?.swapParams?.length
  ) {
    throw new Error('Configuration for pair not found')
  }

  const amountInParsed = strToBn(amountIn, tokenIn.decimals)
  const minAmountOut = await read.readContract({
    abi: CurveRouter as Abi,
    functionName: 'get_dy',
    args: [curvePool.route, curvePool.swapParams, amountInParsed],
    address: getAddressOrZeroAddress(connection.config.curveRouter),
  })

  return toNum(bnToStr(minAmountOut, tokenOut.decimals))
}

async function getUniV3PoolQuote(
  read: PublicClient,
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
) {
  const uniV3Pool = getUniV3Pool(connection.config, tokenIn.symbol, tokenOut.symbol)
  if (
    !uniV3Pool ||
    !connection.config?.uniV3Factory ||
    !connection.config?.uniV3Quoter ||
    !uniV3Pool.path?.length ||
    !uniV3Pool.feePath?.length
  ) {
    throw new Error('Configuration for pair not found')
  }

  const fee = uniV3Pool.feePath
  const route = uniV3Pool.path.map((token) =>
    getAddressOrZeroAddress(getToken(connection.config, token)?.contractAddress),
  )

  const amountInParsed = strToBn(amountIn, tokenIn.decimals)
  const simulateResponse = await read.simulateContract({
    abi: connection.config.id === mainnet.id ? UniswapV3QuoterV2 : SyncswapV3QuoterV2,
    functionName: 'quoteExactInput',
    args:
      connection.config.id === mainnet.id
        ? [encodePath(route, fee), amountInParsed]
        : [connection.config.uniV3Factory, encodePath(route, fee), amountInParsed],
    address: getAddressOrZeroAddress(connection.config.uniV3Quoter),
  })

  const minAmountOut = (simulateResponse?.result as Array<bigint>)?.at(0)
  return toNum(bnToStr(minAmountOut, tokenOut.decimals))
}

async function getUniV4PoolQuote(
  read: PublicClient,
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
) {
  const uniV4Pool = getUniV4Pool(connection.config, tokenIn.symbol, tokenOut.symbol)
  if (!uniV4Pool || !connection.config?.univ4Quoter) {
    throw new Error('Configuration for pair not found')
  }

  const quoteExactParams = {
    exactCurrency: getAddressOrZeroAddress(tokenIn.contractAddress),
    exactAmount: strToBn(amountIn, tokenIn.decimals),
    path: encodeUniV4Path(
      uniV4Pool.poolKeyPath?.map((pool) => ({
        currency0: getAddressOrZeroAddress(
          getToken(connection.config, pool.currency0)?.contractAddress,
        ),
        currency1: getAddressOrZeroAddress(
          getToken(connection.config, pool.currency1)?.contractAddress,
        ),
        fee: pool.fee,
        tickSpacing: pool.tickSpacing,
        hooks: pool.hooks,
      })) || [],
      getAddressOrZeroAddress(tokenIn.contractAddress),
    ),
  }

  const simulateResponse = await read.simulateContract({
    abi: UniswapV4Quoter as Abi,
    functionName: 'quoteExactInput',
    args: [quoteExactParams],
    address: getAddressOrZeroAddress(connection.config.univ4Quoter),
  })

  const minAmountOut = (simulateResponse?.result as Array<bigint>)?.at(0)
  return toNum(bnToStr(minAmountOut, tokenOut.decimals))
}

/**
 * Quote an exact-in DEX swap on the connection's active pool family.
 */
export async function getEvmPoolQuote(
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
): Promise<number> {
  if (!connection.config?.id) {
    throw new Error('Chains not synced')
  }

  const read = getPublicClient(wagmiConfig as Config, {
    chainId: connection.config.id as ProtocolChainId,
  })
  if (!read || read.chain?.id !== connection.config.id) {
    throw new Error('Chains not synced')
  }

  if (connection.config.useCurvePools) {
    return getCurvePoolQuote(read, connection, tokenIn, tokenOut, amountIn)
  }

  if (connection.config.useUniv4Pools) {
    return getUniV4PoolQuote(read, connection, tokenIn, tokenOut, amountIn)
  }

  return getUniV3PoolQuote(read, connection, tokenIn, tokenOut, amountIn)
}
