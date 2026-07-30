import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { apiAddressPath, apiFetch } from '@/features/api/lib/api-fetch'
import { API_QUERY_DEFAULTS } from '@/hooks/query/useApiQuery'
import { isAddressValid } from '@/lib/address'
import type { Connection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'

export type LinkedAddressResponse = {
  currentWallet: {
    address: string | undefined
    username: string | null | undefined
    role: string | undefined
  }
  primaryWallet: string | undefined
  linkedWallets: {
    address: string | undefined
    username: string | null
    linkType: string | undefined
    relationship: string | undefined
    linkDirection: string | undefined
  }[]
  totalLinkedWallets: number
  hasLinkedWallets: boolean
}

const useGetLinkedAddress = (connection: Connection) => {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    ...API_QUERY_DEFAULTS,
    enabled: isAddressValid(connection.address),
    queryKey: queryKeys.user.linkedWallet(connection.address),
    queryFn: async () =>
      apiFetch<LinkedAddressResponse>(
        `/api/v1/user/linked-wallets/${apiAddressPath(connection.address)}`,
      ),
    select: (payload) => payload.linkedWallets?.at(0)?.address || undefined,
  })

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isFetching,
      refetch,
    }),
    [data, isLoading, isError, isFetching, refetch],
  )
}

export default useGetLinkedAddress
