import type { Address } from '@starknet-react/core'

export type EkuboSwapInfoPoolKey = {
  token0: Address
  token1: Address
  fee: string
  tick_spacing: number
  extension: string
}

export type EkuboSwapInfoRoutePoolKey = {
  token0: Address
  token1: Address
  fee: string
  tick_spacing: number
  extension: string
}

export type EkuboSwapInfoRoute = {
  pool_key: EkuboSwapInfoRoutePoolKey
  sqrt_ratio_limit: string
  skip_ahead: number
}

export type EkuboSwapInfoResponse = {
  total_calculated: string
  price_impact: number
  splits: {
    amount_specified: string
    amount_calculated: string
    route: EkuboSwapInfoRoute[]
  }[]
}
