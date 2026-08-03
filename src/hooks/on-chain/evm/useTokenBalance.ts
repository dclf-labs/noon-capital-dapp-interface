import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config as WagmiConfig, getPublicClient } from '@wagmi/core'
import { erc20Abi } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { rawUnitsToNumber } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useTokenBalance = (connection: EVMConnection, token: Token | undefined) => {
  const queryKey = useMemo(
    () =>
      queryKeys.token.balance(
        'evm',
        token?.contractAddress,
        connection.address,
        connection.config?.id,
        token?.isNative,
        token?.isWrapped,
      ),
    [
      token?.contractAddress,
      connection.address,
      connection.config?.id,
      token?.isNative,
      token?.isWrapped,
    ],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      isEVMAddressValid(token?.contractAddress) &&
      isEVMAddressValid(connection.address) &&
      !!connection.config?.id &&
      !connection.unsupported,
    [
      connection.isConnected,
      connection.unsupported,
      token?.contractAddress,
      connection.address,
      connection.config?.id,
    ],
  )

  const fetcher = async (connection: EVMConnection, token: Token | undefined) => {
    if (!connection.config?.id || !connection.address || !token) {
      throw new Error('EVMConnection not found or invalid parameters')
    }

    const read = getPublicClient(wagmiConfig as WagmiConfig, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const balance = token?.isNative
      ? await read.getBalance({
          address: getAddressOrZeroAddress(connection.address),
        })
      : await read.readContract({
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [getAddressOrZeroAddress(connection.address)],
          address: getAddressOrZeroAddress(token?.contractAddress),
        })

    return rawUnitsToNumber(balance, token?.decimals)
  }

  const { isLoading, isError, data, isFetching, refetch, isPlaceholderData } = useQuery({
    queryFn: async () => await fetcher(connection, token),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey: queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isEnabled,
    // Keep the prior balance painted while the new chain/token query resolves.
    placeholderData: (previousData) => previousData,
  })

  return useMemo(
    () => ({
      // With placeholderData, `isLoading` is false during chain switches — avoid CTA flicker.
      isLoading: isEnabled ? isLoading && data === undefined && !isPlaceholderData : false,
      isError: isError,
      // Keep cached balance while briefly disabled (EVM switch mismatch); new query keys
      // start with `data === undefined` so disconnect still paints 0.
      data: data !== undefined ? data || 0 : 0,
      isFetching: isEnabled ? isFetching : false,
      isPlaceholderData: Boolean(isPlaceholderData),
      refetch: refetch,
    }),
    [isLoading, isError, data, isFetching, refetch, isEnabled, isPlaceholderData],
  )
}

export default useTokenBalance
