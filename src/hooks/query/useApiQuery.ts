import { useMemo } from 'react'

import {
  type QueryFunction,
  type QueryKey,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

/** Default options for Noon backend / HTTP API reads. */
export const API_QUERY_DEFAULTS = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
  retry: 2,
} as const

export type ApiQueryResult<T> = {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  isFetching: boolean
}

type UseApiQueryOptions<TData, TSelected = TData, TQueryKey extends QueryKey = QueryKey> = {
  queryKey: TQueryKey
  queryFn: QueryFunction<TData, TQueryKey>
  enabled?: boolean
  select?: UseQueryOptions<TData, Error, TSelected, TQueryKey>['select']
  refetchInterval?: number | false
}

/**
 * Shared TanStack Query envelope for backend API hooks.
 * Prefer `enabled: isAddressValid(address)` for user-scoped routes.
 */
export function useApiQuery<TData, TSelected = TData, TQueryKey extends QueryKey = QueryKey>({
  queryKey,
  queryFn,
  enabled = true,
  select,
  refetchInterval,
}: UseApiQueryOptions<TData, TSelected, TQueryKey>): ApiQueryResult<TSelected> {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey,
    queryFn,
    enabled,
    select,
    refetchInterval,
    ...API_QUERY_DEFAULTS,
  })

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isFetching, isLoading],
  )
}
