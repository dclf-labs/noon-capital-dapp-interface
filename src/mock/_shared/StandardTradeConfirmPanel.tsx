import type { ReactNode } from 'react'

import type { Token } from '@/config/token'
import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { PanelChrome } from '@/mock/_shared/PanelChrome'
import { PrimaryCtaButton } from '@/mock/_shared/PrimaryCtaButton'
import { StepPanelHeader } from '@/mock/_shared/StepPanelHeader'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'

function TokenAmountColumn({
  label,
  amount,
  token,
}: {
  label: string
  amount: string
  token?: Token
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <p className="text-base leading-6 font-medium text-stone-500">{label}</p>
      <div className="flex w-full flex-col items-center gap-1.5">
        <p className="max-w-full truncate font-denton text-[40px] leading-none text-stone-900 tabular-nums md:text-[56px]">
          {amount}
        </p>
        <TokenSymbolMark
          symbol={token?.symbol}
          iconSrc={tokenIconSrc(token)}
          chainIconSrc={tokenChainIconSrc(token)}
          size="sm"
        />
      </div>
    </div>
  )
}

export type StandardTradeConfirmPanelProps = {
  title: string
  payColumnLabel?: string
  receiveColumnLabel?: string
  amountIn?: number
  amountOut?: number
  tokenIn?: Token
  tokenOut?: Token
  /** Optional status callout (e.g. unstake cooling-off) — same slot as bridge confirm. */
  notice?: ReactNode
  feeRow?: ReactNode
  primaryLabel?: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  onPrimary: () => void
  onBack?: () => void
}

/** Shared confirm step — matches buy/bridge Figma confirm layout. */
export function StandardTradeConfirmPanel({
  title,
  payColumnLabel = 'Sending',
  receiveColumnLabel = 'To receive',
  amountIn,
  amountOut,
  tokenIn,
  tokenOut,
  notice,
  feeRow,
  primaryLabel = 'Confirm the transaction',
  primaryDisabled = false,
  primaryLoading = false,
  onPrimary,
  onBack,
}: StandardTradeConfirmPanelProps) {
  return (
    <PanelChrome>
      <StepPanelHeader title={title} onBack={onBack} />

      <div className="flex min-h-60 w-full flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-col items-center gap-2 px-2 md:flex-row md:gap-0 md:px-1">
          <TokenAmountColumn
            label={payColumnLabel}
            amount={formatConfirmAmount(amountIn, 6)}
            token={tokenIn}
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
            label={receiveColumnLabel}
            amount={formatConfirmAmount(amountOut, 6)}
            token={tokenOut}
          />
        </div>
      </div>

      {notice ? <div className="px-3">{notice}</div> : null}

      <div className="flex w-full flex-col gap-4 px-3">
        {feeRow ? <div className="flex w-full flex-col gap-2">{feeRow}</div> : null}
        <PrimaryCtaButton disabled={primaryDisabled} loading={primaryLoading} onClick={onPrimary}>
          {primaryLabel}
        </PrimaryCtaButton>
      </div>
    </PanelChrome>
  )
}
