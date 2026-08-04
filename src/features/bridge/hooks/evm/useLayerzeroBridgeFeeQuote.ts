import { useMemo } from 'react'

import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import { type Address, fromBytes } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { BRIDGE_QUOTE_FEE_MULTIPLIER } from '@/constants/common'
import { getBridgeOptionsForDestination } from '@/features/bridge/lib/bridge'
import { slippageAdjustedAmount } from '@/features/swap/lib/swap'
import LayerzeroOft from '@/lib/abis/evm/layerzero-oft.json'
import { getAddressOrZeroAddress, getLayerZeroReceiverAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, strToBn, toBn, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { type LayerzeroBridgeQuote } from '@/lib/types'
import { wagmiConfig } from '@/wallet/evm/config'

const useLayerzeroBridgeFeeQuote = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const isQueryEnabled = useMemo(() => {
    // `quoteSend` encodes amountLD / minAmountLD / recipient — all required.
    return (
      isAddressValid(tokenIn?.contractAddress) &&
      isAddressValid(tokenOut?.contractAddress) &&
      !!connection.config?.id &&
      !!destinationConnection?.config?.id &&
      !!connection.config?.layerzeroOftEid &&
      !!destinationConnection?.config?.layerzeroOftEid &&
      isAddressValid(receiverAddress) &&
      !!amount &&
      amount > 0
    )
  }, [
    amount,
    connection.config?.id,
    connection.config?.layerzeroOftEid,
    destinationConnection?.config?.id,
    destinationConnection?.config?.layerzeroOftEid,
    receiverAddress,
    tokenIn?.contractAddress,
    tokenOut?.contractAddress,
  ])

  const queryKey = useMemo(() => {
    return queryKeys.bridge.feeQuote(
      'layerzero',
      'evm',
      tokenIn?.contractAddress,
      tokenOut?.contractAddress,
      amount,
      receiverAddress,
      connection.config?.id,
      destinationConnection?.config?.id,
      connection.config?.layerzeroOftEid,
      destinationConnection?.config?.layerzeroOftEid,
    )
  }, [
    tokenIn?.contractAddress,
    tokenOut?.contractAddress,
    amount,
    receiverAddress,
    connection.config?.id,
    connection.config?.layerzeroOftEid,
    destinationConnection?.config?.id,
    destinationConnection?.config?.layerzeroOftEid,
  ])

  const fetcher = async (
    connection: EVMConnection,
    tokenIn: Token | undefined,
    tokenOut: Token | undefined,
    amount: number | undefined,
    receiverAddress: Address | undefined,
    destinationConnection: EVMConnection | undefined,
  ) => {
    const oftAddress = connection.config?.layerzeroOftHelper || tokenIn?.layerzeroOftAddress
    if (!amount || !isAddressValid(oftAddress) || !receiverAddress) {
      return 0
    }

    if (!connection.config?.id || !tokenIn || !tokenOut || !destinationConnection?.config?.id) {
      throw new Error('Chains not synced')
    }

    if (connection.config?.id === destinationConnection?.config?.id) {
      throw new Error('Chains are same')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (
      read?.chain?.id !== connection.config?.id ||
      read?.chain?.id === destinationConnection?.config?.id
    ) {
      throw new Error('Chains not synced')
    }

    // OFT amountLD / minAmountLD are both in **source** local decimals.
    const amountLd = strToBn(amount, tokenIn.decimals)
    const minAmountLd = slippageAdjustedAmount(amountLd, 1)

    const quote = (await read.readContract({
      abi: LayerzeroOft,
      functionName: 'quoteSend',
      args: [
        {
          oftCmd: '0x',
          composeMsg: '0x',
          extraOptions: getBridgeOptionsForDestination(destinationConnection?.config?.id),
          amountLD: amountLd.toString(),
          dstEid: toBn(destinationConnection?.config?.layerzeroOftEid),
          minAmountLD: minAmountLd.toString(),
          to: fromBytes(addressToBytes32(getLayerZeroReceiverAddress(receiverAddress)), 'hex'),
        },
        false,
      ],
      address: getAddressOrZeroAddress(tokenIn?.layerzeroOftAddress || oftAddress),
    })) as LayerzeroBridgeQuote

    const fee = quote?.nativeFee || BigInt(0)
    const _decimals =
      connection?.config?.defaultGasToken?.decimals || read?.chain?.nativeCurrency?.decimals
    return toNum(bnToStr(fee, _decimals)) * BRIDGE_QUOTE_FEE_MULTIPLIER
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () =>
      await fetcher(connection, tokenIn, tokenOut, amount, receiverAddress, destinationConnection),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey: queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isQueryEnabled,
  })

  return useMemo(() => {
    return {
      isLoading,
      isError: isError,
      /** Native gas-token amount; `undefined` until a positive quote is ready. */
      data: data != null && data > 0 ? data : undefined,
      isFetching: isFetching,
    }
  }, [data, isError, isLoading, isFetching])
}

export default useLayerzeroBridgeFeeQuote
