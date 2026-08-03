import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { safeExternalHref } from '@/lib/safe-external-href'
import { tokenIconSrc } from '@/lib/token-icon'
import { cn } from '@/lib/utils'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'
import type { BuySuccessPanelProps } from '@/mock/buy/types'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

/** Presentational buy success card — step 2 (Figma). */
export function BuySuccessPanel({ amountOut, tokenOut, txnUrl, onBuyMore }: BuySuccessPanelProps) {
  const receiveAmount = formatConfirmAmount(amountOut, 6)
  const explorerHref = safeExternalHref(txnUrl)

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
      <div className="flex w-full flex-col gap-4 overflow-hidden border border-stone-200 bg-white px-2 pt-2 pb-6 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
        <div className="flex min-h-60 w-full flex-col items-center justify-center gap-1 px-2">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#d1fae5]">
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
            size="lg"
            middle={receiveAmount}
          />
        </div>

        <div className="flex w-full flex-col gap-3 px-3 sm:flex-row sm:gap-4">
          {explorerHref ? (
            <a
              href={explorerHref}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                'flex flex-1 items-center justify-center rounded-lg bg-stone-100 px-4 py-3',
                'text-base leading-6 font-medium whitespace-nowrap text-stone-900',
                'transition-opacity hover:opacity-90',
                focusReset,
              )}
            >
              View Explorer
            </a>
          ) : (
            <button
              type="button"
              disabled
              className={cn(
                'flex flex-1 cursor-not-allowed items-center justify-center rounded-lg bg-stone-100 px-4 py-3',
                'text-base leading-6 font-medium whitespace-nowrap text-stone-400',
                focusReset,
              )}
            >
              View Explorer
            </button>
          )}

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onBuyMore}
            className={cn(
              'flex flex-1 items-center justify-center rounded-lg bg-[#6c77e9] px-4 py-3',
              'text-base leading-6 font-medium whitespace-nowrap text-stone-50',
              'transition-opacity hover:opacity-90',
              focusReset,
            )}
          >
            Buy More
          </button>
        </div>
      </div>
    </div>
  )
}
