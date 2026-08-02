import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import { erc20Abi } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { IDLE_TOKEN_QUERY, type TokenQueryResult } from '@/hooks/on-chain/types'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { rawUnitsToNumber } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

/**
 * EVM ERC-20 balance for a bridge destination / typed receiver.
 * Does not require `connection.isConnected` (read-only sessions).
 */
const useDestinationTokenBalance = (
  connection: EVMConnection,
  token: Token | undefined,
): TokenQueryResult => {
  const queryKey = useMemo(
    () =>
      queryKeys.token.balance(
        'evm',
        token?.contractAddress,
        connection.address,
        connection.config?.id,
      ),
    [token?.contractAddress, connection.address, connection.config?.id],
  )

  const isEnabled = useMemo(
    () =>
      isEVMAddressValid(token?.contractAddress) &&
      isEVMAddressValid(connection.address) &&
      !!connection.config?.id,
    [token?.contractAddress, connection.address, connection.config?.id],
  )

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => {
      if (!connection.config?.id || !connection.address || !token) {
        throw new Error('Connection not found or invalid parameters')
      }

      const read = getPublicClient(wagmiConfig as Config, {
        chainId: connection.config.id as ProtocolChainId,
      })
      if (read?.chain?.id !== connection.config.id) {
        throw new Error('Chains not synced')
      }

      const balance = await read.readContract({
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [getAddressOrZeroAddress(connection.address)],
        address: getAddressOrZeroAddress(token.contractAddress),
      })

      return rawUnitsToNumber(balance, token.decimals)
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isEnabled,
  })

  return useMemo(
    () =>
      isEnabled
        ? {
            data: data || 0,
            isLoading,
            isError,
            isFetching,
          }
        : IDLE_TOKEN_QUERY,
    [data, isEnabled, isError, isFetching, isLoading],
  )
}

export default useDestinationTokenBalance
