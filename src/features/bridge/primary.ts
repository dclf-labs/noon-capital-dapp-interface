export type BridgePrimaryAction = {
  label: string
  disabled: boolean
  loading: boolean
}

export type BridgePrimaryParams = {
  step: number
  isConnected: boolean
  unsupported?: boolean
  hasSourceNetwork: boolean
  hasDestinationNetwork: boolean
  pairAllowed: boolean
  hasReceiver: boolean
  hasToken: boolean
  /** Bridge send amount (1:1 receive); named `amount` not amountIn/Out. */
  amount?: number
  isBalanceLoading: boolean
  isAllowanceLoading: boolean
  isFeeLoading: boolean
  isFeeError: boolean
  isInsufficientBalance: boolean
  routeDisabled: boolean
  routeDisabledLabel?: string
  requiresApproval: boolean
  isApproved: boolean
  tokenSymbol?: string
  approveStatus?: string
  isBusyApprove: boolean
  isBusySubmit: boolean
  submitFailed: boolean
}

/**
 * Bridge CTA machine: networks → receiver → quote → optional approve → confirm.
 */
export function getBridgePrimaryAction({
  step,
  isConnected,
  unsupported,
  hasSourceNetwork,
  hasDestinationNetwork,
  pairAllowed,
  hasReceiver,
  hasToken,
  amount,
  isBalanceLoading,
  isAllowanceLoading,
  isFeeLoading,
  isFeeError,
  isInsufficientBalance,
  routeDisabled,
  routeDisabledLabel,
  requiresApproval,
  isApproved,
  tokenSymbol,
  approveStatus,
  isBusyApprove,
  isBusySubmit,
  submitFailed,
}: BridgePrimaryParams): BridgePrimaryAction {
  if (!isConnected) {
    return { label: 'Connect wallet', disabled: true, loading: false }
  }
  if (unsupported) {
    return { label: 'Switch network', disabled: true, loading: false }
  }
  if (!hasSourceNetwork) {
    return { label: 'Select source network', disabled: true, loading: false }
  }
  if (!hasDestinationNetwork) {
    return { label: 'Select destination network', disabled: true, loading: false }
  }
  if (!pairAllowed) {
    return { label: 'Unsupported route', disabled: true, loading: false }
  }
  if (!hasReceiver) {
    return { label: 'Enter receiver address', disabled: true, loading: false }
  }
  if (!hasToken) {
    return { label: 'Select token', disabled: true, loading: false }
  }
  if (isBalanceLoading || (requiresApproval && isAllowanceLoading)) {
    return { label: 'Loading…', disabled: true, loading: true }
  }
  if (!amount) {
    return { label: 'Enter amount', disabled: true, loading: false }
  }
  if (isFeeLoading) {
    return { label: 'Fetching fee…', disabled: true, loading: true }
  }
  if (isFeeError) {
    return { label: 'Fee unavailable', disabled: true, loading: false }
  }
  if (routeDisabled) {
    return {
      label: routeDisabledLabel || 'Bridge unavailable',
      disabled: true,
      loading: false,
    }
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
            ? 'Approving…'
            : `Approve ${tokenSymbol || ''}`.trim(),
      disabled: isBusyApprove,
      loading: isBusyApprove,
    }
  }

  if (step === 0) {
    return { label: 'Next', disabled: false, loading: false }
  }

  return {
    label: submitFailed ? 'Retry bridge' : isBusySubmit ? 'Bridging…' : 'Confirm bridge',
    disabled: (requiresApproval && !isApproved) || isBusySubmit,
    loading: isBusySubmit,
  }
}
