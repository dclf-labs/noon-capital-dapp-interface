import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type Abi, type Client } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import { getDirectMintCallArgs } from '@/features/mint-redeem/submit-args'
import DirectMinter from '@/lib/abis/evm/direct-minter.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { getTxnPayload } from '@/lib/evmTxn'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

const useMintSubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      tokenIn: Token | undefined,
      tokenOut: Token | undefined,
      amountIn: number | undefined,
      minAmountOut: number | undefined,
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
          !minAmountOut ||
          !connection.config?.directMinter
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

        const args = getDirectMintCallArgs(tokenIn, tokenOut, amountIn, minAmountOut)
        if (!args) {
          throw new Error('Invalid parameters')
        }

        setTxnStatus?.(TxnStatus.PROCESSING)

        const txnPayload = getTxnPayload(
          connection.config,
          write?.chain,
          write?.account,
          DirectMinter as Abi,
          'directMint',
          getAddressOrZeroAddress(connection.config?.directMinter),
          [...args],
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
          console.error('Error submitting mint', error)
          setTxnStatus?.(TxnStatus.TXN_FAILURE)
        }
      } catch (error) {
        console.error('Error submitting mint', error)
        setTxnStatus?.(TxnStatus.TXN_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useMintSubmit
