import { useCallback, useMemo } from 'react'

import {
  MaxAllowanceTransferAmount,
  type PermitDetails,
  type PermitSingle,
} from '@uniswap/permit2-sdk'
import { type Config, getPublicClient, getWalletClient } from '@wagmi/core'
import { type Abi, type Client, maxUint256, type PublicClient, type WalletClient } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import { getCurvePool, getToken, getUniV3Pool, getUniV4Pool } from '@/config'
import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import {
  Actions,
  CommandType,
  encodePath,
  encodePermit,
  encodeUniV4Path,
  RoutePlanner,
  slippageAdjustedAmount,
  toDeadline,
  V4Planner,
} from '@/features/swap/lib/swap'
import CurveRouter from '@/lib/abis/evm/curve-router.json'
import Permit2 from '@/lib/abis/evm/permit2.json'
import UniswapUniversalRouter from '@/lib/abis/evm/uniswap-universal-router.json'
import UniswapV3SwapRouter from '@/lib/abis/evm/uniswap-v3-swap-router-01.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { strToBn, toBn } from '@/lib/format'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

const getCurveTxnPayload = async (
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
  minAmountOut: number,
  write: WalletClient,
  gasLimit?: bigint,
  setTxnStatus?: (status: TxnStatus) => void,
) => {
  try {
    if (!connection.config || !write?.chain || !write?.account || !connection.config?.curveRouter) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    const curvePool = getCurvePool(connection.config, tokenIn?.symbol, tokenOut?.symbol)
    if (!curvePool || !curvePool?.route?.length || !curvePool?.swapParams?.length) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    const amountInParsed = strToBn(amountIn, tokenIn.decimals)
    const amountOutMinimum = slippageAdjustedAmount(strToBn(minAmountOut, tokenOut.decimals), 1)

    return getTxnPayload(
      connection.config,
      write?.chain,
      write?.account,
      CurveRouter as Abi,
      'exchange',
      getAddressOrZeroAddress(connection.config?.curveRouter),
      [curvePool.route, curvePool.swapParams, amountInParsed, amountOutMinimum],
      undefined,
      gasLimit,
    )
  } catch (error) {
    console.error('Error getting payload for curve swap', error)
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }
}

const getUniV3TxnPayload = async (
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
  minAmountOut: number,
  write: WalletClient,
  gasLimit?: bigint,
  setTxnStatus?: (status: TxnStatus) => void,
) => {
  try {
    if (
      !connection.config ||
      !write?.chain ||
      !write?.account ||
      !connection.config?.uniV3SwapRouter
    ) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    const uniV3Pool = getUniV3Pool(connection.config, tokenIn?.symbol, tokenOut?.symbol)
    if (!uniV3Pool || !uniV3Pool?.path?.length || !uniV3Pool?.feePath?.length) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    const route = uniV3Pool.path?.map((token) =>
      getAddressOrZeroAddress(getToken(connection.config, token)?.contractAddress),
    )
    const fee = uniV3Pool.feePath
    const path = encodePath(route, fee)
    const amountInParsed = strToBn(amountIn, tokenIn.decimals)
    const amountOutMinimum = slippageAdjustedAmount(strToBn(minAmountOut, tokenOut.decimals), 1)

    return getTxnPayload(
      connection.config,
      write?.chain,
      write?.account,
      UniswapV3SwapRouter as Abi,
      'exactInput',
      getAddressOrZeroAddress(connection.config?.uniV3SwapRouter),
      [
        {
          path: path,
          recipient: connection.address,
          deadline: BigInt(toDeadline(5 * 60 * 1000)),
          amountIn: amountInParsed,
          amountOutMinimum: amountOutMinimum,
        },
      ],
      tokenIn.isNative ? amountInParsed : undefined,
      gasLimit,
    )
  } catch (error) {
    console.error('Error getting payload for uniV3 swap', error)
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }
}

