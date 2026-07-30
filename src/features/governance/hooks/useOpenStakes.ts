import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config as WagmiConfig, getPublicClient } from '@wagmi/core'
import type { Abi } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import sNoon from '@/lib/abis/evm/snoon.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useOpenStakes = (connection: EVMConnection) => {
  const queryKey = useMemo(
    () =>
      queryKeys.governance.openStakes(
        connection.address,
        connection.config?.id,
        connection.config?.sNoon,
      ),
    [connection.address, connection.config?.id, connection.config?.sNoon],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      !connection.unsupported &&
      isEVMAddressValid(connection.config?.sNoon) &&
      isEVMAddressValid(connection.address) &&
      !!connection.config?.id,
    [
      connection.isConnected,
      connection.unsupported,
      connection.config?.sNoon,
      connection.config?.id,
      connection.address,
    ],
  )

  const fetcher = async (connection: EVMConnection) => {
    if (!connection.config?.id || !connection.address || !connection.config?.sNoon) {
      throw new Error('EVMConnection not found or invalid parameters')
    }

    const read = getPublicClient(wagmiConfig as WagmiConfig, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const stakeIds = (await read.readContract({
      abi: sNoon as Abi,
      functionName: 'getUserStakeIds',
      args: [getAddressOrZeroAddress(connection.address)],
      address: getAddressOrZeroAddress(connection.config?.sNoon),
    })) as bigint[]

    const stakes = await Promise.all(
      stakeIds.map(async (stakeId) => {
        const stake = (await read.readContract({
          abi: sNoon as Abi,
          functionName: 'stakes',
          args: [stakeId],
          address: getAddressOrZeroAddress(connection.config?.sNoon),
        })) as Array<unknown>

        return {
          isVip: stake?.at(3),
          amount: stake?.at(0),
          end: stake?.at(1),
          multiplier: stake?.at(2),
          stakeDate: stake?.at(4),
          isPermanent: stake?.at(5),
          tokenId: toNum(stakeId),
        } as {
          isVip: boolean
          amount: bigint
          end: bigint
          multiplier: bigint
          stakeDate: bigint
          isPermanent: boolean
          tokenId: number
        }
      }),
    )

    return stakes?.filter((stake: { isVip: boolean }) => stake.isVip === false) || []
  }

  const { isLoading, isError, data, isFetching, refetch } = useQuery({
    queryFn: async () => await fetcher(connection),
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
      data: isEnabled ? data || [] : [],
      isFetching: isEnabled ? isFetching : false,
      refetch: refetch,
    }),
    [isLoading, isError, data, isFetching, refetch, isEnabled],
  )
}

export default useOpenStakes
