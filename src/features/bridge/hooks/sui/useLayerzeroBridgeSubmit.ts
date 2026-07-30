import { useCallback, useMemo, useState } from 'react'

import { Transaction } from '@mysten/sui/transactions'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { IS_SUI_TO_ETH_BRIDGE_DISABLED } from '@/constants/common'
import {
  buildSuiOftSendParam,
  createSuiOft,
  isSuiOftSourceConfigured,
} from '@/features/bridge/lib/sui-oft'
import { isEVMAddressValid } from '@/lib/address'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'
import { strToBn } from '@/lib/format'
import { useSignAndExecuteTransaction, useSuiClient } from '@/wallet/sui/legacy-hooks'

const useLayerzeroBridgeSubmit = (
  connection: SuiConnection | undefined,
  tokenIn: Token | undefined,
  _tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const client = useSuiClient()
  const {
    mutateAsync: signAndExecute,
    isPending,
    isError,
    isSuccess,
  } = useSignAndExecuteTransaction()
  const [txnHash, setTxnHash] = useState<string | undefined>(undefined)

  const canSubmit = useMemo(
    () =>
      !IS_SUI_TO_ETH_BRIDGE_DISABLED &&
      !!connection?.isConnected &&
      !!connection?.address &&
      !!tokenIn &&
      !!amount &&
      !!nativeFee &&
      isEVMAddressValid(receiverAddress) &&
      !!destinationConnection?.config?.layerzeroOftEid &&
      isSuiOftSourceConfigured(tokenIn),
    [
      connection?.isConnected,
      connection?.address,
      tokenIn,
      amount,
      nativeFee,
      receiverAddress,
      destinationConnection?.config?.layerzeroOftEid,
    ],
  )

  const onSubmit = useCallback(async () => {
    if (IS_SUI_TO_ETH_BRIDGE_DISABLED) {
      return
    }

    if (
      !canSubmit ||
      !connection?.address ||
      !tokenIn ||
      !amount ||
      !receiverAddress ||
      !destinationConnection?.config?.layerzeroOftEid ||
      nativeFee === undefined
    ) {
      return
    }

    const oft = createSuiOft(client, tokenIn)
    if (!oft) return

    const sendParam = buildSuiOftSendParam(
      destinationConnection.config.layerzeroOftEid,
      receiverAddress,
      amount,
      tokenIn.decimals,
    )

    const decimals = connection.config?.defaultGasToken?.decimals ?? 9
    const nativeFeeMist = strToBn(nativeFee, decimals)

    const tx = new Transaction()
    // LayerZero SDK depends on a nested @mysten/sui Transaction type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txAny = tx as any
    const coin = await oft.splitCoinMoveCall(txAny, connection.address, sendParam.amountLd)
    // sendMoveCall consumes `coin` by value — do not transferObjects it afterward
    await oft.sendMoveCall(
      txAny,
      connection.address,
      sendParam,
      coin,
      nativeFeeMist,
      0n,
      connection.address,
    )

    const result = await signAndExecute({ transaction: tx })
    setTxnHash(result?.digest)
  }, [
    canSubmit,
    client,
    connection?.address,
    connection?.config?.defaultGasToken?.decimals,
    tokenIn,
    amount,
    receiverAddress,
    destinationConnection?.config?.layerzeroOftEid,
    nativeFee,
    signAndExecute,
  ])

  return useMemo(
    () => ({
      mutationStatus: {
        isPending,
        isError,
        isSuccess,
      },
      onSubmit,
      txnHash,
    }),
    [isPending, isError, isSuccess, onSubmit, txnHash],
  )
}

export default useLayerzeroBridgeSubmit
