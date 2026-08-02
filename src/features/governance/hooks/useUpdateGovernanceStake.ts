import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type Abi, type Client } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { mainnet } from 'wagmi/chains'

import type { ProtocolChainId } from '@/config/chain-id'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import sNoon from '@/lib/abis/evm/snoon.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { toBn } from '@/lib/format'
import { wagmiConfig } from '@/wallet/evm/config'

const useUpdateGovernanceStake = () => {
  const onSubmit = useCallback(
    async (
      EVMConnection: EVMConnection,
      tokenId: number | bigint | undefined | string,
      amount: string | undefined,
      duration: number | undefined,
      callback?: () => void,
      setTxnStatus?: (status: TxnStatus) => void,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.(TxnStatus.IDLE)

        if (
          !EVMConnection.config?.id ||
          !EVMConnection.address ||
          !tokenId ||
          !toBn(tokenId) ||
          (!toBn(amount) && !toBn(duration))
        ) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: EVMConnection.config?.id as ProtocolChainId,
          account: EVMConnection.address,
        })
        if (write?.chain?.id !== EVMConnection.config?.id || write?.chain?.id !== mainnet?.id) {
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
          return
        }

        setTxnStatus?.(TxnStatus.PROCESSING)

        const contractAddress = getAddressOrZeroAddress(EVMConnection?.config?.sNoon)
        const sendArgs = [toBn(tokenId), toBn(amount), toBn(duration), 0, []]

        const txnPayload = getTxnPayload(
          EVMConnection.config,
          write?.chain,
          write?.account,
          sNoon as Abi,
          'updateStake',
          contractAddress,
          sendArgs,
          undefined,
          undefined,
        )

        try {
          const _write = write
          const txnHash = await _write?.writeContract(txnPayload).then((txn) => txn as string)

          setTxnStatus?.(TxnStatus.TXN_SUBMITTED_ON_CHAIN)

          const receipt = await waitForTransactionReceipt(write as Client, {
            hash: txnHash as `0x${string}`,
            confirmations: 1,
            timeout: EVMConnection.config?.txnWaitTimeout || TXN_WAIT_TIMEOUT,
          }).catch((error) => {
            console.error('Timed out or failed waiting for transaction receipt', error)
            throw error
          })

          if (receipt.status === 'success') {
            setTxnStatus?.(TxnStatus.TXN_SUCCESS)
            setTxnUrl?.(
              `${EVMConnection.config?.explorerUrl || write?.chain?.blockExplorers?.default?.url}/tx/${txnHash}`,
            )
            callback?.()
          } else if (receipt.status === 'reverted') {
            setTxnStatus?.(TxnStatus.TXN_FAILURE)
          } else {
            setTxnStatus?.(TxnStatus.IDLE)
          }
        } catch (error) {
          console.error('Error submitting governance txn', error)
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
        }
      } catch (error) {
        console.error('Error submitting bridge transaction', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useUpdateGovernanceStake
