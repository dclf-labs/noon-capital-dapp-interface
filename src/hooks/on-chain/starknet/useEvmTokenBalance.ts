import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import { erc20Abi } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useEvmTokenBalance = (connection: EVMConnection, token: Token | undefined) => {
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

  const fetcher = async (connection: EVMConnection, token: Token | undefined) => {
    if (!connection.config?.id || !connection.address || !token) {
      throw new Error('Connection not found or invalid parameters')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const balance = await read.readContract({
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [getAddressOrZeroAddress(connection.address)],
      address: getAddressOrZeroAddress(token?.contractAddress),
    })

    return toNum(bnToStr(balance, token?.decimals))
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => await fetcher(connection, token),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey: queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isEnabled,
  })

  return useMemo(
    () => ({
      isLoading: isEnabled ? isLoading : false,
      isError: isError,
      data: isEnabled ? data || 0 : 0,
      isFetching: isEnabled ? isFetching : false,
    }),
    [isLoading, isError, data, isFetching, isEnabled],
  )
}

export default useEvmTokenBalance
