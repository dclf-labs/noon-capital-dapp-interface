import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type Abi, type Client } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import StakingVault from '@/lib/abis/evm/staking-vault.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { strToBn } from '@/lib/format'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

const useStakeSubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      tokenIn: Token | undefined,
      tokenOut: Token | undefined,
      amountIn: number | undefined,
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
          !connection.config?.stakingVault
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

        setTxnStatus?.(TxnStatus.PROCESSING)

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          StakingVault as Abi,
          'deposit',
          getAddressOrZeroAddress(connection.config?.stakingVault),
          [strToBn(amountIn, tokenIn.decimals), getAddressOrZeroAddress(connection.address)],
        )

        try {
          const _write = write
          const txnHash = await _write?.writeContract(txnPayload).then((txn) => txn as string)

          setTxnStatus?.(TxnStatus.TXN_SUBMITTED_ON_CHAIN)

          const receipt = await waitForTransactionReceipt(write as Client, {
            hash: txnHash as `0x${string}`,
            confirmations: 1,
            timeout: connection.config?.txnWaitTimeout || TXN_WAIT_TIMEOUT,
          }).catch(() => ({
            status: 'success',
          }))

          if (receipt.status === 'success') {
            setTxnStatus?.(TxnStatus.TXN_SUCCESS)
            setTxnUrl?.(
              `${connection.config?.explorerUrl || write?.chain?.blockExplorers?.default?.url}/tx/${txnHash}`,
            )
            callback?.()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataLayer = (window as any)?.dataLayer || undefined
            if (dataLayer) {
              dataLayer.push({
                event: 'dApp staked',
                transaction_hash: txnHash,
                transaction_amount: amountIn || 0,
                payment_type: 'stake',
                token_contract_address: tokenIn?.contractAddress,
                network_chain_id: 1,
              })
            }
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
        console.error('Error submitting stake', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useStakeSubmit
