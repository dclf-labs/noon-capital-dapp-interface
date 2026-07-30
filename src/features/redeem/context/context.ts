import { createContext } from 'react'

import { type Token } from '@/config/token'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/redeem/context/types'
import type usePreviewRedeem from '@/features/redeem/hooks/usePreviewRedeem'
import type useRedeemSubmitFee from '@/features/redeem/hooks/useRedeemSubmitFee'
import type useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import type useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { type EVMConnection } from '@/lib/connection'

export const RedeemFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: React.Dispatch<React.SetStateAction<number>>
  connection: EVMConnection
  tokenIn: Token | undefined
}>(null!)

export const RedeemBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  tokenInAllowance: ReturnType<typeof useTokenAllowance>
  isInsufficientBalance: boolean
  isApproved: boolean
}>(null!)

export const RedeemPriceContext = createContext<{
  price: ReturnType<typeof usePreviewRedeem>
  tokenOutPrice: ReturnType<typeof useTokenPrice>
  isFetchingQuote: boolean
}>(null!)

export const RedeemTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useRedeemSubmitFee>
}>(null!)
