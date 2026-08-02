import { createContext } from 'react'

import { type Token } from '@/config/token'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/stake/context/types'
import type usePreviewStake from '@/features/stake/hooks/usePreviewStake'
import type useStakeSubmitFee from '@/features/stake/hooks/useStakeSubmitFee'
import type useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import type useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { type EVMConnection } from '@/lib/connection'

export const StakeFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: React.Dispatch<React.SetStateAction<number>>
  connection: EVMConnection
  tokenIn: Token | undefined
  tokenOut: Token | undefined
}>(null!)

export const StakeBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  tokenInAllowance: ReturnType<typeof useTokenAllowance>
  isInsufficientBalance: boolean
  isApproved: boolean
}>(null!)

export const StakePriceContext = createContext<{
  price: ReturnType<typeof usePreviewStake>
  tokenPrice: ReturnType<typeof useTokenPrice>
  /** Precomputed `amountIn * tokenPrice` for UI — do not recompute in components. */
  amountInUsd: number
  isFetchingQuote: boolean
  isQuoteError: boolean
}>(null!)

export const StakeTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useStakeSubmitFee>
}>(null!)
