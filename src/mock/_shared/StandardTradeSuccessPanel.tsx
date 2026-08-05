import type { Token } from '@/config/token'
import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { ExplorerActions } from '@/mock/_shared/ExplorerActions'
import { PanelChrome } from '@/mock/_shared/PanelChrome'
import { SuccessCheckIcon } from '@/mock/_shared/SuccessCheckIcon'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'

export type StandardTradeSuccessPanelProps = {
  headline: string
  amountOut?: number
  tokenOut?: Token
  note?: string
  txnUrl?: string
  moreLabel: string
  onMore: () => void
}

/** Shared success step — animated check + explorer actions. */
export function StandardTradeSuccessPanel({
  headline,
  amountOut,
  tokenOut,
  note,
  txnUrl,
  moreLabel,
  onMore,
}: StandardTradeSuccessPanelProps) {
  return (
    <PanelChrome>
      <div className="flex min-h-60 w-full flex-col items-center justify-center">
        <div className="flex w-full flex-col items-center">
          <SuccessCheckIcon />
          <h2 className="m-0 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]">
            {headline}
          </h2>
          <TokenSymbolMark
            symbol={tokenOut?.symbol}
            iconSrc={tokenIconSrc(tokenOut)}
            chainIconSrc={tokenChainIconSrc(tokenOut)}
            size="lg"
            middle={formatConfirmAmount(amountOut, 6)}
          />
        </div>
      </div>

      {note ? (
        <p className="px-3 text-center text-sm leading-5 font-book text-stone-500">{note}</p>
      ) : null}

      <ExplorerActions txnUrl={txnUrl} moreLabel={moreLabel} onMore={onMore} />
    </PanelChrome>
  )
}
