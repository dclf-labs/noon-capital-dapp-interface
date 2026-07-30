import { type Token } from '@/config/token'

export interface FormInputs {
  tokenIn: Token | undefined
  tokenOut: Token | undefined
  amountIn: number | undefined
  amountOut: number | undefined
  tokensIn: Token[] | undefined
  tokensOut: Token[] | undefined
}

export interface SellFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
