import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type WalletClient } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { strToBn } from '@/lib/format'
import { ApiRequestStatus } from '@/lib/types'
import { type MintingOrder } from '@/lib/types'
import { wagmiConfig } from '@/wallet/evm/config'

const sendMintingOrder = async (
  order: MintingOrder,
  signature: string,
  setTxnStatus?: (status: ApiRequestStatus) => void,
  collateralAmount?: number,
  collateral?: Token,
) => {
  try {
    return await fetch(`${appEnv.api.baseUrl}/api/mint-usn`, {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dataLayer = (window as any)?.dataLayer || undefined
          if (dataLayer) {
            dataLayer.push({
              event: 'dApp minted',
              transaction_hash: '',
              transaction_amount: collateralAmount || 0,
              payment_type: 'mint',
              token_contract_address: collateral?.contractAddress,
              network_chain_id: 1,
            })
          }
          setTxnStatus?.(ApiRequestStatus.API_CALL_SUCCESS)
          return true
        }
        throw new Error('Error occured when sending minting order.')
      },
      () => {
        throw new Error('Error occured when sending minting order.')
      },
    )
  } catch (error) {
    console.error('Error sending minting order', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const signMintingOrder = async (
  wallet: WalletClient,
  chainId: number,
  owner: Address,
  tokenIn: Token,
  tokenOut: Token,
  collateralAmount: number,
  usnAmount: number,
  mintHandler: Address | undefined,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    setTxnStatus?.(ApiRequestStatus.PROCESSING)

    const domain = {
      name: 'MinterHandler',
      version: '1',
      chainId: chainId,
      verifyingContract: getAddressOrZeroAddress(mintHandler),
    }

    const types = {
      Order: [
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
      message: `I, the undersigned, hereby agree to mint ${usnAmount} USN against ${collateralAmount} ${tokenIn.symbol}.

      I acknowledge that:

1. This transaction is irreversible once confirmed.
2. I am subject to the protocol's terms and conditions.
3. The value of USN and ${tokenIn.symbol} may fluctuate.
4. I assume all risks associated with this transaction.
5. Neither the developers nor the protocol shall be held liable for any losses incurred.
6. I am responsible for ensuring compliance with all applicable laws and regulations.

By proceeding, I confirm that I have read, understood, and agree to the above terms.`,
      user: getAddressOrZeroAddress(owner),
      collateralAmount: strToBn(collateralAmount, tokenIn.decimals),
      usnAmount: strToBn(usnAmount, tokenOut.decimals),
      nonce: Math.floor(Math.random() * 100000000000),
      expiry: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Current date in sec + 24 hr in sec.
      collateralAddress: getAddressOrZeroAddress(tokenIn.contractAddress),
    }

    return await wallet
      .signTypedData({
        domain,
        types,
        message: order,
        primaryType: 'Order',
        account: getAddressOrZeroAddress(owner),
      })
      .then((signature) =>
        sendMintingOrder(order, signature, setTxnStatus, collateralAmount, tokenIn),
      )
  } catch (error) {
    console.error('Error signing minting order', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const useMintApiSubmit = () => {
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

        if (
          !connection.config?.id ||
          !connection.address ||
          !tokenIn ||
          !tokenOut ||
          !amountIn ||
          !minAmountOut ||
          !connection.config?.mintHandler
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
          const success = await signMintingOrder(
            write,
            write?.chain?.id,
            connection.address,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            connection.config?.mintHandler,
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
        console.error('Error submitting minting order', error)
        setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useMintApiSubmit
