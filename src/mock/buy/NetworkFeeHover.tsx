import { GasPumpIcon, InfoIcon } from '@/assets/icons'
import { ResponsiveTip } from '@/components/ui/responsive-tip'
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
  const showValueLoading = isLoading && usdLabel === '—'

  return (
    <div className="flex w-full items-center gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <GasPumpIcon
          width={20}
          height={20}
          className="size-5 shrink-0 text-stone-400"
          aria-hidden
        />
        <span className="text-sm leading-5 font-book text-stone-500">Network fee (gas)</span>
        <ResponsiveTip
          label="About network fee"
          content={NETWORK_FEE_TIP}
          side="top"
          align="start"
          contentClassName="max-w-[240px] whitespace-normal"
        >
          <InfoIcon width={12} height={12} className="size-3 shrink-0 text-stone-400" aria-hidden />
        </ResponsiveTip>
      </div>

      {showValueLoading ? (
        <span
          aria-label="Estimating network fee"
          className="ml-auto inline-block h-6 w-14 animate-pulse rounded-md bg-stone-200"
        />
      ) : canShowNative ? (
        <ResponsiveTip
          label="Network fee details"
          content={
            <span className="font-medium whitespace-nowrap tabular-nums">{nativeLabel}</span>
          }
          side="top"
          align="end"
          triggerClassName="ml-auto"
        >
          <span className="text-right text-base leading-6 font-semibold text-stone-600">
            {usdLabel}
          </span>
        </ResponsiveTip>
      ) : (
        <p className="ml-auto text-right text-base leading-6 font-semibold text-stone-600">
          {usdLabel}
        </p>
      )}
    </div>
  )
}
