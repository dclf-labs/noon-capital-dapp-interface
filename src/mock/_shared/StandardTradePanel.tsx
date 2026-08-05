import { type ReactNode, useId, useRef, useState } from 'react'

import { NumericFormat } from 'react-number-format'

import type { Token } from '@/config/token'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
  isTradePayInputAllowed,
  toTradePayAmount,
  TRADE_PAY_DECIMALS,
} from '@/features/_shared'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { cn } from '@/lib/utils'
import { PrimaryCtaButton } from '@/mock/_shared/PrimaryCtaButton'
import {
  FOCUS_RESET,
  PANEL_INNER,
  PANEL_OUTER,
  preventMouseDownFocus,
} from '@/mock/_shared/ui-classes'
import { UnitRateRow } from '@/mock/_shared/UnitRateRow'
import { usePayAmountDraft } from '@/mock/_shared/use-pay-amount-draft'
import { buyTokenAmountFromUsd } from '@/mock/buy/buy-amount'
import { BUY_USD_PRESETS } from '@/mock/buy/constants'
import { NetworkFeeHover } from '@/mock/buy/NetworkFeeHover'
import { TokenDropdown } from '@/mock/buy/TokenDropdown'
import { useFitAmountFontSize } from '@/mock/buy/use-fit-amount-font-size'

export type StandardTradePanelProps = {
  payLabel?: string
  receiveLabel?: string
  /**
   * Short label on the secondary (quoted) row — Buy uses “With”.
   * Defaults from `receiveLabel` by stripping a leading “You're ”.
   */
  secondaryLabel?: string
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
  /** Pay-side notional in USD (used to highlight / infer unit price). */
  amountInUsd?: number
  /** USD price of 1 pay token — same role as Buy’s `buyTokenUsdPrice`. */
  payTokenUsdPrice?: number
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
  /** @deprecated Prefer USD presets — kept optional for legacy call sites. */
  onHalf?: () => void
  /** @deprecated Prefer USD presets — kept optional for legacy call sites. */
  onMax?: () => void
  onPrimary: () => void
}

/** Resolve $/token for USD presets (explicit price → inferred from notional → 1). */
function resolvePayTokenUsdPrice(
  payTokenUsdPrice: number | undefined,
  amountIn: number | undefined,
  amountInUsd: number | undefined,
): number {
  if (payTokenUsdPrice != null && payTokenUsdPrice > 0) return payTokenUsdPrice
  if (amountIn != null && amountIn > 0 && amountInUsd != null && amountInUsd > 0) {
    return amountInUsd / amountIn
  }
  return 1
}

/** Keep last positive receive quote visible while a refetch is in flight. */
function useStickyReceiveAmount(amount: number | undefined, isLoading: boolean) {
  const [sticky, setSticky] = useState<number | undefined>(amount)

  if (amount != null && amount > 0 && amount !== sticky) {
    setSticky(amount)
  } else if (!isLoading && (amount == null || !(amount > 0)) && sticky !== undefined) {
    setSticky(undefined)
  }

  if (amount != null && amount > 0) return amount
  if (isLoading) return sticky
  return undefined
}

function shortSecondaryLabel(receiveLabel: string): string {
  const stripped = receiveLabel.replace(/^you'?re\s+/i, '').trim()
  if (!stripped) return 'Receiving'
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

function StaticTokenChip({ token, size = 'sm' }: { token?: Token; size?: 'lg' | 'sm' }) {
  const chainSrc = tokenChainIconSrc(token)
  const isLg = size === 'lg'
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-stone-100',
        isLg ? 'py-1.5 pr-3 pl-1.5' : 'py-1.5 pr-2 pl-1.5',
      )}
    >
      <span className={cn('relative shrink-0', isLg ? 'size-8' : 'size-6')}>
        <span
          className={cn(
            'block overflow-hidden bg-stone-200',
            isLg ? 'size-8 rounded-full' : 'size-6 rounded-[4px]',
          )}
        >
          {token ? (
            <img
              src={tokenIconSrc(token)}
              alt=""
              width={isLg ? 32 : 24}
              height={isLg ? 32 : 24}
              className="size-full object-cover"
              draggable={false}
            />
          ) : null}
        </span>
        {chainSrc ? (
          <span
            className={cn(
              'absolute overflow-hidden rounded-[2px] border border-white bg-white',
              isLg ? '-right-0.5 -bottom-0.5 size-3' : 'right-[-3px] bottom-[-2px] size-3',
            )}
          >
            <img
              src={chainSrc}
              alt=""
              width={12}
              height={12}
              className="size-full object-cover"
              draggable={false}
            />
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          'font-medium text-stone-900',
          isLg ? 'text-base leading-6' : 'text-sm leading-5',
        )}
      >
        {token?.symbol ?? '—'}
      </span>
    </div>
  )
}

/**
 * Form step (step 0) — same composition as home Buy:
 * hero editable pay amount + $100/$300/$1000, secondary quoted receive row, rate/fee, CTA.
 */
