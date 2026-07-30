import moment from 'moment'

import { SECONDS_PER_YEAR } from '@/constants/common'
import { bnToStr, toBn, toNum } from '@/lib/format'
import { calculateGovernanceCurve } from '@/lib/utils'

export type OpenGovernanceMonthConfig = {
  /** Canonical month label, typically `YYYY-MM` */
  date: string
  start: string
  end: string
  noonMonthlyRewards: number
  totalOpenStakedWei: string
}

/**
 * One entry per program month, oldest first. Extend when a new month goes live.
 * Pending vs slot split uses the start of the current rewards period:
 * - pending — staked on or after that instant (current period request)
 * - slot — staked on or after program start and strictly before that instant (prior periods)
 */
export const OPEN_GOVERNANCE_MONTHLY_SCHEDULE: readonly OpenGovernanceMonthConfig[] = [
  {
    date: '2026-03',
    start: '2026-03-01T00:00:00',
    end: '2026-03-31T23:59:59.999',
    noonMonthlyRewards: 3_500_000,
    totalOpenStakedWei: '756074810575177611706300',
  },
  {
    date: '2026-04',
    start: '2026-04-01T00:00:00',
    end: '2026-04-30T23:59:59.999',
    noonMonthlyRewards: 3_855_515,
    totalOpenStakedWei: '1437357877103000000000000',
  },
  {
    date: '2026-05',
    start: '2026-05-01T00:00:00',
    end: '2026-05-31T23:59:59.999',
    noonMonthlyRewards: 3_482_666,
    totalOpenStakedWei: '1389163026727000000000000 ',
  },
  {
    date: '2026-06',
    start: '2026-06-01T00:00:00',
    end: '2026-06-30T23:59:59.999',
    noonMonthlyRewards: 1_641_759.62,
    totalOpenStakedWei: '282923287400109791218816',
  },
  {
    date: '2026-07',
    start: '2026-07-01T00:00:00',
    end: '2026-07-31T23:59:59.999',
    noonMonthlyRewards: 1_667_592.63,
    totalOpenStakedWei: '318644779890471930099932',
  },
]

export const OPEN_GOVERNANCE_MIN_POOL_NOON = 1e-12

/**
 * Backend rewards vesting starts on the 1st of the month after the on-chain stake date.
 * A stake created mid-month (e.g. 3 Jul for 3 months) is a request through month-end;
 * vesting begins 1 Aug and unlocks 3 months later (1 Nov). On-chain dates are unchanged.
 */
export function openStakeEffectiveStartMs(stakeDateSec: number): number {
  return moment(stakeDateSec * 1000)
    .add(1, 'month')
    .startOf('month')
    .valueOf()
}

export function openStakeLockMonths(stakeDateSec: number, endSec: number): number {
  // Contract lock durations use 365-day years (e.g. 4y = 365*4 days). Calendar
  // month/year diffs undercount across leap days (1460d → 47 months / 3 years).
  const days = Math.max(0, moment(endSec * 1000).diff(moment(stakeDateSec * 1000), 'days'))
  return Math.max(0, Math.round(days / (365 / 12)))
}

/** Display label for an open-stake lock (`3 Months`, `4 Years`, …). */
export function openStakeLockPeriodLabel(lockMonths: number): string {
  if (lockMonths > 12) {
    const years = lockMonths / 12
    const yearsLabel = Number.isInteger(years) ? String(years) : years.toFixed(1)
    return `${yearsLabel} Years`
  }
  return `${lockMonths} Months`
}

/**
 * Duration seconds passed to `createStake`. Only the 4-year lock uses a fixed
 * 4 * 365 days; all other periods use calendar months.
 */
export function openStakeOnChainDurationSeconds(
  lockMonths: number,
  nowMs: number = Date.now(),
): number {
  if (lockMonths === 48) {
    return 4 * SECONDS_PER_YEAR
  }
  return moment(nowMs).add(lockMonths, 'months').diff(moment(nowMs), 'seconds')
}

export function openStakeEffectiveEndMs(stakeDateSec: number, endSec: number): number {
  const months = openStakeLockMonths(stakeDateSec, endSec)
  return moment(openStakeEffectiveStartMs(stakeDateSec)).add(months, 'months').valueOf()
}

