import { useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { DEFAULT_BRIDGE_FEE_LABEL } from '@/mock/bridge/constants'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

const PROTOCOL_FEE_LABEL = '$0'

/** Fast ease — matches shell / transition-panel springs without bounce. */
const COLLAPSE_EASE = [0.22, 1, 0.36, 1] as const
const COLLAPSE_DURATION = 0.18

type FeeLineProps = {
  label: string
  value: string
  muted?: boolean
}

function FeeLine({ label, value, muted = false }: FeeLineProps) {
  return (
    <div className="flex w-full items-center gap-1">
      <span
        className={cn(
          'min-w-0 flex-1 text-sm leading-5 font-book',
          muted ? 'text-stone-400' : 'text-stone-500',
        )}
      >
        {label}
      </span>
      <p
        className={cn(
          'text-base leading-6 font-semibold tabular-nums',
          muted ? 'text-stone-400' : 'text-stone-600',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export type BridgingFeesCollapsibleProps = {
  /** Total bridging fees (protocol + network + gas). */
  totalLabel?: string
  /** Always `$0` for Noon bridge routes. */
  protocolFeeLabel?: string
  /** Source-chain submit gas, in USD. */
  networkFeeLabel?: string
  /** Destination / bridge quote (LZ/Hyperlane), in USD. */
  gasFeeLabel?: string
  isLoading?: boolean
}

/**
 * Bridging fees row — collapsed total with chevron; expands to protocol / network / gas.
 * Figma: Noon-Capital-v2 `4819:60448` (collapsed) → `4819:60722` (expanded).
 */
export function BridgingFeesCollapsible({
  totalLabel = DEFAULT_BRIDGE_FEE_LABEL,
  protocolFeeLabel = PROTOCOL_FEE_LABEL,
  networkFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  gasFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
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
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className={cn('flex w-full items-center gap-1 text-left', focusReset)}
      >
        <img
          src="/assets/buy/gas-pump.svg"
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0"
        />
        <span className="text-sm leading-5 font-book text-stone-500">Bridging fees</span>
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
              <FeeLine label="Protocol fee" value={protocolFeeLabel} muted />
              <FeeLine label="Network fee" value={networkFeeLabel} />
              <FeeLine label="Gas fee" value={gasFeeLabel} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
