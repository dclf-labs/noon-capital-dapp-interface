import { memo } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import type { Token } from '@/config/token'
import {
  formatCountdownClock,
  formatWithdrawAmountDisplay,
  formatWithdrawRequestTimestamp,
  getWithdrawClaimLabel,
  getWithdrawUnlockAt,
  isWithdrawRequestClaimable,
  shouldShowWithdrawCountdown,
  type WithdrawRequestView,
} from '@/features/stake-unstake'
import { TxnStatus } from '@/lib/connection'
import { tokenIconSrc } from '@/lib/token-icon'
import { cn } from '@/lib/utils'
import { PrimaryCtaButton, SafeExplorerLink, secondaryCtaClassName } from '@/mock/_shared'

/** Shared decelerate curve for CTA crossfade + digit rolls. */
const MOTION_EASE = [0.22, 1, 0.36, 1] as const
const DIGIT_ROLL_EASE = [0.16, 1, 0.3, 1] as const
const DIGIT_ROLL_S = 0.42
const CTA_CROSSFADE_S = 0.28

type WithdrawRequestCardProps = {
  request: WithdrawRequestView
  token?: Token
  periodMs: number
  nowMs: number
  claimStatus?: TxnStatus
  failed: boolean
  claimLocked: boolean
  txnUrl?: string
  onClaim: (requestId: number) => void
}

type BadgeKind = 'claimed' | 'failed' | 'pending'

const STATUS_BADGE: Record<BadgeKind, { label: string; className: string }> = {
  claimed: {
    label: 'Successful',
    className: 'bg-emerald-100 text-emerald-800',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700',
  },
  pending: {
    label: 'In process',
    className: 'bg-amber-100 text-amber-800',
  },
}

function StatusBadge({ kind }: { kind: BadgeKind }) {
  const badge = STATUS_BADGE[kind]
  return (
    <span
      className={cn(
        'inline-flex w-fit rounded-md px-2 py-0.5 text-xs leading-4 font-medium tracking-[0.04em] uppercase',
        badge.className,
      )}
    >
      {badge.label}
    </span>
  )
}

/**
 * Single digit slot — odometer roll (out upward / in from below).
 * Fixed clip + absolute layers keep neighbors from shifting.
 */
function RollingDigit({ digit, reduceMotion }: { digit: string; reduceMotion: boolean }) {
  const glyph = digit.length === 1 ? digit : '0'

  if (reduceMotion) {
    return <span className="inline-block w-[1ch] text-center">{glyph}</span>
  }

  return (
    <span className="relative inline-block h-[30px] w-[1ch] overflow-hidden align-bottom">
      <AnimatePresence initial={false}>
        <motion.span
          key={glyph}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: '70%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-70%', opacity: 0 }}
          transition={{ duration: DIGIT_ROLL_S, ease: DIGIT_ROLL_EASE }}
        >
          {glyph}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Padded unit (e.g. `06`) — each glyph rolls independently. */
function CountdownUnit({ value, reduceMotion }: { value: string; reduceMotion: boolean }) {
  return (
    <span className="inline-flex">
      {Array.from(value).map((digit, index) => (
        <RollingDigit key={index} digit={digit} reduceMotion={reduceMotion} />
      ))}
    </span>
  )
}

function WithdrawCountdown({
  countdown,
  reduceMotion,
}: {
  countdown: string
  reduceMotion: boolean
}) {
  const [dd = '00', hh = '00', mm = '00', ss = '00'] = countdown.split(':')
  return (
    <p
      className="flex items-center justify-end font-denton text-[30px] leading-none tracking-[-0.02em] text-stone-900 tabular-nums"
      aria-label={`Countdown ${countdown}`}
    >
      <CountdownUnit value={dd} reduceMotion={reduceMotion} />
      <span className="mx-px inline-block">:</span>
      <CountdownUnit value={hh} reduceMotion={reduceMotion} />
      <span className="mx-px inline-block">:</span>
      <CountdownUnit value={mm} reduceMotion={reduceMotion} />
      <span className="mx-px inline-block">:</span>
      <CountdownUnit value={ss} reduceMotion={reduceMotion} />
    </p>
  )
}

/**
 * Single unstake withdrawal request:
 * status · amount · UTC time · live countdown · claim / explorer CTA.
 */
export const WithdrawRequestCard = memo(function WithdrawRequestCard({
  request,
  token,
  periodMs,
  nowMs,
  claimStatus,
  failed,
  claimLocked,
  txnUrl,
  onClaim,
}: WithdrawRequestCardProps) {
  const preferReducedMotion = useReducedMotion()
  const reduceMotion = Boolean(preferReducedMotion)

  const claimable = isWithdrawRequestClaimable(request, periodMs, nowMs)
  const unlockAt = getWithdrawUnlockAt(request.timestamp, periodMs)
  const isBusy =
    claimStatus === TxnStatus.PROCESSING || claimStatus === TxnStatus.TXN_SUBMITTED_ON_CHAIN

  const label = getWithdrawClaimLabel({
    claimed: request.claimed,
    claimable,
    failed,
    status: claimStatus,
  })
  const disabled = request.claimed || !claimable || isBusy || claimLocked

  const amountLabel = formatWithdrawAmountDisplay(request.amount, token?.symbol || 'USN')
  const countdown = formatCountdownClock(unlockAt, nowMs)
  const showCountdown = shouldShowWithdrawCountdown({
    claimed: request.claimed,
    claimable,
    countdown,
  })

  const badgeKind: BadgeKind = request.claimed
    ? 'claimed'
    : failed && !request.claimed
      ? 'failed'
      : 'pending'

  const ctaMotion = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 }, exit: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
      }

  return (
    <article className="flex w-full flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <StatusBadge kind={badgeKind} />

          <p className="text-lg leading-6 font-medium whitespace-nowrap text-stone-900 tabular-nums">
            <span className="mr-1.5 inline-block size-6 overflow-hidden rounded-md bg-stone-200 align-middle">
              <img
                src={tokenIconSrc(token)}
                alt=""
                width={24}
                height={24}
                className="block size-full object-cover"
                draggable={false}
              />
            </span>
            <span className="inline-block align-middle">{amountLabel}</span>
          </p>

          <p className="text-sm leading-5 font-book text-stone-400">
            {formatWithdrawRequestTimestamp(request.timestamp)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 text-right">
          {showCountdown ? (
            <WithdrawCountdown countdown={countdown} reduceMotion={reduceMotion} />
          ) : null}
          <p className="text-sm leading-5 font-book text-stone-500">UNSTAKE #{request.requestId}</p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {txnUrl ? (
          <motion.div
            key="explorer"
            className="w-full"
            initial={ctaMotion.initial}
            animate={ctaMotion.animate}
            exit={ctaMotion.exit}
            transition={{ duration: reduceMotion ? 0 : CTA_CROSSFADE_S, ease: MOTION_EASE }}
          >
            <SafeExplorerLink href={txnUrl} className={secondaryCtaClassName({ fullWidth: true })}>
              View Explorer
            </SafeExplorerLink>
          </motion.div>
        ) : (
          <motion.div
            key="claim"
            className="w-full"
            initial={ctaMotion.initial}
            animate={ctaMotion.animate}
            exit={ctaMotion.exit}
            transition={{ duration: reduceMotion ? 0 : CTA_CROSSFADE_S, ease: MOTION_EASE }}
          >
            <PrimaryCtaButton
              disabled={disabled}
              loading={isBusy}
              aria-label={`${label} request ${request.requestId}`}
              onClick={() => onClaim(request.requestId)}
            >
              {label}
            </PrimaryCtaButton>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
})
