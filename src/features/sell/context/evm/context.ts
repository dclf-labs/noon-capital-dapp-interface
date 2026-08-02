import { createContext } from 'react'

import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/sell/context/evm/types'
import type usePreviewSell from '@/features/sell/hooks/evm/usePreviewSell'
import type useSellAllowance from '@/features/sell/hooks/evm/useSellAllowance'
import type useSellSubmitFee from '@/features/sell/hooks/evm/useSellSubmitFee'
import type useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { type EVMConnection } from '@/lib/connection'

export const SellFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: (step: number) => void
  connection: EVMConnection
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
  isQuoteError: boolean
}>(null!)

export const SellTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useSellSubmitFee>
}>(null!)
