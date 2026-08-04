import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { ExplorerActions, PanelChrome, SuccessCheckIcon } from '@/mock/_shared'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'
import type { BuySuccessPanelProps } from '@/mock/buy/types'

/** Presentational buy success card — step 2 (Figma 4819:60239). */
export function BuySuccessPanel({ amountOut, tokenOut, txnUrl, onBuyMore }: BuySuccessPanelProps) {
  const receiveAmount = formatConfirmAmount(amountOut, 6)

  return (
    <PanelChrome>
      <div className="flex min-h-60 w-full flex-col items-center justify-center">
        <div className="flex w-full flex-col items-center">
          <SuccessCheckIcon />

          <h2 className="m-0 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]">
            You have successfully bought
          </h2>

          <TokenSymbolMark
            symbol={tokenOut?.symbol}
            iconSrc={tokenIconSrc(tokenOut)}
            chainIconSrc={tokenChainIconSrc(tokenOut)}
            size="lg"
            middle={receiveAmount}
          />
        </div>
      </div>

      <ExplorerActions txnUrl={txnUrl} moreLabel="Buy More" onMore={onBuyMore} />
    </PanelChrome>
  )
}