export function StandardTradePanel({
  payLabel = "You're sending",
  receiveLabel = "You're receiving",
  secondaryLabel,
  tokenIn,
  tokenOut,
  tokensIn,
  tokensOut,
  onTokenInChange,
  onTokenOutChange,
  amountIn,
  amountOut,
  amountInUsd,
  payTokenUsdPrice,
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
  onPrimary,
}: StandardTradePanelProps) {
  const payAmountId = useId()
  const amountBoxRef = useRef<HTMLDivElement>(null)
  const amountInValue = toTradePayAmount(amountIn)
  const stickyReceive = useStickyReceiveAmount(toTradePayAmount(amountOut), isFetchingQuote)
  const counterpartyLabel = secondaryLabel ?? shortSecondaryLabel(receiveLabel)
  const usdPrice = resolvePayTokenUsdPrice(payTokenUsdPrice, amountInValue, amountInUsd)

  const amountDraft = usePayAmountDraft({ onAmountChange: onAmountInChange })

  // Clear local draft when the parent resets the pay amount (network / success reset).
  const [trackedAmountIn, setTrackedAmountIn] = useState(amountIn)
  if (amountIn !== trackedAmountIn) {
    setTrackedAmountIn(amountIn)
    if (amountIn == null) amountDraft.clearDraft()
  }

  const applyUsdPreset = (usd: number) => {
    if (presetsDisabled) return
    amountDraft.clearDraft()
    onAmountInChange(buyTokenAmountFromUsd(usd, usdPrice))
  }

  const selectedPresetUsd = BUY_USD_PRESETS.find((usd) => {
    const presetPay = buyTokenAmountFromUsd(usd, usdPrice)
    return amountInValue != null && presetPay != null && Math.abs(amountInValue - presetPay) < 1e-9
  })

  const displayValue = amountDraft.displayValue(amountInValue)
  const fitText =
    typeof displayValue === 'string' ? displayValue : formatTradePayDisplay(displayValue)
  const amountFontSize = useFitAmountFontSize(fitText, amountBoxRef)
  const hasPayAmount = amountInValue != null && amountInValue > 0
  const receiveDisplay = stickyReceive != null ? formatTradeReceiveDisplay(stickyReceive) : ''

  const payTokenControl =
    onTokenInChange && tokensIn ? (
      <TokenDropdown
        token={tokenIn}
        tokens={tokensIn}
        onChange={(token) => {
          amountDraft.clearDraft()
          onAmountInChange(undefined)
          onTokenInChange(token)
        }}
        size="lg"
        label={`Select pay token${tokenIn ? `, currently ${tokenIn.symbol}` : ''}`}
      />
    ) : (
      <StaticTokenChip token={tokenIn} size="lg" />
    )

  const receiveTokenControl =
    onTokenOutChange && tokensOut ? (
      <TokenDropdown
        token={tokenOut}
        tokens={tokensOut}
        onChange={onTokenOutChange}
        size="sm"
        label={`Select receive token${tokenOut ? `, currently ${tokenOut.symbol}` : ''}`}
      />
    ) : (
      <StaticTokenChip token={tokenOut} size="sm" />
    )

  return (
    <div className={PANEL_OUTER}>
      <div className={PANEL_INNER}>
        <div className="relative flex min-h-60 w-full flex-col items-center justify-center gap-2">
          <p className="absolute top-2.5 left-0 text-sm leading-5 font-book text-stone-500">
            {payLabel}
          </p>

          <div className="flex items-start gap-1.5">
            {BUY_USD_PRESETS.map((preset) => {
              const selected = selectedPresetUsd === preset
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={presetsDisabled}
                  onMouseDown={preventMouseDownFocus}
                  onClick={() => applyUsdPreset(preset)}
                  className={cn(
                    'rounded-full border border-stone-200 px-1.5 py-1 text-sm leading-5 font-book text-stone-500',
                    'transition-colors hover:text-primary',
                    'focus:border-stone-200 focus-visible:border-stone-200 active:border-stone-200',
                    FOCUS_RESET,
                    selected && 'text-primary',
                    presetsDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  ${preset}
                </button>
              )
            })}
          </div>

          <label className="sr-only" htmlFor={payAmountId}>
            {tokenIn ? `${tokenIn.symbol} amount` : 'Pay token amount'}
          </label>
          <div ref={amountBoxRef} className="flex min-h-14 w-full items-center justify-center">
            <NumericFormat
              id={payAmountId}
              inputMode="decimal"
              decimalScale={TRADE_PAY_DECIMALS}
              thousandSeparator
              allowNegative={false}
              allowedDecimalSeparators={['.']}
              placeholder="0"
              value={displayValue}
              onFocus={amountDraft.onFocus}
              onBlur={amountDraft.onBlur}
              onValueChange={amountDraft.onValueChange}
              isAllowed={isTradePayInputAllowed}
              style={{ fontSize: amountFontSize }}
              className={cn(
                'buy-amount-input w-full max-w-none bg-transparent text-center font-suisse leading-none font-book tabular-nums',
                FOCUS_RESET,
                hasPayAmount || amountDraft.hasActiveDraft ? 'text-stone-900' : 'text-stone-500',
              )}
            />
          </div>

          {payTokenControl}

          <p className="text-base leading-6 font-medium text-stone-500">{balanceInLabel}</p>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-lg px-3">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-start justify-center gap-2 rounded-2xl border border-stone-200 p-2">
              <span className="shrink-0 text-sm leading-5 font-book text-stone-500">
                {counterpartyLabel}
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-base leading-6 font-medium text-stone-600 tabular-nums',
                      isFetchingQuote && hasPayAmount && 'animate-pulse',
                    )}
                  >
                    {receiveDisplay}
                  </span>
                  {receiveTokenControl}
                </div>
                <p className="w-full text-right text-base leading-6 font-medium text-stone-500">
                  {balanceOutLabel}
                </p>
              </div>
            </div>

            {notice || statusMessage ? (
              <div className="flex w-full flex-col gap-2">
                {notice}
                {statusMessage ? (
                  <p className="text-sm leading-5 font-book text-stone-500">{statusMessage}</p>
                ) : null}
              </div>
            ) : null}

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
          </div>

          <PrimaryCtaButton disabled={primaryDisabled} loading={primaryLoading} onClick={onPrimary}>
            {primaryLabel}
          </PrimaryCtaButton>
        </div>
      </div>
    </div>
  )
}
