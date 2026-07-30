import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { DEFAULT_USERNAME } from '@/constants/api'
import { type Address, isEVMAddressValid } from '@/lib/address'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

const useUsername = ({ address }: { address: Address | undefined }) => {
  const fetcher = async () => {
    if (!address) {
      return DEFAULT_USERNAME
    }

    return await fetch(`${appEnv.api.baseUrl}/api/v1/user/${address?.toLowerCase()}/username`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch username.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as { username: string })
      .then((data) => data?.username)
      .catch((err) => {
        console.error('Error fetching username:', err)
        return DEFAULT_USERNAME
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: fetcher,
    queryKey: queryKeys.user.username(address),
    placeholderData: DEFAULT_USERNAME,
    initialData: () => DEFAULT_USERNAME,
    enabled: isEVMAddressValid(address),
    select: (data: string | undefined) => {
      return data || DEFAULT_USERNAME
    },
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

export default useUsername
