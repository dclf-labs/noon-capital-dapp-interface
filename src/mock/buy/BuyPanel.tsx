import { useId, useRef, useState } from 'react'

import { NumericFormat } from 'react-number-format'

import {
  formatTradePayDisplay,
  parseTradePayInput,
  toTradePayAmount,
  TRADE_PAY_DECIMALS,
} from '@/features/_shared'
import { cn } from '@/lib/utils'
import { buyTokenAmountFromUsd } from '@/mock/buy/buy-amount'
import { BUY_USD_PRESETS, DEFAULT_NETWORK_FEE_LABEL } from '@/mock/buy/constants'
import { NetworkFeeHover } from '@/mock/buy/NetworkFeeHover'
import { TokenDropdown } from '@/mock/buy/TokenDropdown'
import type { BuyPageViewProps } from '@/mock/buy/types'
import { useFitAmountFontSize } from '@/mock/buy/use-fit-amount-font-size'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

/** Presentational buy card — step 0 (Figma). Fully controlled by the live trade adapter. */
export function BuyPanel({
  amountIn,
  buyTokenUsdPrice,
  tokenIn,
  tokenOut,
  tokensIn,
  tokensOut,
  balanceInLabel = 'Bal: —',
  networkFeeLabel = DEFAULT_NETWORK_FEE_LABEL,
  networkFeeNativeLabel,
  primaryLabel = 'Enter amount',
  primaryDisabled = true,
  primaryLoading = false,
  presetsDisabled = false,
  isFetchingQuote = false,
  isLoadingFee = false,
  onBuyAmountChange,
  onUsdPreset,
  onTokenInChange,
  onTokenOutChange,
  onPrimary,
}: Omit<BuyPageViewProps, 'poweredBy'>) {
  const buyAmountId = useId()
  const amountBoxRef = useRef<HTMLDivElement>(null)

  const amountInValue = toTradePayAmount(amountIn)

  /**
   * Center field is the buy-token amount (tokenOut). Kept locally so quote sync of
   * `amountOut` cannot fight the user's typed value.
   */
  const [buyAmount, setBuyAmount] = useState<number | undefined>(undefined)
  const [amountFocused, setAmountFocused] = useState(false)
  const [amountDraft, setAmountDraft] = useState<string | undefined>(undefined)

  // Session/network reset clears provider amounts — mirror that in the local buy field.
  const [trackedAmountIn, setTrackedAmountIn] = useState(amountIn)
  if (amountIn !== trackedAmountIn) {
    setTrackedAmountIn(amountIn)
    if (amountIn == null) {
      setBuyAmount(undefined)
      setAmountDraft(undefined)
      setAmountFocused(false)
    }
  }

  const clearAmountDraft = () => {
    setAmountFocused(false)
    setAmountDraft(undefined)
  }

  const applyPreset = (usd: number) => {
    if (presetsDisabled) return
    clearAmountDraft()
    if (onUsdPreset) {
      onUsdPreset(usd)
      const next = buyTokenAmountFromUsd(usd, buyTokenUsdPrice)
      setBuyAmount(next)
      return
    }
    const next = buyTokenAmountFromUsd(usd, buyTokenUsdPrice)
    setBuyAmount(next)
    onBuyAmountChange?.(next)
  }

  const onAmountValueChange = (values: { floatValue?: number; value: string }) => {
    if (amountFocused) setAmountDraft(values.value)
    const parsed = parseTradePayInput(values)
    if (parsed.kind === 'draft') return
    if (parsed.kind === 'clear') {
      setBuyAmount(undefined)
      onBuyAmountChange?.(undefined)
      return
    }
    setBuyAmount(parsed.amount)
    onBuyAmountChange?.(parsed.amount)
  }

  const displayValue = amountFocused && amountDraft !== undefined ? amountDraft : (buyAmount ?? 0)
  const fitText =
    typeof displayValue === 'string'
      ? displayValue || '0'
      : formatTradePayDisplay(displayValue) || '0'
  const amountFontSize = useFitAmountFontSize(fitText, amountBoxRef)

  const selectedPresetUsd = BUY_USD_PRESETS.find((usd) => {
    const presetBuy = buyTokenAmountFromUsd(usd, buyTokenUsdPrice)
    return buyAmount != null && presetBuy != null && Math.abs(buyAmount - presetBuy) < 1e-9
  })

  const hasBuyAmount = buyAmount != null && buyAmount > 0

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
        <div className="flex w-full flex-col gap-4 overflow-hidden border border-stone-200 bg-white px-2 pt-2 pb-6 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
          <div className="relative flex min-h-60 w-full flex-col items-center justify-center gap-2">
            <p className="absolute top-2.5 left-0 text-sm leading-5 font-book text-stone-500">
              You&apos;re Buying
            </p>

            <div className="flex items-start gap-1.5">
              {BUY_USD_PRESETS.map((preset) => {
                const selected = selectedPresetUsd === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={presetsDisabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'rounded-full border border-stone-200 px-1.5 py-1 text-sm leading-5 font-book text-stone-500',
                      'transition-colors hover:text-primary',
                      'focus:border-stone-200 focus-visible:border-stone-200 active:border-stone-200',
                      focusReset,
                      selected && 'text-primary',
                      presetsDisabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    ${preset}
                  </button>
                )
              })}
            </div>

            <label className="sr-only" htmlFor={buyAmountId}>
              {tokenOut ? `${tokenOut.symbol} amount` : 'Buy token amount'}
            </label>
            <div ref={amountBoxRef} className="flex min-h-14 w-full items-center justify-center">
              <NumericFormat
                id={buyAmountId}
                inputMode="decimal"
                decimalScale={TRADE_PAY_DECIMALS}
                thousandSeparator
                allowNegative={false}
                allowedDecimalSeparators={['.']}
                value={displayValue}
                onFocus={() => {
                  setAmountFocused(true)
                }}
                onBlur={() => {
                  setAmountFocused(false)
                  setAmountDraft(undefined)
                }}
                onValueChange={onAmountValueChange}
                isAllowed={(values) => {
                  const parts = values.value.split('.')
                  if (parts[0] && parts[0].length > 18) return false
                  return !parts[1] || parts[1].length <= TRADE_PAY_DECIMALS
                }}
                style={{ fontSize: amountFontSize }}
                className={cn(
                  'buy-amount-input w-full max-w-none bg-transparent text-center leading-none font-book tabular-nums',
                  focusReset,
                  hasBuyAmount || (amountFocused && amountDraft && amountDraft !== '0')
                    ? 'text-stone-900'
                    : 'text-stone-500',
                )}
              />
            </div>

            <TokenDropdown
              token={tokenOut}
              tokens={tokensOut}
              onChange={(token) => {
                setBuyAmount(undefined)
                clearAmountDraft()
                onBuyAmountChange?.(undefined)
                onTokenOutChange?.(token)
              }}
              size="lg"
              label={`Select buy token${tokenOut ? `, currently ${tokenOut.symbol}` : ''}`}
            />
          </div>

          <div className="flex w-full flex-col gap-4 rounded-lg px-3">
            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full items-start justify-center gap-2 rounded-2xl border border-stone-200 p-2">
                <span className="shrink-0 text-sm leading-5 font-book text-stone-500">With</span>
                <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        'text-base leading-6 font-medium text-stone-600 tabular-nums',
                        isFetchingQuote && hasBuyAmount && 'animate-pulse',
                      )}
                    >
                      {amountInValue != null ? formatTradePayDisplay(amountInValue) : '0'}
                    </span>
                    <TokenDropdown
                      token={tokenIn}
                      tokens={tokensIn}
                      onChange={onTokenInChange}
                      size="sm"
                      label={`Select pay token${tokenIn ? `, currently ${tokenIn.symbol}` : ''}`}
                    />
                  </div>
                  <p className="w-full text-right text-base leading-6 font-medium text-stone-500">
                    {balanceInLabel}
                  </p>
                </div>
              </div>

              <NetworkFeeHover
                usdLabel={networkFeeLabel}
                nativeLabel={networkFeeNativeLabel}
                isLoading={isLoadingFee}
              />
            </div>

            <button
              type="button"
              disabled={primaryDisabled || primaryLoading}
              onMouseDown={(event) => event.preventDefault()}
              onClick={onPrimary}
              className={cn(
                // Match `ConnectWalletButton` primary CTA (Figma indigo).
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
    </>
  )
}
