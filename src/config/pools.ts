import type { Address } from '@/config/address'

export type UniV3Pool = {
  path: string[]
  feePath: bigint[]
  name: string
  pool: Address
}

export type UniV4PoolKey = {
  currency0: string
  currency1: string
  fee: bigint
  tickSpacing: bigint
  hooks: Address
}

export type UniV4Pool = {
  poolKeyPath: UniV4PoolKey[]
}

export type CurvePool = {
  route: string[]
  swapParams: Array<Array<number>>
}
