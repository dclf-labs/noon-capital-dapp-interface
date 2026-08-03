import { useId, useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { GasPumpIcon } from '@/assets/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/ui/useIsMobile'
import { cn } from '@/lib/utils'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

type NetworkFeeHoverProps = {
  usdLabel: string
  nativeLabel?: string
  isLoading?: boolean
}

function FeeRowContent({ usdLabel, isLoading }: { usdLabel: string; isLoading: boolean }) {
  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <GasPumpIcon
          width={20}
          height={20}
          className="size-5 shrink-0 text-stone-400"
          aria-hidden
        />
        <span className="text-sm leading-5 font-book text-stone-500">Network fee (gas)</span>
      </div>

      {isLoading && usdLabel === '—' ? (
        <span
          aria-label="Estimating network fee"
          className="inline-block h-6 w-14 animate-pulse rounded-md bg-stone-200"
        />
      ) : (
        <p className="min-w-0 flex-1 text-right text-base leading-6 font-semibold text-stone-600">
          {usdLabel}
        </p>
      )}
    </>
  )
}

/** Network fee row — desktop hover card; mobile shadcn Popover. */
export function NetworkFeeHover({
  usdLabel,
  nativeLabel,
  isLoading = false,
}: NetworkFeeHoverProps) {
  const tooltipId = useId()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const canShow = Boolean(nativeLabel && nativeLabel !== '—' && usdLabel !== '—')

  if (isMobile) {
    if (!canShow) {
      return (
        <div className="relative flex w-full items-center gap-6">
          <FeeRowContent usdLabel={usdLabel} isLoading={isLoading} />
        </div>
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative flex w-full cursor-help items-center gap-6 text-left',
              'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
            )}
            aria-label="Network fee details"
          >
            <FeeRowContent usdLabel={usdLabel} isLoading={isLoading} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-auto max-w-[min(100vw-2rem,240px)]">
          <p className="text-sm leading-5 font-medium whitespace-nowrap text-stone-700 tabular-nums">
            {nativeLabel}
          </p>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div
      className={cn('relative flex w-full items-center gap-6', canShow && 'cursor-help')}
      onMouseEnter={() => {
        if (canShow) setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        if (canShow) setOpen(true)
      }}
      onBlur={() => setOpen(false)}
      tabIndex={canShow ? 0 : undefined}
      aria-describedby={open && canShow ? tooltipId : undefined}
    >
      <FeeRowContent usdLabel={usdLabel} isLoading={isLoading} />

      <AnimatePresence>
        {open && canShow ? (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 4, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: 2, clipPath: 'inset(100% 0 0 0)' }}
            transition={{ duration: 0.2, ease: PANEL_EASE }}
            className={cn(
              'pointer-events-none absolute right-0 bottom-full z-20 mb-1.5',
              'rounded-lg border border-[#d4d1cf] bg-white px-2.5 py-1.5',
              'shadow-[0_12px_40px_rgba(17,17,17,0.08)]',
            )}
          >
            <p className="text-sm leading-5 font-medium whitespace-nowrap text-stone-700 tabular-nums">
              {nativeLabel}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