/** Preview dates for a new stake request (UI only; on-chain duration stays wall-clock). */
export function openStakePreviewEffectiveStartMs(nowMs: number = Date.now()): number {
  return moment(nowMs).add(1, 'month').startOf('month').valueOf()
}

export function openStakePreviewEffectiveEndMs(
  lockMonths: number,
  nowMs: number = Date.now(),
): number {
  return moment(openStakePreviewEffectiveStartMs(nowMs)).add(lockMonths, 'months').valueOf()
}

/** Curve % for a new stake request using backend-aligned vesting days. */
export function openStakePreviewRewardsPercentage(
  lockMonths: number,
  nowMs: number = Date.now(),
): number {
  const startMs = openStakePreviewEffectiveStartMs(nowMs)
  const endMs = openStakePreviewEffectiveEndMs(lockMonths, nowMs)
  const days = moment(endMs).diff(moment(startMs), 'days')
  return calculateGovernanceCurve(days, 365, Math.floor(lockMonths))
}

export type OpenStakeRecord = {
  isVip: boolean
  amount: bigint
  end: bigint
  multiplier: bigint
  stakeDate: bigint
  isPermanent: boolean
  tokenId: number
}

export type OpenStakingSlotView = {
  id: number
  tokenId: number
  amount: number
  /** On-chain unlock timestamp (unix seconds). Prefer `effectiveEnd` for UI. */
  end: number
  /** On-chain stake timestamp (unix seconds). Prefer `effectiveStart` for UI. */
  stakeDate: number
  /** Backend-aligned vesting start (unix seconds). */
  effectiveStart: number
  /** Backend-aligned unlock (unix seconds). */
  effectiveEnd: number
  yourRewards: number
  yourFullRewards: number
  yourStakingPeriod: {
    days: number
    months: number
    currentDays: number
    currentMonths: number
  }
  yourCurrentRewards: number
  openGovernanceStakeMonthIndex: number
  slotMonthlyRewards: number
  slotTotalOpenStaked: number
}

export type PendingStakeView = {
  stake: OpenStakeRecord
  amount: number
  rewardsEstimate: number
  rewardsDisplay: number
  lockMonths: number
}

export type OpenStakingPortfolio = {
  yourSlots: OpenStakingSlotView[]
  pendingViews: PendingStakeView[]
  hasPendingStakeRequest: boolean
  slotsPositionToken: number
  pendingPrincipalToken: number
  pendingRewardsToken: number
  currentPositionsToken: number
  rewardsAvailableToken: number
  openStakingMaxToken: number
}

function assertOpenGovernanceScheduleValid(schedule: readonly OpenGovernanceMonthConfig[]) {
  if (!import.meta.env.DEV) return
  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i]!
    const start = moment(row.start)
    const end = moment(row.end)
    if (!start.isValid() || !end.isValid()) {
      console.error(`Open governance schedule row ${i} (${row.date}): invalid start/end`)
      continue
    }
    if (end.valueOf() < start.valueOf()) {
      console.error(`Open governance schedule row ${i} (${row.date}): end is before start`)
    }
    if (i > 0) {
      const prevEnd = moment(schedule[i - 1]!.end)
      if (start.valueOf() <= prevEnd.valueOf()) {
        console.warn(
          `Open governance schedule: row ${i} (${row.date}) overlaps or is out of order vs previous`,
        )
      }
    }
  }
}

assertOpenGovernanceScheduleValid(OPEN_GOVERNANCE_MONTHLY_SCHEDULE)

function openGovernanceScheduleBounds(schedule: readonly OpenGovernanceMonthConfig[]) {
  let earliestStartMs = Infinity
  let latestEndMs = -Infinity
  for (const row of schedule) {
    const start = moment(row.start)
    const end = moment(row.end)
    if (start.isValid()) earliestStartMs = Math.min(earliestStartMs, start.valueOf())
    if (end.isValid()) latestEndMs = Math.max(latestEndMs, end.valueOf())
  }
  return { earliestStartMs, latestEndMs }
}

