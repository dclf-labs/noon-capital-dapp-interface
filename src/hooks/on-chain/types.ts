export type TokenQueryResult = {
  data: number
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  /** Optional; family hooks may expose react-query's fuller `refetch` signature. */
  refetch?: (...args: never[]) => unknown
}

/**
 * Shared gas-fee query shape for EVM / Starknet `useGasFee` and bridge submit stubs.
 * - `data` — USD notional
 * - `native` — native gas-token amount
 * - `isReady` — positive native estimate and a usable USD price
 */
export type GasFeeQueryResult = {
  data: number
  native: number
  gasUsed: bigint | number
  isReady: boolean
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
  native: 0,
  gasUsed: 0n,
  isReady: false,
  isLoading: false,
  isFetching: false,
  isError: false,
}
