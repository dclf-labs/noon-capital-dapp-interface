import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type WalletClient } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { strToBn } from '@/lib/format'
import type { MintingOrder } from '@/lib/types'
import { ApiRequestStatus } from '@/lib/types'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

const sendRedeemOrder = async (
  order: MintingOrder,
  signature: string,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    return await fetch(`${appEnv.api.baseUrl}/api/redeem-usn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...order,
        signature,
        usnAmount: order.usnAmount.toString(),
        collateralAmount: order.collateralAmount.toString(),
      }),
    }).then(
      (res) => {
        if (res.ok) {
          setTxnStatus?.(ApiRequestStatus.API_CALL_SUCCESS)
          return true
        }
        throw new Error('Error occured when sending redeeming order.')
      },
      () => {
        throw new Error('Error occured when sending redeeming order.')
      },
    )
  } catch (error) {
    console.error('Error sending redeeming order', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const signRedeemOrder = async (
  wallet: WalletClient,
  chainId: number,
  owner: Address,
  tokenIn: Token,
  tokenOut: Token,
  usnAmount: number,
  collateralAmount: number,
  redeemHandler: Address | undefined,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    setTxnStatus?.(ApiRequestStatus.PROCESSING)

    const domain = {
      name: 'RedeemHandler',
      version: '1',
      chainId: chainId,
      verifyingContract: getAddressOrZeroAddress(redeemHandler),
    }

    const types = {
      RedeemOrder: [
        { name: 'message', type: 'string' },
        { name: 'user', type: 'address' },
        { name: 'collateralAddress', type: 'address' },
        { name: 'collateralAmount', type: 'uint256' },
        { name: 'usnAmount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    }

    const order: MintingOrder = {
      message: `You are signing a request to redeem ${collateralAmount} ${tokenOut.symbol} for ${usnAmount} USN.`,
      user: getAddressOrZeroAddress(owner),
      collateralAddress: getAddressOrZeroAddress(tokenOut.contractAddress),
      collateralAmount: strToBn(collateralAmount, tokenOut.decimals),
      usnAmount: strToBn(usnAmount, tokenIn.decimals),
      expiry: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Current date in sec + 24 hr in sec.
      nonce: Math.floor(Math.random() * 100000000000),
    }

    return await wallet
      .signTypedData({
        domain,
        types,
        message: order,
        primaryType: 'RedeemOrder',
        account: getAddressOrZeroAddress(owner),
      })
      .then((signature) => sendRedeemOrder(order, signature, setTxnStatus))
  } catch (error) {
    console.error('Error signing redeeming order', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const useRedeemSubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      tokenIn: Token | undefined,
      tokenOut: Token | undefined,
      amountIn: number | undefined,
      minAmountOut: number | undefined,
      callback?: () => void,
      setTxnStatus?: (status: ApiRequestStatus) => void,
    ) => {
      try {
        setTxnStatus?.(ApiRequestStatus.IDLE)

        if (!canWriteSession(connection)) {
          throw new Error('Wallet session cannot write')
        }

        if (
          !connection.config?.id ||
          !connection.address ||
          !tokenIn ||
          !tokenOut ||
          !amountIn ||
          !minAmountOut ||
          !connection.config?.redeemHandler
        ) {
          throw new Error('Invalid parameters')
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })
        if (write?.chain?.id !== connection.config?.id) {
          throw new Error('Invalid connection')
        }

        setTxnStatus?.(ApiRequestStatus.PROCESSING)

        try {
          const success = await signRedeemOrder(
            write,
            write?.chain?.id,
            connection.address,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            connection.config?.redeemHandler,
          )

          if (success) {
            callback?.()
          } else {
            setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
          }
        } catch {
          setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
        }
      } catch (error) {
        console.error('Error submitting redeem', error)
        setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useRedeemSubmit
