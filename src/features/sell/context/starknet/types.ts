import { type Token } from '@/config/token'
import { type EkuboSwapInfoRoute } from '@/lib/api'

export interface FormInputs {
  tokenIn: Token | undefined
  tokenOut: Token | undefined
  amountIn: number | undefined
  amountOut: number | undefined
  tokensIn: Token[] | undefined
  tokensOut: Token[] | undefined
  route: EkuboSwapInfoRoute[]
}

export interface SellFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
