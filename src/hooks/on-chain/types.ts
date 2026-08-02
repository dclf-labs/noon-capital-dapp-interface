export type TokenQueryResult = {
  data: number
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  /** Optional; family hooks may expose react-query's fuller `refetch` signature. */
  refetch?: (...args: never[]) => unknown
}

export type GasFeeQueryResult = {
  data: number
  gasUsed: bigint | number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
}

export const IDLE_TOKEN_QUERY: TokenQueryResult = {
  data: 0,
  isLoading: false,
  isError: false,
  isFetching: false,
}

export const IDLE_GAS_FEE_QUERY: GasFeeQueryResult = {
  data: 0,
  gasUsed: 0n,
  isLoading: false,
  isFetching: false,
  isError: false,
}
