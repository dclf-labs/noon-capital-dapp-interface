import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type Abi, type Client } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { mainnet } from 'wagmi/chains'

import type { ProtocolChainId } from '@/config/chain-id'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import sNoonRewarder from '@/lib/abis/evm/snoon-rewarder.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { toBn } from '@/lib/format'
import { wagmiConfig } from '@/wallet/evm/config'

const useClaimBuyback = () => {
  const onSubmit = useCallback(
    async (
      EVMConnection: EVMConnection,
      amount: string | undefined,
      proof: string[] | undefined,
      callback?: () => void,
      setTxnStatus?: (status: TxnStatus) => void,
      setTxnUrl?: (url: string) => void,
    ) => {
      try {
        setTxnStatus?.(TxnStatus.IDLE)

        if (
          !EVMConnection.config?.id ||
          !EVMConnection.address ||
          !amount ||
          !proof ||
          !proof?.length ||
          !toBn(amount)
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

        const contractAddress = getAddressOrZeroAddress(EVMConnection?.config?.sNoonRewarder)
        const sendArgs = [[toBn(amount), proof]]

        const txnPayload = getTxnPayload(
          EVMConnection.config,
          write?.chain,
          write?.account,
          sNoonRewarder as Abi,
          'claimReward',
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
          }).catch(() => ({
            status: 'success',
          }))

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
          console.error('Error approving token', error)
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

export default useClaimBuyback
