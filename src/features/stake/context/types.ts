export interface FormInputs {
  amountIn: number | undefined
  amountOut: number | undefined
}

export interface StakeFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
