import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { REFETCH_INTERVAL_COLLATERAL_PRICE } from '@/constants/api'
import { isStarknetAddressValid } from '@/lib/address'
import type { StarknetConnection } from '@/lib/connection'
import { down } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const useVesuVaultUserPosition = (connection: StarknetConnection) => {
  const fetcher = async () => {
    return await fetch(`https://staging.vaults-api.vesu.xyz/user/${connection?.address}/positions`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch vesu vault tvl.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((vaults) =>
        vaults
          ?.filter(
            (v: { vault: string }) =>
              v?.vault?.toLowerCase() ===
                '0x04424dec8280f518b35be33139f44ef9fa0855b117f16cda2a30f1b64c27864a'.toLowerCase() ||
              v?.vault?.toLowerCase() ===
                '0x4424dec8280f518b35be33139f44ef9fa0855b117f16cda2a30f1b64c27864a'.toLowerCase(),
          )
          ?.at(0),
      )
      .then((data) => {
        return {
          shares: down(data?.shares, 6),
          assets: down(data?.assets, 6),
        }
      })
      .catch((err) => {
        console.error('Error fetching vesu vault user position:', err)
        return {
          shares: down(0, 6),
          assets: down(0, 6),
        }
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: async () => await fetcher(),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: REFETCH_INTERVAL_COLLATERAL_PRICE,
    queryKey: queryKeys.vesu.userPosition(connection?.address, connection?.config?.id?.toString()),
    enabled: connection?.isConnected && isStarknetAddressValid(connection?.address),
    select: (data) => {
      return {
        shares: down(data?.shares || 0, 6),
        assets: down(data?.assets || 0, 6),
      }
    },
  })

  return useMemo(
    () => ({
      data: data || {
        shares: down(0, 6),
        assets: down(0, 6),
      },
      isError,
      isLoading,
      isFetching: isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useVesuVaultUserPosition
