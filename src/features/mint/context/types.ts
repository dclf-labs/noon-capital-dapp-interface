import { type Token } from '@/config/token'

export interface FormInputs {
  tokenIn: Token | undefined
  amountIn: number | undefined
  amountOut: number | undefined
  tokensIn: Token[] | undefined
}

export interface MintFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
