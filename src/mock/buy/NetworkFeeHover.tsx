import { GasPumpIcon } from '@/assets/icons'
import { InfoTipIcon } from '@/components/ui/info-tip-icon'
import { ResponsiveTip } from '@/components/ui/responsive-tip'
import { cn } from '@/lib/utils'
import { NETWORK_FEE_TIP } from '@/mock/buy/constants'

type NetworkFeeHoverProps = {
  usdLabel: string
  nativeLabel?: string
  isLoading?: boolean
}

/** Network fee row — info tip on the label; native fee tip only on the USD value. */
export function NetworkFeeHover({
  usdLabel,
  nativeLabel,
  isLoading = false,
}: NetworkFeeHoverProps) {
  const canShowNative = Boolean(nativeLabel && nativeLabel !== '—' && usdLabel !== '—')
  const valueClassName = cn(
    'text-right text-base leading-6 font-semibold text-stone-600 tabular-nums',
    isLoading && 'animate-pulse',
  )

  return (
    <div className="flex w-full items-center gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <GasPumpIcon
          width={20}
          height={20}
          className="size-5 shrink-0 text-stone-400"
          aria-hidden
        />
        <span className="text-sm leading-5 font-book text-stone-500">Network fee</span>
        <InfoTipIcon content={NETWORK_FEE_TIP} label="About network fee" size={12} />
      </div>

      {canShowNative ? (
        <ResponsiveTip
          label="Network fee details"
          content={
            <span className="font-medium whitespace-nowrap tabular-nums">{nativeLabel}</span>
          }
          side="top"
          align="end"
          triggerClassName="ml-auto"
        >
          <span className={valueClassName}>{usdLabel}</span>
        </ResponsiveTip>
      ) : (
        <p className={cn('ml-auto', valueClassName)}>{usdLabel}</p>
      )}
    </div>
  )
}
