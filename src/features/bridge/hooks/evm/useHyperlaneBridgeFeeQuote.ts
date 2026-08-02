import { useMemo } from 'react'

import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import { type Address, encodeAbiParameters, fromBytes } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import {
  BRIDGE_QUOTE_FEE_MULTIPLIER,
  HYPERLANE_QUOTE_DISPATCH_DEFAULT_METADATA,
  STARKNET_BRIDGE_DESTINATION,
} from '@/constants/common'
import HyperlaneMailbox from '@/lib/abis/evm/hyperlane-mailbox.json'
import { getAddressOrZeroAddress, isAddressValid, toBytes32Recipient } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, strToBn, toBn, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useHyperlaneBridgeFeeQuote = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const isQueryEnabled = useMemo(() => {
    return (
      isAddressValid(tokenIn?.contractAddress) &&
      !!connection.config?.id &&
      !!tokenOut?.contractAddress &&
      !!destinationConnection?.config?.id &&
      !!connection.config?.hyperlaneDomain &&
      !!destinationConnection?.config?.hyperlaneDomain &&
      isAddressValid(connection.config?.hyperlaneMailbox) &&
      !!receiverAddress
    )
  }, [
    connection.config?.hyperlaneDomain,
    connection.config?.hyperlaneMailbox,
    connection.config?.id,
    destinationConnection?.config?.hyperlaneDomain,
    destinationConnection?.config?.id,
    receiverAddress,
    tokenIn?.contractAddress,
    tokenOut?.contractAddress,
  ])

  const queryKey = useMemo(() => {
    return queryKeys.bridge.feeQuote(
      'hyperlane',
      'evm',
      tokenIn?.contractAddress,
      tokenOut?.contractAddress,
      amount,
      connection.config?.id,
      destinationConnection?.config?.id,
      connection.config?.hyperlaneDomain,
      destinationConnection?.config?.hyperlaneDomain,
      connection.config?.hyperlaneMailbox,
      receiverAddress,
    )
  }, [
    tokenIn?.contractAddress,
    tokenOut?.contractAddress,
    amount,
    connection.config?.id,
    connection.config?.hyperlaneDomain,
    connection.config?.hyperlaneMailbox,
    destinationConnection?.config?.id,
    destinationConnection?.config?.hyperlaneDomain,
    receiverAddress,
  ])

  const fetcher = async (
    connection: EVMConnection,
    tokenIn: Token | undefined,
    tokenOut: Token | undefined,
    amount: number | undefined,
    receiverAddress: Address | undefined,
    destinationConnection: EVMConnection | undefined,
  ) => {
    if (!amount || !receiverAddress) {
      return 0
    }

    if (!connection.config?.id || !tokenIn || !tokenOut || !destinationConnection?.config?.id) {
      throw new Error('Chains not synced')
    }

    if (connection.config?.id === destinationConnection?.config?.id) {
      throw new Error('Source and destination chains are same')
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

    const _amountIn = amount
      ? strToBn(amount, tokenIn?.decimals).toString()
      : strToBn(`0.${'0'.repeat(tokenIn?.decimals - 2)}11`, tokenIn?.decimals).toString()

    const message = encodeAbiParameters(
      [
        { name: 'token', type: 'address' },
        {
          name: 'recipient',
          type:
            destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id
              ? 'bytes32'
              : 'address',
        },
        { name: 'amount', type: 'uint256' },
      ],
      [
        getAddressOrZeroAddress(tokenIn?.contractAddress),
        destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id
          ? toBytes32Recipient(receiverAddress)
          : getAddressOrZeroAddress(receiverAddress),
        toBn(_amountIn),
      ],
    )

    const quote = (await read.readContract({
      abi: HyperlaneMailbox,
      functionName: 'quoteDispatch',
      args: [
        toBn(destinationConnection?.config?.hyperlaneDomain),
        destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id
          ? toBytes32Recipient(receiverAddress)
          : fromBytes(addressToBytes32(getAddressOrZeroAddress(receiverAddress)), 'hex'),
        message,
        HYPERLANE_QUOTE_DISPATCH_DEFAULT_METADATA,
      ],
      address: getAddressOrZeroAddress(connection.config?.hyperlaneMailbox),
    })) as bigint

    const _decimals =
      connection?.config?.defaultGasToken?.decimals || read?.chain?.nativeCurrency?.decimals
    return toNum(bnToStr(quote, _decimals)) * BRIDGE_QUOTE_FEE_MULTIPLIER
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
      data: data,
      isFetching: isFetching,
    }
  }, [data, isError, isLoading, isFetching])
}

export default useHyperlaneBridgeFeeQuote