export function openGovernanceMonthIndexFromDate(
  schedule: readonly OpenGovernanceMonthConfig[],
  dateMs: number,
): number {
  if (schedule.length === 0) return -1
  if (!Number.isFinite(dateMs)) return -1

  const t = moment(dateMs)
  if (!t.isValid()) return -1

  const { earliestStartMs, latestEndMs } = openGovernanceScheduleBounds(schedule)
  if (earliestStartMs === Infinity) return -1
  if (t.valueOf() < earliestStartMs) return -1

  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i]!
    const start = moment(row.start)
    const end = moment(row.end)
    if (!start.isValid() || !end.isValid()) continue
    if (t.valueOf() >= start.valueOf() && t.valueOf() <= end.valueOf()) {
      return i
    }
  }

  if (latestEndMs !== -Infinity && t.valueOf() > latestEndMs) {
    return schedule.length
  }

  for (let i = schedule.length - 1; i >= 0; i--) {
    const start = moment(schedule[i]!.start)
    if (start.isValid() && t.valueOf() >= start.valueOf()) {
      return i
    }
  }

  return -1
}

function openGovernancePeriodStartMs(
  schedule: readonly OpenGovernanceMonthConfig[],
  dateMs: number,
): number | null {
  const idx = openGovernanceMonthIndexFromDate(schedule, dateMs)
  if (idx < 0) return null
  if (idx < schedule.length) {
    const start = moment(schedule[idx]!.start)
    return start.isValid() ? start.valueOf() : null
  }
  const start = moment(dateMs).startOf('month')
  return start.isValid() ? start.valueOf() : null
}

function partitionOpenStakesByPeriod(
  schedule: readonly OpenGovernanceMonthConfig[],
  stakes: readonly OpenStakeRecord[] | undefined,
  nowMs: number,
): { pending: OpenStakeRecord[]; slots: OpenStakeRecord[] } {
  const periodStartMs = openGovernancePeriodStartMs(schedule, nowMs)
  const { earliestStartMs } = openGovernanceScheduleBounds(schedule)
  if (periodStartMs == null || earliestStartMs === Infinity) {
    return { pending: [], slots: [] }
  }

  const pending: OpenStakeRecord[] = []
  const slots: OpenStakeRecord[] = []

  for (const stake of stakes ?? []) {
    if (stake?.tokenId === undefined) continue
    const stakeMs = toNum(stake?.stakeDate) * 1000
    if (!Number.isFinite(stakeMs) || stakeMs < earliestStartMs) continue

    if (stakeMs >= periodStartMs) {
      pending.push(stake)
    } else {
      slots.push(stake)
    }
  }

  const byStakeDate = (a: OpenStakeRecord, b: OpenStakeRecord) =>
    toNum(a.stakeDate) - toNum(b.stakeDate)

  pending.sort(byStakeDate)
  slots.sort(byStakeDate)

  return { pending, slots }
}

export function openStakeRewardsEstimate(
  stakeAmount: number,
  stakeDateSec: number,
  endSec: number,
  monthlyRewards: number,
  poolTotal: number,
) {
  const denom = Math.max(poolTotal, OPEN_GOVERNANCE_MIN_POOL_NOON)
  const effectiveStartMs = openStakeEffectiveStartMs(stakeDateSec)
  const effectiveEndMs = openStakeEffectiveEndMs(stakeDateSec, endSec)
  const days = moment(effectiveEndMs).diff(moment(effectiveStartMs), 'days')
  const months = openStakeLockMonths(stakeDateSec, endSec)
  const fullRewards = (stakeAmount * monthlyRewards) / denom
  return fullRewards * calculateGovernanceCurve(days, 365, Math.floor(months))
}

