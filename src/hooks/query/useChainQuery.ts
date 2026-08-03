import { useMemo } from 'react'

import {
  type QueryFunction,
  type QueryKey,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

/** Default options for on-chain / quote reads that should stay fresh while a screen is open. */
export const CHAIN_QUERY_DEFAULTS = {
  refetchOnMount: true,
  refetchOnReconnect: true,
  refetchOnWindowFocus: true,
  refetchIntervalInBackground: false,
} as const

export type ChainQueryResult<T> = {
  data: T
  isLoading: boolean
  isError: boolean
  isFetching: boolean
}

type UseChainQueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = {
  queryKey: TQueryKey
  queryFn: QueryFunction<TData, TQueryKey>
  enabled?: boolean
  refetchInterval?: number | false
  /** Returned when query data is still undefined. */
  fallback: TData
  select?: UseQueryOptions<TData, Error, TData, TQueryKey>['select']
}

/**
 * Shared TanStack Query envelope for chain reads (previews, fees, vaults).
 * Domain hooks supply `queryKey` / `queryFn` / `enabled` only.
 */
export function useChainQuery<TData, TQueryKey extends QueryKey = QueryKey>({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval,
  fallback,
  select,
}: UseChainQueryOptions<TData, TQueryKey>): ChainQueryResult<TData> {
  const { data, isLoading, isError, isFetching, isPlaceholderData } = useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchInterval,
    select,
    // Smooth chain / amount switches — keep the last good value painted while refetching.
    placeholderData: (previousData) => previousData,
    ...CHAIN_QUERY_DEFAULTS,
  })

  return useMemo(
    () => ({
      data: (data === undefined ? fallback : data) as TData,
      isLoading: isLoading && data === undefined && !isPlaceholderData,
      isError,
      isFetching,
    }),
    [data, fallback, isError, isFetching, isLoading, isPlaceholderData],
  )
}
