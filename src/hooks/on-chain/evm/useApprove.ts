import { type Dispatch, type SetStateAction, useCallback, useMemo } from 'react'

import { type Config as WagmiConfig, getWalletClient } from '@wagmi/core'
import { type Client, erc20Abi, maxUint256 } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import type useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EvmAddress, getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import type { TxnStatus } from '@/lib/types'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

const useApprove = () => {
  const onApprove = useCallback(
    async (
      connection: EVMConnection,
      spender: EvmAddress | undefined,
      token: Token | undefined,
      _?: bigint,
      refetchAllowance?: ReturnType<typeof useTokenAllowance>['refetch'] | (() => Promise<void>),
      setTxnStatus?: Dispatch<SetStateAction<TxnStatus>> | undefined,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.('IDLE')

        if (
          !canWriteSession(connection) ||
          !connection.config?.id ||
          !connection.address ||
          !spender ||
          !token ||
          token?.isNative
        ) {
          setTxnStatus?.('TXN_FAILURE')
          return
        }

        const write = await getWalletClient(wagmiConfig as WagmiConfig, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })
        if (write?.chain?.id !== connection.config?.id) {
          setTxnStatus?.('TXN_FAILURE')
          return
        }

        setTxnStatus?.('PROCESSING')

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          erc20Abi,
          'approve',
          getAddressOrZeroAddress(token?.contractAddress),
          [getAddressOrZeroAddress(spender), maxUint256],
          undefined,
          undefined,
        )

        try {
          const txnHash = await write?.writeContract(txnPayload).then((txn) => txn as string)
          setTxnStatus?.('TXN_SUBMITTED_ON_CHAIN')
          const receipt = await waitForTransactionReceipt(write as Client, {
            hash: txnHash as EvmAddress,
            confirmations: 1,
            timeout: connection.config?.txnWaitTimeout || TXN_WAIT_TIMEOUT,
          }).catch((error) => {
            console.error('Timed out or failed waiting for transaction receipt', error)
            throw error
          })

          if (receipt.status === 'success') {
            await refetchAllowance?.()
            setTxnStatus?.('TXN_SUCCESS')
            setTxnUrl?.(
              `${connection.config?.explorerUrl || write?.chain?.blockExplorers?.default?.url}/tx/${txnHash}`,
            )
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
        console.error('Error approving token', error)
        setTxnStatus?.('TXN_FAILURE')
      }
    },
    [],
  )

  return useMemo(() => onApprove, [onApprove])
}

export default useApprove
