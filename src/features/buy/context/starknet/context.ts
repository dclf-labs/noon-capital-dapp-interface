import { createContext } from 'react'

import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/buy/context/starknet/types'
import type useBuyAllowance from '@/features/buy/hooks/starknet/useBuyAllowance'
import type useBuySubmitFee from '@/features/buy/hooks/starknet/useBuySubmitFee'
import type usePreviewBuy from '@/features/buy/hooks/starknet/usePreviewBuy'
import type useTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'
import { type StarknetConnection } from '@/lib/connection'

export const BuyFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: (step: number) => void
  connection: StarknetConnection
}>(null!)

export const BuyBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  tokenInAllowance: ReturnType<typeof useBuyAllowance>
  isInsufficientBalance: boolean
  isApproved: boolean
}>(null!)

export const BuyPriceContext = createContext<{
  price: ReturnType<typeof usePreviewBuy>
  tokenPrice: ReturnType<typeof useTokenPrice>
  /** Precomputed `amountIn * tokenPrice` for UI — do not recompute in components. */
  amountInUsd: number
  isFetchingQuote: boolean
}>(null!)

export const BuyTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useBuySubmitFee>
}>(null!)