const getUniV4TxnPayload = async (
  connection: EVMConnection,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
  minAmountOut: number,
  write: WalletClient,
  read: PublicClient,
  gasLimit?: bigint,
  setTxnStatus?: (status: TxnStatus) => void,
) => {
  try {
    if (!connection.config || !write?.chain || !write?.account || !connection.config?.rpcUrl) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    const uniV4Pool = getUniV4Pool(connection.config, tokenIn?.symbol, tokenOut?.symbol)
    if (!uniV4Pool?.poolKeyPath?.length) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    const allowanceData = (await read.readContract({
      address: getAddressOrZeroAddress(connection.config?.permit2),
      abi: Permit2 as Abi,
      functionName: 'allowance',
      args: [
        getAddressOrZeroAddress(write?.account?.address),
        getAddressOrZeroAddress(tokenIn.contractAddress),
        getAddressOrZeroAddress(connection.config?.uniUniversalRouter),
      ],
    })) as Array<bigint>

    const allowedAmount = BigInt(allowanceData?.at(0) || 0)
    const expiry = BigInt(allowanceData?.at(1) || 0) * BigInt(1000)
    const nonce = BigInt(allowanceData?.at(2) || 0)
    const currencyIn = getAddressOrZeroAddress(tokenIn.contractAddress)
    const amountInParsed = strToBn(amountIn, tokenIn.decimals)
    const amountOutMinimum = slippageAdjustedAmount(strToBn(minAmountOut, tokenOut.decimals), 1)
    const isApprovalNeeded = allowedAmount < amountInParsed || expiry < BigInt(Date.now())
    const encodedPath = encodeUniV4Path(
      uniV4Pool?.poolKeyPath?.map((pool) => ({
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
      currencyIn,
    )

    const v4Planner = new V4Planner()
    v4Planner.addAction(Actions.SWAP_EXACT_IN, [
      {
        currencyIn: currencyIn,
        path: encodedPath,
        amountIn: amountInParsed,
        amountOutMinimum: amountOutMinimum,
      },
    ])
    v4Planner.addAction(Actions.SETTLE_ALL, [currencyIn, maxUint256])
    v4Planner.addAction(Actions.TAKE_ALL, [getAddressOrZeroAddress(tokenOut.contractAddress), 0])

    let routePlanner = new RoutePlanner()

    if (isApprovalNeeded) {
      try {
        const permitSingle: PermitSingle = {
          details: {
            token: getAddressOrZeroAddress(tokenIn.contractAddress),
            amount: toBn(MaxAllowanceTransferAmount.toString()),
            expiration: toBn(toDeadline(1000 * 60 * 1).toString()),
            nonce: toBn(nonce.toString()),
          } as PermitDetails,
          spender: getAddressOrZeroAddress(connection.config?.uniUniversalRouter),
          sigDeadline: toBn(toDeadline(1000 * 60 * 60 * 30).toString()),
        }

        const types = {
          PermitDetails: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint160' },
            { name: 'expiration', type: 'uint48' },
            { name: 'nonce', type: 'uint48' },
          ],
          PermitSingle: [
            { name: 'details', type: 'PermitDetails' },
            { name: 'spender', type: 'address' },
            { name: 'sigDeadline', type: 'uint256' },
          ],
        }

        const signature = await write.signTypedData({
          account: getAddressOrZeroAddress(connection?.address),
          domain: {
            name: 'Permit2',
            chainId: write?.chain?.id,
            verifyingContract: getAddressOrZeroAddress(connection.config?.permit2),
          },
          types,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message: permitSingle as any,
          primaryType: 'PermitSingle',
        })
        if (!signature) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        routePlanner = encodePermit(routePlanner, { ...permitSingle, signature })
      } catch (error) {
        console.error('Error signing permit', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
        return
      }
    }

    routePlanner.addCommand(CommandType.V4_SWAP, [v4Planner.actions, v4Planner.params])
    if (
      !v4Planner?.actions?.length ||
      !v4Planner?.params?.length ||
      !routePlanner?.commands?.length ||
      !routePlanner?.inputs?.length
    ) {
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    return getTxnPayload(
      connection.config,
      write?.chain,
      write?.account,
      UniswapUniversalRouter as Abi,
      'execute',
      getAddressOrZeroAddress(connection.config?.uniUniversalRouter),
      [routePlanner.commands, routePlanner.inputs, BigInt(toDeadline(5 * 60 * 1000))],
      undefined,
      gasLimit,
    )
  } catch (error) {
    console.error('Error getting payload for uniV4 swap', error)
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }
}

const useBuySubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      tokenIn: Token | undefined,
      tokenOut: Token | undefined,
      amountIn: number | undefined,
      minAmountOut: number | undefined,
      gasLimit?: bigint,
      callback?: () => void,
      setTxnStatus?: (status: TxnStatus) => void,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.(TxnStatus.IDLE)

        if (!canWriteSession(connection)) {
          throw new Error('Wallet session cannot write')
        }

        if (
          !connection.config?.id ||
          !connection.address ||
          !tokenIn ||
          !tokenOut ||
          !amountIn ||
          !minAmountOut
        ) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        const read = getPublicClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
        })
        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })
        if (
          write?.chain?.id !== connection.config?.id ||
          read?.chain?.id !== connection.config?.id ||
          !write?.chain?.id
        ) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        setTxnStatus?.(TxnStatus.PROCESSING)

        const txnPayload = connection?.config?.useCurvePools
          ? await getCurveTxnPayload(
              connection,
              tokenIn,
              tokenOut,
              amountIn,
              minAmountOut,
              write,
              gasLimit,
              setTxnStatus,
            )
          : connection.config?.useUniv4Pools
            ? await getUniV4TxnPayload(
                connection,
                tokenIn,
                tokenOut,
                amountIn,
                minAmountOut,
                write,
                read,
                gasLimit,
                setTxnStatus,
              )
            : await getUniV3TxnPayload(
                connection,
                tokenIn,
                tokenOut,
                amountIn,
                minAmountOut,
                write,
                gasLimit,
                setTxnStatus,
              )

        if (!txnPayload) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        try {
          const _write = write
          const txnHash = await _write?.writeContract(txnPayload).then((txn) => txn as string)
          setTxnStatus?.(TxnStatus.TXN_SUBMITTED_ON_CHAIN)

          const receipt = await waitForTransactionReceipt(write as Client, {
            hash: txnHash as `0x${string}`,
            confirmations: 1,
            timeout: connection.config?.txnWaitTimeout || TXN_WAIT_TIMEOUT,
          }).catch((error) => {
            console.error('Timed out or failed waiting for transaction receipt', error)
            throw error
          })

          if (receipt.status === 'success') {
            setTxnStatus?.(TxnStatus.TXN_SUCCESS)
            setTxnUrl?.(
              `${connection.config?.explorerUrl || write?.chain?.blockExplorers?.default?.url}/tx/${txnHash}`,
            )
            callback?.()
          } else if (receipt.status === 'reverted') {
            setTxnStatus?.(TxnStatus.TXN_FAILURE)
          } else {
            setTxnStatus?.(TxnStatus.IDLE)
          }
        } catch (error) {
          console.error('Error submitting swap', error)
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
        }
      } catch (error) {
        console.error('Error submitting swap', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useBuySubmit
