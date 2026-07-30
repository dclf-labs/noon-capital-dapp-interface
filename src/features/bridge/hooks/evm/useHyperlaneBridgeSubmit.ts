import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { zeroPadValue } from 'ethers'
import { type Abi, type Client } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { STARKNET_BRIDGE_DESTINATION, TXN_WAIT_TIMEOUT } from '@/constants/common'
import LayerzeroAndHyperlaneToken from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { strToBn, toBn } from '@/lib/format'
import { type TxnStatus } from '@/lib/types'
import { wagmiConfig } from '@/wallet/evm/config'

const useHyperlaneBridgeSubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      tokenIn: Token | undefined,
      tokenOut: Token | undefined,
      amount: number | undefined,
      receiverAddress: Address | undefined,
      nativeFee: number | undefined,
      destinationConnection: EVMConnection | undefined,
      gasLimit?: bigint,
      callback?: () => void,
      setTxnStatus?: (status: TxnStatus) => void,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.('IDLE')

        if (
          !connection.config?.id ||
          !connection.address ||
          !connection.config?.hyperlaneMailbox ||
          !connection.config?.hyperlaneDomain ||
          !destinationConnection?.config?.id ||
          !destinationConnection?.config?.hyperlaneDomain ||
          !receiverAddress ||
          !tokenIn ||
          !tokenOut ||
          !amount ||
          !isAddressValid(tokenIn?.hyperlane)
        ) {
          setTxnStatus?.('TXN_FAILURE')
          return
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })
        if (write?.chain?.id !== connection.config?.id) {
          setTxnStatus?.('TXN_FAILURE')
          return
        }
        if (write?.chain?.id === destinationConnection.config?.id) {
          setTxnStatus?.('TXN_FAILURE')
          return
        }

        setTxnStatus?.('PROCESSING')

        const _decimals =
          connection?.config?.defaultGasToken?.decimals || write?.chain?.nativeCurrency?.decimals
        const sendNativeFee = strToBn(nativeFee, _decimals)

        const sendArgs = [
          toBn(destinationConnection?.config?.hyperlaneDomain),
          destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id
            ? receiverAddress
            : zeroPadValue(getAddressOrZeroAddress(receiverAddress), 32),
          strToBn(amount, tokenIn?.decimals),
        ]

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          LayerzeroAndHyperlaneToken as Abi,
          'sendTokensViaHyperlane',
          getAddressOrZeroAddress(tokenIn?.hyperlane),
          sendArgs,
          sendNativeFee,
          gasLimit,
        )

        try {
          const _write = write
          const txnHash = await _write?.writeContract(txnPayload).then((txn) => txn as string)

          setTxnStatus?.('TXN_SUBMITTED_ON_CHAIN')

          const receipt = await waitForTransactionReceipt(write as Client, {
            hash: txnHash as `0x${string}`,
            confirmations: 1,
            timeout: connection.config?.txnWaitTimeout || TXN_WAIT_TIMEOUT,
          }).catch(() => ({
            status: 'success',
          }))

          if (receipt.status === 'success') {
            setTxnStatus?.('TXN_SUCCESS')
            setTxnUrl?.(
              `${connection.config?.explorerUrl || write?.chain?.blockExplorers?.default?.url}/tx/${txnHash}`,
            )
            callback?.()
          } else if (receipt.status === 'reverted') {
            setTxnStatus?.('TXN_FAILURE')
          } else {
            setTxnStatus?.('IDLE')
          }
        } catch (error) {
          console.error('Error approving token', error)
          setTxnStatus?.('TXN_FAILURE')
        }
      } catch (error) {
        console.error('Error submitting bridge transaction', error)
        setTxnStatus?.('TXN_FAILURE')
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useHyperlaneBridgeSubmit
