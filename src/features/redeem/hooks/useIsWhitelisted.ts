import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import MintHandlerAbi from '@/lib/abis/evm/mint-handler.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useIsWhitelisted = (connection: EVMConnection) => {
  const isQueryEnabled = useMemo(() => {
    return isEVMAddressValid(connection?.address) && !!connection?.config?.id
  }, [connection?.address, connection?.config?.id])

  const queryKey = useMemo(() => {
    return queryKeys.redeem.whitelisted(connection?.address, connection?.config?.id)
  }, [connection?.address, connection?.config?.id])

  const fetcher = async (connection: EVMConnection) => {
    if (!connection.config?.id || !connection?.address) {
      return false
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const isWhitelisted = (await read.readContract({
      address: getAddressOrZeroAddress(connection.config?.mintHandler),
      abi: MintHandlerAbi,
      functionName: 'whitelistedUsers',
      args: [getAddressOrZeroAddress(connection.address)],
    })) as boolean

    return isWhitelisted
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => await fetcher(connection),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    queryKey: queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isQueryEnabled,
  })

  return useMemo(() => {
    return {
      isLoading,
      isError: isError,
      data: data || false,
      isFetching: isFetching,
    }
  }, [data, isError, isLoading, isFetching])
}

export default useIsWhitelisted
