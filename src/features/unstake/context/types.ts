export interface FormInputs {
  amountIn: number | undefined
  amountOut: number | undefined
}

export interface UnstakeFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
