import { createContext } from 'react'

import { type Token } from '@/config/token'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import { type FormInputs } from '@/features/bridge/context/evm/types'
import type useBridgeAllowance from '@/features/bridge/hooks/evm/useBridgeAllowance'
import type useBridgeQuote from '@/features/bridge/hooks/evm/useBridgeFeeQuote'
import type useBridgeSubmitFee from '@/features/bridge/hooks/evm/useBridgeSubmitFee'
import type useTokenBalance from '@/hooks/on-chain/useTokenBalance'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'

export const BridgeFormContext = createContext<{
  inputs: FormInputs
  setInputs: React.Dispatch<React.SetStateAction<FormInputs>>
  step: number
  setStep: React.Dispatch<React.SetStateAction<number>>
  connection: EVMConnection
  destinationConnection: EVMConnection | StarknetConnection
  tokenOut: Token | undefined
  isStarknetReceiverAddressModalOpen: boolean
  setIsStarknetReceiverAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  isSuiReceiverAddressModalOpen: boolean
  setIsSuiReceiverAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  isEvmReceiverAddressModalOpen: boolean
  setIsEvmReceiverAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}>(null!)

export const BridgeBalanceContext = createContext<{
  tokenInBalance: ReturnType<typeof useTokenBalance>
  tokenOutBalance: ReturnType<typeof useTokenBalance>
  tokenInAllowance: ReturnType<typeof useBridgeAllowance>
  isInsufficientBalance: boolean
  isApproved: boolean
}>(null!)

export const BridgePriceContext = createContext<{
  feeQuote: ReturnType<typeof useBridgeQuote>
  tokenPrice: ReturnType<typeof useTokenPrice>
  /** Precomputed `amount * tokenPrice` for UI — do not recompute in components. */
  amountInUsd: number
}>(null!)

export const BridgeTxnContext = createContext<{
  txnUrl: string | undefined
  setTxnUrl: React.Dispatch<React.SetStateAction<string | undefined>>
  submitFee: ReturnType<typeof useBridgeSubmitFee>
}>(null!)
