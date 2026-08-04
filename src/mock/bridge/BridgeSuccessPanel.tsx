import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { ExplorerActions, PanelChrome, SuccessCheckIcon } from '@/mock/_shared'
import { BRIDGE_SUCCESS_NOTE } from '@/mock/bridge/constants'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import type { BridgeSuccessPanelProps } from '@/mock/bridge/types'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'

/** Presentational bridge success card — step 2 (matches buy success Figma layout). */
export function BridgeSuccessPanel({
  amount,
  token,
  txnUrl,
  onBridgeMore,
}: BridgeSuccessPanelProps) {
  const displayAmount = formatConfirmAmount(amount, 6)

  return (
    <PanelChrome>
      <div className="flex min-h-60 w-full flex-col items-center justify-center">
        <div className="flex w-full flex-col items-center">
          <SuccessCheckIcon />

          <h2 className="m-0 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]">
            You have successfully bridged
          </h2>

          <TokenSymbolMark
            symbol={token?.symbol}
            iconSrc={tokenIconSrc(token)}
            chainIconSrc={tokenChainIconSrc(token)}
            size="lg"
            middle={displayAmount}
          />
        </div>
      </div>

      <div className="px-3">
        <StatusCallout type="neutral" title={BRIDGE_SUCCESS_NOTE} />
      </div>

      <ExplorerActions txnUrl={txnUrl} moreLabel="Bridge more" onMore={onBridgeMore} />
    </PanelChrome>
  )
}
