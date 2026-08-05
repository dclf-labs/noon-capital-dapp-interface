import moment from 'moment'

import { TxnStatus } from '@/lib/connection'
import { toIntlCompactStr } from '@/lib/format'

/** Fully elapsed countdown clock (`DD:HH:MM:SS`). */
export const COUNTDOWN_ZERO = '00:00:00:00'

export type WithdrawRequestView = {
  requestId: number
  amount: number
  timestamp: number
  claimed: boolean
}

export type WithdrawCountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function isPositiveFinite(n: number): boolean {
  return Number.isFinite(n) && n > 0
}

/** Unlock instant (ms) = request timestamp + on-chain `withdrawPeriod`. */
export function getWithdrawUnlockAt(timestampMs: number, withdrawPeriodMs: number): number {
  if (!Number.isFinite(timestampMs) || !Number.isFinite(withdrawPeriodMs)) return 0
  return timestampMs + withdrawPeriodMs
}

/** True when cooldown has elapsed and the request is not yet claimed. */
export function isWithdrawRequestClaimable(
  request: Pick<WithdrawRequestView, 'claimed' | 'timestamp'>,
  withdrawPeriodMs: number,
  nowMs = Date.now(),
): boolean {
  if (request.claimed) return false
  if (!isPositiveFinite(withdrawPeriodMs) || !isPositiveFinite(request.timestamp)) return false
  if (!Number.isFinite(nowMs)) return false
  return nowMs >= getWithdrawUnlockAt(request.timestamp, withdrawPeriodMs)
}

/** Compact remaining cooldown for secondary copy (`1d 2h`, `Ready`, …). */
export function formatCooldownRemaining(unlockAtMs: number, nowMs = Date.now()): string {
  if (!Number.isFinite(unlockAtMs) || !Number.isFinite(nowMs)) return 'Ready'
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

/** Remaining cooldown broken into DD / HH / MM / SS. */
export function getCountdownParts(unlockAtMs: number, nowMs = Date.now()): WithdrawCountdownParts {
  if (!Number.isFinite(unlockAtMs) || !Number.isFinite(nowMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSec = Math.max(0, Math.floor((unlockAtMs - nowMs) / 1000))
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0')
}

/** `DD:HH:MM:SS` clock for withdraw request cards. */
export function formatCountdownClock(unlockAtMs: number, nowMs = Date.now()): string {
  const { days, hours, minutes, seconds } = getCountdownParts(unlockAtMs, nowMs)
  return `${pad2(days)}:${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
}

/** Whether the live countdown should render (hidden once ready / claimed / zeroed). */
export function shouldShowWithdrawCountdown(params: {
  claimed: boolean
  claimable: boolean
  countdown: string
}): boolean {
  return !params.claimable && !params.claimed && params.countdown !== COUNTDOWN_ZERO
}

/** UTC request timestamp — `Do MMM YYYY • hh:mm A UTC`. */
export function formatWithdrawRequestTimestamp(timestampMs: number): string {
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) return '—'
  return moment(timestampMs).utc().format('Do MMM YYYY • hh:mm A [UTC]')
}

/** Amount + symbol for withdraw rows (`toIntlCompactStr`, max 2 fraction digits). */
export function formatWithdrawAmountDisplay(amount: number, symbol: string): string {
  const safeSymbol = symbol.trim() || 'USN'
  if (!Number.isFinite(amount)) return `0 ${safeSymbol}`
  return toIntlCompactStr(amount, 6, true, 0, '', ` ${safeSymbol}`, 2)
}

/** True for a non-negative integer claim id safe to submit on-chain. */
export function isValidWithdrawRequestId(requestId: number): boolean {
  return Number.isInteger(requestId) && requestId >= 0 && Number.isSafeInteger(requestId)
}

export type WithdrawClaimLabelParams = {
  claimed: boolean
  claimable: boolean
  failed: boolean
  /** Active claim txn phase for this row (omit when idle). */
  status?: TxnStatus
}

/** Primary CTA label — mirrors stake/unstake busy gerunds (`Claiming`). */
export function getWithdrawClaimLabel(params: WithdrawClaimLabelParams): string {
  if (params.claimed) return 'Claimed'
  if (
    params.status === TxnStatus.PROCESSING ||
    params.status === TxnStatus.TXN_SUBMITTED_ON_CHAIN
  ) {
    return 'Claiming'
  }
  if (params.failed || params.status === TxnStatus.TXN_FAILURE) return 'Retry claim'
  // Cooling rows keep “Claim” (disabled); badge + countdown convey wait state.
  return 'Claim'
}
