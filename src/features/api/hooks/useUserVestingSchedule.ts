import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { gql, GraphQLClient } from 'graphql-request'

import { REFETCH_API_INTERVAL } from '@/constants/api'
import { isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { toBn } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const fetchUsingSubgraph = async (client: GraphQLClient, queryDocument: string) => {
  return await client
    .request(queryDocument)
    .then(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        return data?.user?.vestingSchedules || []
      },
      () => {
        throw Error('Failed to fetch vesting schedule')
      },
    )
    .then(
      (balance) => {
        return balance
      },
      () => {
        throw Error('Failed to fetch vesting schedule')
      },
    )
    .catch(() => {
      return []
    })
}

const useUserVestingSchedule = (connection: EVMConnection) => {
  const fetcher = async () => {
    if (!connection.isConnected || !isEVMAddressValid(connection?.address)) {
      return []
    }

    const _ethereumQueryDocument = gql`
      {
        user(id: "${connection?.address?.toLowerCase()}") {
          vestingSchedules {
            id
            endTime
            claimedAmount
            scheduleId
            startTime
            totalAmount
            stake {
              id
            }
          }
        }
      }
    `
    const _ethereumQueryClient = new GraphQLClient(
      'https://api.goldsky.com/api/public/project_clzv4gspiml6w01x42t2kfmdf/subgraphs/governance-mainnet/1.0.0/gn',
    )

    return await fetchUsingSubgraph(_ethereumQueryClient, _ethereumQueryDocument)
      .then((data) => data)
      .catch(() => [])
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: fetcher,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    initialData: () => {
      return []
    },
    select: (data) => {
      return (
        data?.filter(
          (vest: { claimedAmount: string | number | bigint | undefined; hasClaimed: boolean }) =>
            toBn(vest?.claimedAmount) <= toBn(0) && !vest?.hasClaimed,
        ) || []
      )
    },
    refetchIntervalInBackground: true,
    refetchInterval: REFETCH_API_INTERVAL,
    queryKey: queryKeys.user.vestingSchedule(connection?.address),
    enabled: !!connection.isConnected && !!isEVMAddressValid(connection?.address),
  })

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useUserVestingSchedule
