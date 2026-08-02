import { createContext } from 'react'

import { type Token } from '@/config/token'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import type { FormInputs } from '@/features/unstake/context/types'
import type usePreviewUnstake from '@/features/unstake/hooks/usePreviewUnstake'
import type useUnstakeSubmitFee from '@/features/unstake/hooks/useUnstakeSubmitFee'
import type useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { type EVMConnection } from '@/lib/connection'

export const UnstakeFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: React.Dispatch<React.SetStateAction<number>>
  connection: EVMConnection
  tokenIn: Token | undefined
  tokenOut: Token | undefined
}>(null!)

export const UnstakeBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  isInsufficientBalance: boolean
}>(null!)

export const UnstakePriceContext = createContext<{
  price: ReturnType<typeof usePreviewUnstake>
  tokenPrice: ReturnType<typeof useTokenPrice>
  /** Precomputed `amountIn * tokenPrice` for UI — do not recompute in components. */
  amountInUsd: number
  isFetchingQuote: boolean
}>(null!)

export const UnstakeTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useUnstakeSubmitFee>
}>(null!)
