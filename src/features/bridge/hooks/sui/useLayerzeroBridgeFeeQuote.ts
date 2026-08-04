import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import { BRIDGE_QUOTE_FEE_MULTIPLIER } from '@/constants/common'
import {
  buildSuiOftSendParam,
  createSuiOft,
  isSuiOftSourceConfigured,
} from '@/features/bridge/lib/sui-oft'
import { isEVMAddressValid } from '@/lib/address'
import { type EVMConnection, type SuiConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { useSuiClient } from '@/wallet/sui/legacy-hooks'

const useLayerzeroBridgeFeeQuote = (
  connection: SuiConnection,
  tokenIn: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const client = useSuiClient()

  const isEnabled = useMemo(
    () =>
      !!connection?.isConnected &&
      !!connection?.address &&
      !!tokenIn &&
      !!amount &&
      isEVMAddressValid(receiverAddress) &&
      !!destinationConnection?.config?.layerzeroOftEid &&
      isSuiOftSourceConfigured(tokenIn),
    [
      connection?.isConnected,
      connection?.address,
      tokenIn,
      amount,
      receiverAddress,
      destinationConnection?.config?.layerzeroOftEid,
    ],
  )

  const queryKey = useMemo(
    () =>
      queryKeys.bridge.feeQuote(
        'layerzero',
        'sui',
        connection?.address,
        tokenIn?.layerzeroOftObjectId,
        amount,
        receiverAddress,
        destinationConnection?.config?.layerzeroOftEid,
      ),
    [
      connection?.address,
      tokenIn?.layerzeroOftObjectId,
      amount,
      receiverAddress,
      destinationConnection?.config?.layerzeroOftEid,
    ],
  )

  const { isLoading, isError, isFetching, data } = useQuery({
    queryKey,
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (
        !connection?.address ||
        !tokenIn ||
        !amount ||
        !receiverAddress ||
        !destinationConnection?.config?.layerzeroOftEid
      ) {
        throw new Error('Missing Sui OFT quote parameters')
      }

      const oft = createSuiOft(client, tokenIn)
      if (!oft) throw new Error('Failed to create Sui OFT client')

      const sendParam = buildSuiOftSendParam(
        destinationConnection.config.layerzeroOftEid,
        receiverAddress,
        amount,
        tokenIn.decimals,
      )

      const fee = await oft.quoteSend(connection.address, sendParam, false)
      const decimals = connection.config?.defaultGasToken?.decimals ?? 9
      return toNum(bnToStr(fee.nativeFee, decimals)) * BRIDGE_QUOTE_FEE_MULTIPLIER
    },
  })

  return useMemo(
    () => ({
      isLoading,
      isError,
      isFetching,
      /** Native SUI amount; `undefined` until the quote is ready (not `0`). */
      data: data != null && data > 0 ? data : undefined,
    }),
    [isLoading, isError, isFetching, data],
  )
}

export default useLayerzeroBridgeFeeQuote
