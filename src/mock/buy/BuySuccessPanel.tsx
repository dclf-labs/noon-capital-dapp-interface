import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { ExplorerActions, PanelChrome } from '@/mock/_shared'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'
import type { BuySuccessPanelProps } from '@/mock/buy/types'

/** Presentational buy success card — step 2 (Figma). */
export function BuySuccessPanel({ amountOut, tokenOut, txnUrl, onBuyMore }: BuySuccessPanelProps) {
  const receiveAmount = formatConfirmAmount(amountOut, 6)

  return (
    <PanelChrome>
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

        <h2 className="text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]">
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

      <ExplorerActions txnUrl={txnUrl} moreLabel="Buy More" onMore={onBuyMore} />
    </PanelChrome>
  )
}
