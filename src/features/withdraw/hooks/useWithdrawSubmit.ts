import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type Abi, type Client } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import WithdrawHandler from '@/lib/abis/evm/withdraw-handler.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { wagmiConfig } from '@/wallet/evm/config'

const useWithdrawSubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      requestId: number,
      callback?: () => void,
      setTxnStatus?: (status: TxnStatus) => void,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.(TxnStatus.IDLE)

        if (
          !connection.config?.id ||
          !connection.address ||
          !connection.config?.stakeWithdrawHandler
        ) {
          throw new Error('Invalid parameters')
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })

        if (
          write?.chain?.id !== connection.config?.id ||
          write.account?.address !== connection.address
        ) {
          throw new Error('Invalid connection')
        }

        setTxnStatus?.(TxnStatus.PROCESSING)

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          WithdrawHandler as Abi,
          'claimWithdrawal',
          getAddressOrZeroAddress(connection.config?.stakeWithdrawHandler),
          [requestId],
        )

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
          console.error('Error submitting withdraw request', error)
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
        }
      } catch (error) {
        console.error('Error submitting withdraw request', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useWithdrawSubmit
