export type TradePrimaryAction = {
  label: string
  disabled: boolean
  loading: boolean
}

export type TradePrimaryParams = {
  mode: 'buy' | 'sell'
  step: number
  isConnected: boolean
  isBalanceLoading: boolean
  isAllowanceLoading?: boolean
  amountIn?: number
  amountOut?: number
  hasRoute?: boolean
  isFetchingQuote: boolean
  isQuoteError: boolean
  isInsufficientBalance: boolean
  isApproved: boolean
  requiresApproval: boolean
  tokenInSymbol?: string
  approveStatus?: 'IDLE' | 'PROCESSING' | 'TXN_SUBMITTED_ON_CHAIN' | 'TXN_FAILURE' | string
  isBusyApprove?: boolean
  isBusySubmit: boolean
  submitFailed?: boolean
}

/**
 * Shared buy/sell primary CTA state machine (connect → quote → approve → confirm).
 */
export function getTradePrimaryAction({
  mode,
  step,
  isConnected,
  isBalanceLoading,
  isAllowanceLoading = false,
  amountIn,
  amountOut,
  hasRoute = true,
  isFetchingQuote,
  isQuoteError,
  isInsufficientBalance,
  isApproved,
  requiresApproval,
  tokenInSymbol,
  approveStatus,
  isBusyApprove = false,
  isBusySubmit,
  submitFailed = false,
}: TradePrimaryParams): TradePrimaryAction {
  if (!isConnected) {
    return { label: 'Connect wallet', disabled: true, loading: false }
  }
  if (isBalanceLoading || isAllowanceLoading) {
    return { label: 'Loading…', disabled: true, loading: true }
  }
  if (!amountIn) {
    return { label: 'Enter amount', disabled: true, loading: false }
  }
  if (isFetchingQuote) {
    return { label: 'Fetching quote…', disabled: true, loading: true }
  }
  if (isQuoteError) {
    return { label: 'Quote unavailable', disabled: true, loading: false }
  }
  if (isInsufficientBalance) {
    return { label: 'Insufficient balance', disabled: true, loading: false }
  }

  const quoteReady = Boolean(amountOut) && hasRoute

  if (step === 0 && requiresApproval && !isApproved) {
    return {
      label:
        approveStatus === 'TXN_FAILURE'
          ? 'Retry approve'
          : isBusyApprove
            ? 'Approving…'
            : `Approve ${tokenInSymbol || ''}`.trim(),
      disabled: isBusyApprove,
      loading: isBusyApprove,
    }
  }

  if (step === 0) {
    return { label: 'Next', disabled: !quoteReady, loading: false }
  }

  return {
    label: submitFailed
      ? 'Retry swap'
      : isBusySubmit
        ? 'Submitting…'
        : mode === 'buy'
          ? 'Confirm buy'
          : 'Confirm sell',
    disabled: (requiresApproval && !isApproved) || !quoteReady || isBusySubmit,
    loading: isBusySubmit,
  }
}
