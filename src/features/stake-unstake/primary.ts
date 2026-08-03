export type StakeUnstakeMode = 'stake' | 'unstake'

export type StakeUnstakePrimaryAction = {
  label: string
  disabled: boolean
  loading: boolean
}

export type StakeUnstakePrimaryParams = {
  mode: StakeUnstakeMode
  step: number
  isConnected: boolean
  isBalanceLoading: boolean
  isAllowanceLoading?: boolean
  amountIn?: number
  amountOut?: number
  isFetchingQuote: boolean
  isQuoteError: boolean
  isInsufficientBalance: boolean
  /** Stake requires USN approval; unstake does not. */
  requiresApproval: boolean
  isApproved: boolean
  tokenInSymbol?: string
  approveStatus?: string
  isBusyApprove: boolean
  isBusySubmit: boolean
  submitFailed: boolean
}

/** Stake/unstake CTA machine: quote → optional approve → confirm. */
export function getStakeUnstakePrimaryAction({
  mode,
  step,
  isConnected,
  isBalanceLoading,
  isAllowanceLoading,
  amountIn,
  amountOut,
  isFetchingQuote,
  isQuoteError,
  isInsufficientBalance,
  requiresApproval,
  isApproved,
  tokenInSymbol,
  approveStatus,
  isBusyApprove,
  isBusySubmit,
  submitFailed,
}: StakeUnstakePrimaryParams): StakeUnstakePrimaryAction {
  if (!isConnected) {
    return { label: 'Connect wallet', disabled: true, loading: false }
  }
  if (isBalanceLoading || (requiresApproval && isAllowanceLoading)) {
    return { label: 'Loading', disabled: true, loading: true }
  }
  if (!amountIn) {
    return { label: 'Enter amount', disabled: true, loading: false }
  }
  if (isFetchingQuote) {
    return { label: 'Fetching quote', disabled: true, loading: true }
  }
  if (isQuoteError) {
    return { label: 'Quote unavailable', disabled: true, loading: false }
  }
  if (isInsufficientBalance) {
    return { label: 'Insufficient balance', disabled: true, loading: false }
  }

  if (step === 0 && requiresApproval && !isApproved) {
    return {
      label:
        approveStatus === 'TXN_FAILURE'
          ? 'Retry approve'
          : isBusyApprove
            ? 'Approving'
            : `Approve ${tokenInSymbol || ''}`.trim(),
      disabled: isBusyApprove,
      loading: isBusyApprove,
    }
  }

  if (step === 0) {
    return { label: 'Next', disabled: !amountOut, loading: false }
  }

  const confirm = mode === 'stake' ? 'Confirm stake' : 'Confirm unstake'
  const retry = mode === 'stake' ? 'Retry stake' : 'Retry unstake'
  const approvedOk = !requiresApproval || isApproved

  return {
    label: submitFailed ? retry : isBusySubmit ? 'Submitting' : confirm,
    disabled: !approvedOk || !amountOut || isBusySubmit,
    loading: isBusySubmit,
  }
}
