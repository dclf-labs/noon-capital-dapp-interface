import { type Token } from '@/config/token'

export interface FormInputs {
  tokenOut: Token | undefined
  amountIn: number | undefined
  amountOut: number | undefined
  tokensOut: Token[] | undefined
}

export interface RedeemFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
