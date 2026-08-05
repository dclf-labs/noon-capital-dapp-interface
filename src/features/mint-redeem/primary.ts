import { formatActionTokenLabel } from '@/features/_shared/action-label'

export type MintRedeemMode = 'mint' | 'redeem'

export type MintRedeemPrimaryAction = {
  label: string
  disabled: boolean
  loading: boolean
}

export type MintRedeemPrimaryParams = {
  mode: MintRedeemMode
  step: number
  isConnected: boolean
  isBalanceLoading: boolean
  isAllowanceLoading: boolean
  isWhitelistLoading: boolean
  isWhitelistError?: boolean
  isWhitelisted: boolean
  amountIn?: number
  amountOut?: number
  isFetchingQuote: boolean
  isQuoteError: boolean
  isInsufficientBalance: boolean
  isApproved: boolean
  tokenInSymbol?: string
  /** Mint receive token — used for mint CTA (`Mint USN`). */
  tokenOutSymbol?: string
  approveStatus?: string
  isBusyApprove: boolean
  isBusySubmit: boolean
  submitFailed: boolean
}

/** Mint/redeem CTA machine: whitelist → quote → approve → confirm. */
export function getMintRedeemPrimaryAction({
  mode,
  step,
  isConnected,
  isBalanceLoading,
  isAllowanceLoading,
  isWhitelistLoading,
  isWhitelistError,
  isWhitelisted,
  amountIn,
  amountOut,
  isFetchingQuote,
  isQuoteError,
  isInsufficientBalance,
  isApproved,
  tokenInSymbol,
  tokenOutSymbol,
  approveStatus,
  isBusyApprove,
  isBusySubmit,
  submitFailed,
}: MintRedeemPrimaryParams): MintRedeemPrimaryAction {
  if (!isConnected) {
    return { label: 'Connect wallet', disabled: false, loading: false }
  }
  if (isBalanceLoading || isAllowanceLoading || isWhitelistLoading) {
    return { label: 'Loading', disabled: true, loading: true }
  }
  if (isWhitelistError) {
    return { label: 'Whitelist check failed', disabled: true, loading: false }
  }
  if (!isWhitelisted) {
    return { label: 'Not whitelisted', disabled: true, loading: false }
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

  if (step === 0 && !isApproved) {
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
    const label =
      mode === 'mint'
        ? formatActionTokenLabel('Mint', tokenOutSymbol)
        : formatActionTokenLabel('Redeem', tokenInSymbol)
    return { label, disabled: !amountOut, loading: false }
  }

  const confirm = mode === 'mint' ? 'Confirm mint' : 'Confirm redeem'
  const retry = mode === 'mint' ? 'Retry mint' : 'Retry redeem'
  const busy = mode === 'mint' ? 'Minting' : 'Redeeming'

  return {
    label: submitFailed ? retry : isBusySubmit ? busy : confirm,
    disabled: !isApproved || !amountOut || isBusySubmit,
    loading: isBusySubmit,
  }
}
