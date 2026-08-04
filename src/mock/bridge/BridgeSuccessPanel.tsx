import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { ExplorerActions, PanelChrome, StepPanelHeader } from '@/mock/_shared'
import { BRIDGE_SUCCESS_NOTE } from '@/mock/bridge/constants'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import type { BridgeSuccessPanelProps } from '@/mock/bridge/types'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'

/** Presentational bridge success card — step 2. */
export function BridgeSuccessPanel({
  amount,
  token,
  txnUrl,
  onBridgeMore,
}: BridgeSuccessPanelProps) {
  const displayAmount = formatConfirmAmount(amount, 6)

  return (
    <PanelChrome>
      <StepPanelHeader title="You have successfully bridged" />

      <div className="flex min-h-60 w-full flex-col items-center justify-center gap-1 px-2">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-success-soft">
          <img
            src="/assets/buy/check-circle.svg"
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
        </div>

        <TokenSymbolMark
          symbol={token?.symbol}
          iconSrc={tokenIconSrc(token)}
          chainIconSrc={tokenChainIconSrc(token)}
          size="lg"
          middle={displayAmount}
        />
      </div>

      <div className="px-3">
        <StatusCallout type="neutral" title={BRIDGE_SUCCESS_NOTE} />
      </div>

      <ExplorerActions txnUrl={txnUrl} moreLabel="Bridge more" onMore={onBridgeMore} />
    </PanelChrome>
  )
}