function buildOpenStakingSlotViews(
  schedule: readonly OpenGovernanceMonthConfig[],
  slotStakes: readonly OpenStakeRecord[],
  currentMonthIndex: number,
  currentMonthPoolTotal: number,
  totalOpenStakedOverall: number,
): OpenStakingSlotView[] {
  return slotStakes.map((stake, i) => {
    const yourStake = toNum(bnToStr(toBn(stake?.amount), 18))
    const stakeDateSec = toNum(stake?.stakeDate)
    const endSec = toNum(stake?.end)
    const effectiveStartSec = Math.floor(openStakeEffectiveStartMs(stakeDateSec) / 1000)
    const effectiveEndSec = Math.floor(openStakeEffectiveEndMs(stakeDateSec, endSec) / 1000)
    const stakeMonthIndex = openGovernanceMonthIndexFromDate(schedule, stakeDateSec * 1000)
    const slotMonthlyRewards = rewardsForProgramMonth(schedule, stakeMonthIndex)
    const slotTotalOpenStaked = poolTotalOpenStakedForMonth(
      schedule,
      stakeMonthIndex,
      currentMonthIndex,
      currentMonthPoolTotal,
      totalOpenStakedOverall,
    )
    const slotDenom = Math.max(slotTotalOpenStaked, OPEN_GOVERNANCE_MIN_POOL_NOON)

    const yourStakingPeriod = {
      days: moment(effectiveEndSec * 1000).diff(moment(effectiveStartSec * 1000), 'days'),
      months: openStakeLockMonths(stakeDateSec, endSec),
      currentDays: moment(effectiveEndSec * 1000).diff(moment(), 'days'),
      currentMonths: moment(effectiveEndSec * 1000).diff(moment(), 'months'),
    }
    const yourFullRewards = (yourStake * slotMonthlyRewards) / slotDenom
    const yourRewards = openStakeRewardsEstimate(
      yourStake,
      stakeDateSec,
      endSec,
      slotMonthlyRewards,
      slotTotalOpenStaked,
    )

    const yourCurrentRewards =
      yourFullRewards *
      calculateGovernanceCurve(
        yourStakingPeriod.currentDays,
        365,
        Math.floor(yourStakingPeriod.currentMonths),
      )

    return {
      id: i,
      tokenId: stake.tokenId,
      amount: yourStake,
      end: endSec,
      stakeDate: stakeDateSec,
      effectiveStart: effectiveStartSec,
      effectiveEnd: effectiveEndSec,
      yourRewards,
      yourFullRewards,
      yourStakingPeriod,
      yourCurrentRewards,
      openGovernanceStakeMonthIndex: stakeMonthIndex,
      slotMonthlyRewards,
      slotTotalOpenStaked,
    }
  })
}

function buildPendingStakeViews(
  pendingStakes: readonly OpenStakeRecord[],
  noonMonthlyRewards: number,
  poolDenom: number,
): PendingStakeView[] {
  return pendingStakes.map((stake) => {
    const amount = toNum(bnToStr(toBn(stake?.amount), 18))
    const stakeDateSec = toNum(stake?.stakeDate)
    const endSec = toNum(stake?.end)
    const rewardsEstimate = openStakeRewardsEstimate(
      amount,
      stakeDateSec,
      endSec,
      noonMonthlyRewards,
      poolDenom,
    )
    const lockMonths = openStakeLockMonths(stakeDateSec, endSec)

    return {
      stake,
      amount,
      rewardsEstimate,
      rewardsDisplay: Math.min(rewardsEstimate, noonMonthlyRewards),
      lockMonths,
    }
  })
}

function sumOpenStakingSlotPosition(slots: readonly OpenStakingSlotView[]): number {
  return slots.reduce((acc, slot) => acc + toNum(slot.amount) + toNum(slot.yourRewards), 0)
}

function sumPendingStakePrincipal(pending: readonly PendingStakeView[]): number {
  return pending.reduce((acc, row) => acc + row.amount, 0)
}

function sumPendingStakeRewards(pending: readonly PendingStakeView[]): number {
  return pending.reduce((acc, row) => acc + row.rewardsEstimate, 0)
}

