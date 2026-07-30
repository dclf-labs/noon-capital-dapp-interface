import { useCallback, useMemo } from 'react'

import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { type Config, getWalletClient } from '@wagmi/core'
import { type Abi, type Client, fromBytes } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { IS_LAYERZERO_BRIDGE_DISABLED, TXN_WAIT_TIMEOUT } from '@/constants/common'
import { getBridgeOptionsForDestination } from '@/features/bridge/lib/bridge'
import LayerzeroOft from '@/lib/abis/evm/layerzero-oft.json'
import LayerzeroOftHelper from '@/lib/abis/evm/layerzero-oft-helper.json'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress, getLayerZeroReceiverAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { strToBn, toBn } from '@/lib/format'
import { type TxnStatus } from '@/lib/types'
import { wagmiConfig } from '@/wallet/evm/config'

const useBridgeSubmit = () => {
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

        if (IS_LAYERZERO_BRIDGE_DISABLED) {
          setTxnStatus?.('TXN_FAILURE')
          return
        }

        if (
          !connection.config?.id ||
          !connection.address ||
          !connection.config?.layerzeroOftEid ||
          !destinationConnection?.config?.id ||
          !destinationConnection?.config?.layerzeroOftEid ||
          !isAddressValid(receiverAddress) ||
          !tokenIn ||
          !tokenOut ||
          !amount ||
          (!connection.config?.layerzeroOftHelper && !tokenIn?.layerzeroOftAddress)
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

        setTxnStatus?.('PROCESSING')

        const contractAddress = getAddressOrZeroAddress(
          connection.config?.layerzeroOftHelper || tokenIn?.layerzeroOftAddress,
        )
        const sendParamArgs = [
          toBn(destinationConnection?.config?.layerzeroOftEid),
          fromBytes(addressToBytes32(getLayerZeroReceiverAddress(receiverAddress)), 'hex'),
          strToBn(amount, tokenIn?.decimals),
          strToBn(amount, tokenOut?.decimals),
          getBridgeOptionsForDestination(destinationConnection?.config?.id),
          '0x',
          '0x',
        ]
        const _decimals =
          connection?.config?.defaultGasToken?.decimals || write?.chain?.nativeCurrency?.decimals
        const sendNativeFee = strToBn(nativeFee, _decimals)

        const sendArgs = connection.config?.layerzeroOftHelper
          ? [getAddressOrZeroAddress(tokenIn?.contractAddress), sendParamArgs]
          : [sendParamArgs, [sendNativeFee, '0'], connection.address]

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          connection.config?.layerzeroOftHelper
            ? (LayerzeroOftHelper as Abi)
            : (LayerzeroOft as Abi),
          'send',
          contractAddress,
          sendArgs,
          sendNativeFee,
          gasLimit,
        )

        try {
          const txnHash = await write?.writeContract(txnPayload).then((txn) => txn as string)

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

export default useBridgeSubmit
