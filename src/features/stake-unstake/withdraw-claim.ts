export type WithdrawRequestView = {
  requestId: number
  amount: number
  timestamp: number
  claimed: boolean
}

/** Unlock instant (ms) = request timestamp + on-chain withdrawPeriod. */
export function getWithdrawUnlockAt(timestampMs: number, withdrawPeriodMs: number): number {
  return timestampMs + withdrawPeriodMs
}

/** True when the cooldown has elapsed and the request is not yet claimed. */
export function isWithdrawRequestClaimable(
  request: Pick<WithdrawRequestView, 'claimed' | 'timestamp'>,
  withdrawPeriodMs: number,
  nowMs = Date.now(),
): boolean {
  if (request.claimed) return false
  if (!(withdrawPeriodMs > 0) || !(request.timestamp > 0)) return false
  return nowMs >= getWithdrawUnlockAt(request.timestamp, withdrawPeriodMs)
}

/** Compact remaining cooldown for claim UI. */
export function formatCooldownRemaining(unlockAtMs: number, nowMs = Date.now()): string {
  const ms = Math.max(0, unlockAtMs - nowMs)
  if (ms <= 0) return 'Ready'
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m`
  return '<1m'
}

/** Claim-button / status label for a single withdraw request row. */
export function getWithdrawClaimLabel(params: {
  claimed: boolean
  claimable: boolean
  isBusy: boolean
  failed: boolean
}): string {
  if (params.claimed) return 'Claimed'
  if (params.isBusy) return 'Claiming…'
  if (params.failed) return 'Retry claim'
  if (!params.claimable) return 'Cooling down'
  return 'Claim'
}
