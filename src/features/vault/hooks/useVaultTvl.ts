import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'

import { getToken } from '@/config'
import type { ProtocolChainId } from '@/config/chain-id'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import LagoonVaultAbi from '@/lib/abis/evm/lagoon-vault.json'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useVaultTvl = (
  connection: EVMConnection,
  vault: Address,
  asset: string,
  isStablecoinAsset: boolean = false,
  assetPrice: ReturnType<typeof useTokenPrice> | undefined,
) => {
  const isQueryEnabled = useMemo(() => {
    return isAddressValid(vault) && !!connection.config?.id
  }, [connection.config?.id, vault])

  const queryKey = useMemo(() => {
    return queryKeys.vault.tvl(vault, connection.config?.id, connection.config?.vaults)
  }, [vault, connection.config?.id, connection.config?.vaults])

  const fetcher = async (
    connection: EVMConnection,
    vault: Address,
    asset: string,
    isStablecoinAsset: boolean = false,
  ) => {
    if (!vault || !asset) {
      return {
        tvl: 0,
        tvlUsd: 0,
      }
    }

    if (!connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const token = getToken(connection.config, asset)
    if (!token) {
      return {
        tvl: 0,
        tvlUsd: 0,
      }
    }

    const tokenTvl = (await read.readContract({
      abi: LagoonVaultAbi,
      functionName: 'totalAssets',
      args: [],
      address: getAddressOrZeroAddress(vault),
    })) as bigint

    if (isStablecoinAsset) {
      return {
        tvl: toNum(bnToStr(tokenTvl, token?.decimals)),
        tvlUsd: toNum(bnToStr(tokenTvl, token?.decimals)) * 1,
      }
    }

    return {
      tvl: toNum(bnToStr(tokenTvl, token?.decimals)),
      tvlUsd: assetPrice?.data
        ? toNum(bnToStr(tokenTvl, token?.decimals)) * (assetPrice?.data || 0)
        : 0,
    }
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => await fetcher(connection, vault, asset, isStablecoinAsset),
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
      data: data || { tvl: 0, tvlUsd: 0 },
      isFetching: isFetching,
    }
  }, [data, isError, isLoading, isFetching])
}

export default useVaultTvl
