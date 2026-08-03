import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { cn } from '@/lib/utils'
import { NetworkFeeHover } from '@/mock/buy/NetworkFeeHover'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'
import type { BuyConfirmPanelProps } from '@/mock/buy/types'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

function TokenAmountColumn({
  label,
  amount,
  tokenSymbol,
  tokenIcon,
  chainIcon,
}: {
  label: string
  amount: string
  tokenSymbol?: string
  tokenIcon: string
  chainIcon?: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <p className="text-base leading-6 font-medium text-stone-500">{label}</p>
      <div className="flex w-full flex-col items-center gap-1.5">
        <p className="max-w-full truncate font-denton text-[40px] leading-none text-stone-900 tabular-nums md:text-[56px]">
          {amount}
        </p>
        <TokenSymbolMark
          symbol={tokenSymbol}
          iconSrc={tokenIcon}
          chainIconSrc={chainIcon}
          size="sm"
        />
      </div>
    </div>
  )
}

/** Presentational buy confirm card — step 1 (Figma). */
export function BuyConfirmPanel({
  amountIn,
  amountOut,
  tokenIn,
  tokenOut,
  networkFeeLabel = '—',
  networkFeeNativeLabel,
  primaryLabel = 'Confirm the transaction',
  primaryDisabled = false,
  primaryLoading = false,
  isLoadingFee = false,
  onPrimary,
  onBack,
}: BuyConfirmPanelProps) {
  // Same compact / `<0.1` dust rules as other non-input amount labels.
  const payAmount = formatConfirmAmount(amountIn, 6)
  const receiveAmount = formatConfirmAmount(amountOut, 6)

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
      <div className="flex w-full flex-col gap-4 overflow-hidden border border-stone-200 bg-white px-2 pt-2 pb-6 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
        {onBack ? (
          <button
            type="button"
            aria-label="Back"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onBack}
            className={cn(
              'flex w-fit items-center rounded-md bg-stone-100 p-1.5',
              'transition-opacity hover:opacity-80',
              focusReset,
            )}
          >
            <img
              src="/assets/buy/arrow-back.svg"
              alt=""
              width={24}
              height={24}
              className="size-6"
            />
          </button>
        ) : null}

        <div className="flex min-h-60 w-full flex-col items-center justify-center gap-4">
          <h2 className="px-2 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]">
            Confirm your buy transaction
          </h2>

          {/* Desktop: left ↔ right. Mobile: top ↕ bottom. */}
          <div className="flex w-full flex-col items-center gap-2 px-2 md:flex-row md:gap-0 md:px-1">
            <TokenAmountColumn
              label="Swapping"
              amount={payAmount}
              tokenSymbol={tokenIn?.symbol}
              tokenIcon={tokenIconSrc(tokenIn)}
              chainIcon={tokenChainIconSrc(tokenIn)}
            />

            <div className="flex size-[34px] shrink-0 items-center justify-center" aria-hidden>
              <img
                src="/assets/buy/arrow-right.svg"
                alt=""
                width={25}
                height={19}
                className="h-[19px] w-[25px] -rotate-90 md:rotate-180"
              />
            </div>

            <TokenAmountColumn
              label="To Receive"
              amount={receiveAmount}
              tokenSymbol={tokenOut?.symbol}
              tokenIcon={tokenIconSrc(tokenOut)}
              chainIcon={tokenChainIconSrc(tokenOut)}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 px-3">
          <NetworkFeeHover
            usdLabel={networkFeeLabel}
            nativeLabel={networkFeeNativeLabel}
            isLoading={isLoadingFee}
          />

          <button
            type="button"
            disabled={primaryDisabled || primaryLoading}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onPrimary}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-3',
              'text-base leading-6 font-medium whitespace-nowrap',
              focusReset,
              primaryDisabled || primaryLoading
                ? 'cursor-not-allowed bg-[#e9e9e9] text-[#7b7b7b]'
                : 'bg-[#6c77e9] text-stone-50 transition-opacity hover:opacity-90',
              primaryLoading && 'animate-pulse',
            )}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
