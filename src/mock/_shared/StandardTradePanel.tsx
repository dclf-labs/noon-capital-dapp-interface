import { type ReactNode, useId } from 'react'

import type { Token } from '@/config/token'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { cn } from '@/lib/utils'
import { PrimaryCtaButton } from '@/mock/_shared/PrimaryCtaButton'
import { TradeAmountCard } from '@/mock/_shared/TradeAmountCard'
import { BRIDGE_PANEL_SHELL } from '@/mock/_shared/ui-classes'
import { UnitRateRow } from '@/mock/_shared/UnitRateRow'
import { NetworkFeeHover } from '@/mock/buy/NetworkFeeHover'
import { TokenDropdown } from '@/mock/buy/TokenDropdown'

export type StandardTradePanelProps = {
  payLabel?: string
  receiveLabel?: string
  tokenIn?: Token
  tokenOut?: Token
  tokensIn?: Token[]
  tokensOut?: Token[]
  /** When set, pay-side token is selectable. */
  onTokenInChange?: (token: Token) => void
  /** When set, receive-side token is selectable. */
  onTokenOutChange?: (token: Token) => void
  amountIn?: number
  amountOut?: number
  amountInUsd?: number
  balanceInLabel?: string
  balanceOutLabel?: string
  /** Network fee USD label (single line — not a bridge fee breakdown). */
  feeLabel?: string
  /** Native gas tip on the network fee value (buy/bridge pattern). */
  feeNativeLabel?: string
  unitRateLabel?: string
  statusMessage?: string
  notice?: ReactNode
  isFetchingQuote?: boolean
  isLoadingFee?: boolean
  primaryLabel?: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  presetsDisabled?: boolean
  onAmountInChange: (amount: number | undefined) => void
  onHalf: () => void
  onMax: () => void
  onPrimary: () => void
}

function StaticTokenChip({ token }: { token?: Token }) {
  const chainSrc = tokenChainIconSrc(token)
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-stone-200 bg-white py-1.5 pr-2 pl-1.5 shadow-panel">
      <span className="relative size-6 shrink-0">
        <span className="block size-6 overflow-hidden rounded-[4px] bg-stone-200">
          {token ? (
            <img
              src={tokenIconSrc(token)}
              alt=""
              width={24}
              height={24}
              className="size-full object-cover"
            />
          ) : null}
        </span>
        {chainSrc ? (
          <span className="absolute right-[-3px] bottom-[-2px] size-3 overflow-hidden rounded-[2px] border border-white bg-white">
            <img src={chainSrc} alt="" width={12} height={12} className="size-full object-cover" />
          </span>
        ) : null}
      </span>
      <span className="text-sm leading-5 font-medium text-stone-900">{token?.symbol ?? '—'}</span>
    </div>
  )
}

/**
 * Figma step-0 trade card (bridge shell) — pay + receive amount rows, rate /
 * network-fee meta (bridge-style), and primary CTA.
 */
export function StandardTradePanel({
  payLabel = "You're sending",
  receiveLabel = "You're receiving",
  tokenIn,
  tokenOut,
  tokensIn,
  tokensOut,
  onTokenInChange,
  onTokenOutChange,
  amountIn,
  amountOut,
  amountInUsd,
  balanceInLabel = 'Bal: —',
  balanceOutLabel = 'Bal: —',
  feeLabel = '—',
  feeNativeLabel,
  unitRateLabel,
  statusMessage,
  notice,
  isFetchingQuote = false,
  isLoadingFee = false,
  primaryLabel = 'Enter amount',
  primaryDisabled = true,
  primaryLoading = false,
  presetsDisabled = false,
  onAmountInChange,
  onHalf,
  onMax,
  onPrimary,
}: StandardTradePanelProps) {
  const payId = useId()
  const receiveId = useId()

  const payTrailing =
    onTokenInChange && tokensIn ? (
      <TokenDropdown
        token={tokenIn}
        tokens={tokensIn}
        onChange={onTokenInChange}
        size="sm"
        variant="outlined"
        label={`Select send token${tokenIn ? `, currently ${tokenIn.symbol}` : ''}`}
      />
    ) : (
      <StaticTokenChip token={tokenIn} />
    )

  const receiveTrailing =
    onTokenOutChange && tokensOut ? (
      <TokenDropdown
        token={tokenOut}
        tokens={tokensOut}
        onChange={onTokenOutChange}
        size="sm"
        variant="outlined"
        label={`Select receive token${tokenOut ? `, currently ${tokenOut.symbol}` : ''}`}
      />
    ) : (
      <StaticTokenChip token={tokenOut} />
    )

  return (
    <div className={BRIDGE_PANEL_SHELL}>
      <div className="relative flex w-full flex-col gap-1 p-2">
        <TradeAmountCard
          label={payLabel}
          editable
          inputId={payId}
          amount={amountIn}
          amountUsd={amountInUsd}
          balanceLabel={balanceInLabel}
          trailing={payTrailing}
          presetsDisabled={presetsDisabled}
          onAmountChange={onAmountInChange}
          onHalf={onHalf}
          onMax={onMax}
        />

        <TradeAmountCard
          label={receiveLabel}
          inputId={receiveId}
          amount={amountOut}
          balanceLabel={balanceOutLabel}
          trailing={receiveTrailing}
          isReceiveLoading={isFetchingQuote}
        />
      </div>

      {notice || statusMessage ? (
        <div className="flex w-full flex-col gap-2 px-4 pt-2">
          {notice}
          {statusMessage ? (
            <p className={cn('text-sm leading-5 font-book text-stone-500')}>{statusMessage}</p>
          ) : null}
        </div>
      ) : null}

      {/* Meta + CTA — same stack rhythm as bridge step-0 (fees / ETA → CTA). */}
      <div className="flex w-full flex-col gap-4 px-4 pt-2 pb-6">
        <div className="flex w-full flex-col gap-2">
          <UnitRateRow
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            rateLabel={unitRateLabel}
            isLoading={isFetchingQuote}
          />

          <NetworkFeeHover
            usdLabel={feeLabel || '—'}
            nativeLabel={feeNativeLabel}
            isLoading={isLoadingFee}
          />
        </div>

        <PrimaryCtaButton disabled={primaryDisabled} loading={primaryLoading} onClick={onPrimary}>
          {primaryLabel}
        </PrimaryCtaButton>
      </div>
    </div>
  )
}
