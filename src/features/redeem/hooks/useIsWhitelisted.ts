import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import DirectRedeemerAbi from '@/lib/abis/evm/direct-redeemer.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useIsWhitelisted = (connection: EVMConnection) => {
  const isQueryEnabled = useMemo(
    () => isEVMAddressValid(connection?.address) && !!connection?.config?.id,
    [connection?.address, connection?.config?.id],
  )

  const queryKey = useMemo(
    () => queryKeys.redeem.whitelisted(connection?.address, connection?.config?.id),
    [connection?.address, connection?.config?.id],
  )

  const { isLoading, isError, data, isFetching } = useQuery({
    queryKey,
    enabled: isQueryEnabled,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async () => {
      if (!connection.config?.id || !connection.address || !connection.config.directRedeemer) {
        return false
      }

      const read = getPublicClient(wagmiConfig as Config, {
        chainId: connection.config.id as ProtocolChainId,
      })
      if (read?.chain?.id !== connection.config.id) {
        throw new Error('Chains not synced')
      }

      return (await read.readContract({
        address: getAddressOrZeroAddress(connection.config.directRedeemer),
        abi: DirectRedeemerAbi,
        functionName: 'whitelistedUsers',
        args: [getAddressOrZeroAddress(connection.address)],
      })) as boolean
    },
  })

  return useMemo(
    () => ({
      isLoading,
      isError,
      data: data || false,
      isFetching,
    }),
    [data, isError, isFetching, isLoading],
  )
}

export default useIsWhitelisted
