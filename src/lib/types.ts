import type { Address } from '@/config/address'

export type ApyChartData = {
  label: string
  value: number
}

export type TxnStatus =
  'IDLE' | 'PROCESSING' | 'TXN_SUCCESS' | 'TXN_FAILURE' | 'TXN_SUBMITTED_ON_CHAIN'

export type LayerzeroBridgeQuote = { nativeFee: bigint; lzTokenFee: bigint }

export enum ApiRequestStatus {
  IDLE,
  PROCESSING,
  API_CALL_SUCCESS,
  API_CALL_FAILURE,
}

export type MintingOrder = {
  nonce: number
  expiry: number
  user: Address
  message: string
  usnAmount: bigint
  collateralAmount: bigint
  collateralAddress: Address
}

export type RecentTransactions = {
  amount: string
  action: string
  status: string
  tokenIn: string
  tokenOut: string
  timestamp: string
  amountIn?: string
  amountOut?: string
  transactionHash: string
}

export type Activity = {
  points: string
  minted: string
  redeemed: string
  unstaked: string
  usnHolding: string
  susnHolding: string
  staked: {
    usn: string
    susn: string
  }
  recentTransactions: RecentTransactions[]
}
