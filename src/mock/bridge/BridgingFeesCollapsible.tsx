import { useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { InfoTipIcon } from '@/components/ui/info-tip-icon'
import { ResponsiveTip } from '@/components/ui/responsive-tip'
import { cn } from '@/lib/utils'
import { FOCUS_RESET, preventMouseDownFocus } from '@/mock/_shared'
import {
  BRIDGE_FEE_TIP,
  BRIDGE_NETWORK_FEE_TIP,
  DEFAULT_BRIDGE_FEE_LABEL,
  PROTOCOL_FEE_TIP,
} from '@/mock/bridge/constants'

const PROTOCOL_FEE_LABEL = '$0'

/** Fast ease — matches shell / transition-panel springs without bounce. */
const COLLAPSE_EASE = [0.22, 1, 0.36, 1] as const
const COLLAPSE_DURATION = 0.18

type FeeLineProps = {
  label: string
  value: string
  /** Explains the fee line (info icon next to the label). */
  infoTip: string
  infoTipLabel: string
  /** Native-unit tip on the USD value (buy-page network fee pattern). */
  tipLabel?: string
  tipAriaLabel: string
}

function FeeLine({ label, value, infoTip, infoTipLabel, tipLabel, tipAriaLabel }: FeeLineProps) {
  const canShowTip = Boolean(tipLabel && tipLabel !== '—' && value !== '—')

  return (
    <div className="flex w-full items-center gap-1">
      <span className="text-sm leading-5 font-book text-stone-500">{label}</span>
      <InfoTipIcon content={infoTip} label={infoTipLabel} size={12} />
      {canShowTip ? (
        <ResponsiveTip
          label={tipAriaLabel}
          content={<span className="font-medium whitespace-nowrap tabular-nums">{tipLabel}</span>}
          side="top"
          align="end"
          triggerClassName="ml-auto"
        >
          <span className="text-right text-base leading-6 font-semibold text-stone-600 tabular-nums">
            {value}
          </span>
        </ResponsiveTip>
      ) : (
        <p className="ml-auto text-base leading-6 font-semibold text-stone-600 tabular-nums">
          {value}
        </p>
      )}
    </div>
  )
}

export type BridgingFeesCollapsibleProps = {
  /** Total bridging fees (bridge + network + protocol). */
  totalLabel?: string
  /** Always `$0` for Noon bridge routes. */
  protocolFeeLabel?: string
  protocolFeeNativeLabel?: string
  /** Source-chain submit gas, in USD. */
  networkFeeLabel?: string
  networkFeeNativeLabel?: string
  /** Cross-chain delivery quote (LZ/Hyperlane), in USD — Bridge fee row. */
  gasFeeLabel?: string
  gasFeeNativeLabel?: string
  isLoading?: boolean
}

/**
 * Bridging fees row — collapsed total with chevron; expands to bridge / network / protocol.
 * Breakdown labels use `InfoTipIcon` (stone → primary on hover); Total fees has no info tip.
 * Breakdown USD values tip the native amount (buy-page network fee pattern).
 */
export function BridgingFeesCollapsible({
  totalLabel = DEFAULT_BRIDGE_FEE_LABEL,
  protocolFeeLabel = PROTOCOL_FEE_LABEL,
  protocolFeeNativeLabel,
  networkFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  networkFeeNativeLabel,
  gasFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  gasFeeNativeLabel,
  isLoading = false,
}: BridgingFeesCollapsibleProps) {
  const [open, setOpen] = useState(false)
  const showPulse = isLoading && totalLabel === DEFAULT_BRIDGE_FEE_LABEL

  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Bridging fees details"
        onMouseDown={preventMouseDownFocus}
        onClick={() => setOpen((prev) => !prev)}
        className={cn('flex w-full items-center gap-1 text-left', FOCUS_RESET)}
      >
        <img
          src="/assets/buy/gas-pump.svg"
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0"
        />
        <span className="text-sm leading-5 font-book text-stone-500">Total fees</span>
        <motion.img
          src="/assets/shell/chevron-down.svg"
          alt=""
          width={16}
          height={16}
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: COLLAPSE_DURATION, ease: COLLAPSE_EASE }}
          className="size-4 shrink-0"
        />
        {showPulse ? (
          <span
            aria-label="Estimating bridge fee"
            className="ml-auto inline-block h-6 w-14 animate-pulse rounded-md bg-stone-200"
          />
        ) : (
          <p
            className={cn(
              'ml-auto text-base leading-6 font-semibold text-stone-600 tabular-nums',
              isLoading && 'animate-pulse',
            )}
          >
            {totalLabel}
          </p>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="bridging-fee-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: COLLAPSE_DURATION, ease: COLLAPSE_EASE },
              opacity: { duration: COLLAPSE_DURATION * 0.85, ease: COLLAPSE_EASE },
            }}
            className="overflow-hidden"
          >
            <div className="flex w-full flex-col gap-2 pt-2 pl-6">
              <FeeLine
                label="Bridge fee"
                value={gasFeeLabel}
                infoTip={BRIDGE_FEE_TIP}
                infoTipLabel="About bridge fee"
                tipLabel={gasFeeNativeLabel}
                tipAriaLabel="Bridge fee details"
              />
              <FeeLine
                label="Network fee"
                value={networkFeeLabel}
                infoTip={BRIDGE_NETWORK_FEE_TIP}
                infoTipLabel="About network fee"
                tipLabel={networkFeeNativeLabel}
                tipAriaLabel="Network fee details"
              />
              <FeeLine
                label="Protocol fee"
                value={protocolFeeLabel}
                infoTip={PROTOCOL_FEE_TIP}
                infoTipLabel="About protocol fee"
                tipLabel={protocolFeeNativeLabel}
                tipAriaLabel="Protocol fee details"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