/** Portfolio math is per on-chain stake, then summed. */
export function computeOpenStakingPortfolio(
  schedule: readonly OpenGovernanceMonthConfig[],
  stakes: readonly OpenStakeRecord[] | undefined,
  nowMs: number,
  currentMonthIndex: number,
  currentMonthRewards: number,
  currentMonthPoolTotal: number,
  totalOpenStakedOverall: number,
): OpenStakingPortfolio {
  const { pending, slots } = partitionOpenStakesByPeriod(schedule, stakes, nowMs)
  const currentPoolDenom = Math.max(currentMonthPoolTotal, OPEN_GOVERNANCE_MIN_POOL_NOON)

  const pendingViews = buildPendingStakeViews(pending, currentMonthRewards, currentPoolDenom)
  const yourSlots = buildOpenStakingSlotViews(
    schedule,
    slots,
    currentMonthIndex,
    currentMonthPoolTotal,
    totalOpenStakedOverall,
  )

  const slotsPositionToken = sumOpenStakingSlotPosition(yourSlots)
  const pendingPrincipalToken = sumPendingStakePrincipal(pendingViews)
  const pendingRewardsToken = sumPendingStakeRewards(pendingViews)
  const currentPositionsToken = slotsPositionToken + pendingPrincipalToken
  const rewardsAvailableToken = pendingRewardsToken
  const openStakingMaxToken = currentPositionsToken + rewardsAvailableToken

  return {
    yourSlots,
    pendingViews,
    hasPendingStakeRequest: pendingViews.length > 0,
    slotsPositionToken,
    pendingPrincipalToken,
    pendingRewardsToken,
    currentPositionsToken,
    rewardsAvailableToken,
    openStakingMaxToken,
  }
}

export function sumConfiguredPriorMonthlyOpenStaked(
  schedule: readonly OpenGovernanceMonthConfig[],
  currentMonthIndex: number,
): number {
  if (currentMonthIndex <= 0) return 0
  const endExclusive = Math.min(currentMonthIndex, schedule.length)
  let sum = 0
  for (let i = 0; i < endExclusive; i++) {
    sum += toNum(bnToStr(toBn(schedule[i]!.totalOpenStakedWei), 18))
  }
  return sum
}

export function rewardsForProgramMonth(
  schedule: readonly OpenGovernanceMonthConfig[],
  monthIndex: number,
) {
  if (schedule.length === 0) return 0
  if (monthIndex < 0) return Math.max(0, schedule[0]!.noonMonthlyRewards)
  const idx = Math.min(monthIndex, schedule.length - 1)
  return Math.max(0, schedule[idx]!.noonMonthlyRewards)
}

function poolTotalOpenStakedForMonth(
  schedule: readonly OpenGovernanceMonthConfig[],
  stakeMonthIndex: number,
  currentMonthIndex: number,
  currentMonthPoolTotal: number,
  totalOpenStakedOverall: number,
): number {
  if (schedule.length === 0) {
    return Math.max(currentMonthPoolTotal, OPEN_GOVERNANCE_MIN_POOL_NOON)
  }
  const idx =
    stakeMonthIndex < 0
      ? 0
      : stakeMonthIndex >= schedule.length
        ? schedule.length - 1
        : Math.min(Math.max(0, stakeMonthIndex), schedule.length - 1)
  const configured = toNum(bnToStr(toBn(schedule[idx]!.totalOpenStakedWei), 18))
  if (configured > OPEN_GOVERNANCE_MIN_POOL_NOON) {
    return configured
  }

  const isCurrentOrVirtualPeriod =
    stakeMonthIndex === currentMonthIndex || stakeMonthIndex >= schedule.length
  if (isCurrentOrVirtualPeriod) {
    return Math.max(currentMonthPoolTotal, OPEN_GOVERNANCE_MIN_POOL_NOON)
  }

  if (import.meta.env.DEV) {
    console.warn(
      `Open governance: missing totalOpenStakedWei for ${schedule[idx]?.date}; using live overall pool as fallback`,
    )
  }
  return Math.max(totalOpenStakedOverall, OPEN_GOVERNANCE_MIN_POOL_NOON)
}

export function deriveOpenStakingMonthContext(
  schedule: readonly OpenGovernanceMonthConfig[],
  totalOpenStakedOverall: number,
  nowMs: number = Date.now(),
) {
  const currentMonthIndex = openGovernanceMonthIndexFromDate(schedule, nowMs)
  const currentMonthRewards = rewardsForProgramMonth(schedule, currentMonthIndex)
  const priorSum = sumConfiguredPriorMonthlyOpenStaked(schedule, currentMonthIndex)
  const currentMonthPoolTotal = Math.max(0, totalOpenStakedOverall - priorSum)

  return {
    nowMs,
    currentMonthIndex,
    currentMonthRewards,
    currentMonthPoolTotal,
  }
}
