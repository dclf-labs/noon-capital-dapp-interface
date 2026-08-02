import { createContext } from 'react'

import { type Token } from '@/config/token'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/mint/context/types'
import type useMintSubmitFee from '@/features/mint/hooks/useMintSubmitFee'
import type usePreviewMint from '@/features/mint/hooks/usePreviewMint'
import type useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import type useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { type EVMConnection } from '@/lib/connection'

export const MintFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: React.Dispatch<React.SetStateAction<number>>
  connection: EVMConnection
  tokenOut: Token | undefined
}>(null!)

export const MintBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  tokenInAllowance: ReturnType<typeof useTokenAllowance>
  isInsufficientBalance: boolean
  isApproved: boolean
}>(null!)

export const MintPriceContext = createContext<{
  price: ReturnType<typeof usePreviewMint>
  tokenPrice: ReturnType<typeof useTokenPrice>
  /** Precomputed `amountIn * tokenPrice` for UI — do not recompute in components. */
  amountInUsd: number
  isFetchingQuote: boolean
  isQuoteError: boolean
}>(null!)

export const MintTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useMintSubmitFee>
}>(null!)
