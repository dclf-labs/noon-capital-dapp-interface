import { createContext } from 'react'

import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/sell/context/starknet/types'
import type usePreviewSell from '@/features/sell/hooks/starknet/usePreviewSell'
import type useSellAllowance from '@/features/sell/hooks/starknet/useSellAllowance'
import type useSellSubmitFee from '@/features/sell/hooks/starknet/useSellSubmitFee'
import type useTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'
import { type StarknetConnection } from '@/lib/connection'

export const SellFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: (step: number) => void
  connection: StarknetConnection
}>(null!)

export const SellBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  tokenInAllowance: ReturnType<typeof useSellAllowance>
  isInsufficientBalance: boolean
  isApproved: boolean
}>(null!)

export const SellPriceContext = createContext<{
  price: ReturnType<typeof usePreviewSell>
  tokenPrice: ReturnType<typeof useTokenPrice>
  /** Precomputed `amountIn * tokenPrice` for UI — do not recompute in components. */
  amountInUsd: number
  isFetchingQuote: boolean
}>(null!)

export const SellTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useSellSubmitFee>
}>(null!)
