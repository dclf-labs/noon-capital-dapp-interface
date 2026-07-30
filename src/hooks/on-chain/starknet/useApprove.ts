import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type Address, type Client, erc20Abi, maxUint256 } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type StarknetConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { wagmiConfig } from '@/wallet/evm/config'

const useApprove = () => {
  const onApprove = useCallback(
    async (
      connection: StarknetConnection,
      spender: Address | undefined,
      token: Token | undefined,
      gasLimit?: bigint,
      refetchAllowance?: undefined | (() => Promise<void>),
      setTxnStatus?: (status: TxnStatus) => void,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.(TxnStatus.IDLE)

        if (!connection.config?.id || !connection.address || !spender || !token) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })
        if (write?.chain?.id !== connection.config?.id) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        setTxnStatus?.(TxnStatus.PROCESSING)

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          erc20Abi,
          'approve',
          getAddressOrZeroAddress(token?.contractAddress),
          [getAddressOrZeroAddress(spender), maxUint256],
          undefined,
          gasLimit,
        )

        try {
          const _write = write
          const txnHash = await _write?.writeContract(txnPayload).then((txn) => txn as string)

          setTxnStatus?.(TxnStatus.TXN_SUBMITTED_ON_CHAIN)

          const receipt = await waitForTransactionReceipt(write as Client, {
            hash: txnHash as Address,
            confirmations: 1,
            timeout: connection.config?.txnWaitTimeout || TXN_WAIT_TIMEOUT,
          }).catch(() => ({
            status: 'success',
          }))

          if (receipt.status === 'success') {
            await refetchAllowance?.()
            setTxnStatus?.(TxnStatus.TXN_SUCCESS)
            setTxnUrl?.(
              `${connection.config?.explorerUrl || write?.chain?.blockExplorers?.default?.url}/tx/${txnHash}`,
            )
          } else if (receipt.status === 'reverted') {
            setTxnStatus?.(TxnStatus.TXN_FAILURE)
          } else {
            setTxnStatus?.(TxnStatus.IDLE)
          }
        } catch (error) {
          console.error('Error approving token', error)
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
        }
      } catch (error) {
        console.error('Error approving token', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onApprove, [onApprove])
}

export default useApprove
