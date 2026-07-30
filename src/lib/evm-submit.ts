import type { Config } from '@wagmi/core'
import { getWalletClient } from '@wagmi/core'
import type { Account, Chain, Client, WriteContractParameters } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

import type { ProtocolChainId } from '@/config/chain-id'
import { TXN_WAIT_TIMEOUT } from '@/constants/common'
import { type EVMConnection, TxnStatus } from '@/lib/connection'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

export type EvmSubmitCallbacks = {
  setTxnStatus?: (status: TxnStatus) => void
  setTxnUrl?: (url: string) => void
  onSuccess?: () => void
}

/**
 * Shared EVM write + receipt wait with standardized txn status transitions.
 * Does not treat receipt timeouts as success — surfaces failure instead.
 */
export async function submitEvmWrite(params: {
  connection: EVMConnection
  /** Optional hard requirement that wallet chain matches this id (e.g. mainnet). */
  requiredChainId?: ProtocolChainId
  buildWriteArgs: (write: {
    chain: Chain
    account: Account
  }) => WriteContractParameters | Promise<WriteContractParameters>
  callbacks?: EvmSubmitCallbacks
}): Promise<void> {
  const { connection, requiredChainId, buildWriteArgs, callbacks } = params
  const { setTxnStatus, setTxnUrl, onSuccess } = callbacks ?? {}

  setTxnStatus?.(TxnStatus.IDLE)

  if (!canWriteSession(connection) || !connection.config?.id || !connection.address) {
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }

  const write = await getWalletClient(wagmiConfig as Config, {
    chainId: connection.config.id as ProtocolChainId,
    account: connection.address,
  })

  if (!write?.chain || !write.account) {
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }

  if (write.chain.id !== connection.config.id) {
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }

  if (requiredChainId !== undefined && write.chain.id !== requiredChainId) {
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
    return
  }

  setTxnStatus?.(TxnStatus.PROCESSING)

  try {
    const txnPayload = await buildWriteArgs({
      chain: write.chain,
      account: write.account,
    })

    const txnHash = (await write.writeContract(txnPayload)) as `0x${string}`
    setTxnStatus?.(TxnStatus.TXN_SUBMITTED_ON_CHAIN)

    let receiptStatus: 'success' | 'reverted' | 'unknown' = 'unknown'
    try {
      const receipt = await waitForTransactionReceipt(write as Client, {
        hash: txnHash,
        confirmations: 1,
        timeout: connection.config.txnWaitTimeout || TXN_WAIT_TIMEOUT,
      })
      receiptStatus = receipt.status === 'success' ? 'success' : 'reverted'
    } catch (error) {
      console.error('Timed out or failed waiting for transaction receipt', error)
      setTxnStatus?.(TxnStatus.TXN_FAILURE)
      return
    }

    if (receiptStatus === 'success') {
      setTxnStatus?.(TxnStatus.TXN_SUCCESS)
      setTxnUrl?.(
        `${connection.config.explorerUrl || write.chain.blockExplorers?.default?.url}/tx/${txnHash}`,
      )
      onSuccess?.()
      return
    }

    setTxnStatus?.(TxnStatus.TXN_FAILURE)
  } catch (error) {
    console.error('Error submitting EVM transaction', error)
    setTxnStatus?.(TxnStatus.TXN_FAILURE)
  }
}
