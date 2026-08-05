import { type ReactNode, useState } from 'react'

import { NumericFormat } from 'react-number-format'

import {
  formatTradeReceiveDisplay,
  isTradePayInputAllowed,
  toTradePayAmount,
  TRADE_PAY_DECIMALS,
} from '@/features/_shared'
import { formatUsd } from '@/features/_shared/trade-display'
import { cn } from '@/lib/utils'
import { HalfMaxButtons } from '@/mock/_shared/HalfMaxButtons'
import { FOCUS_RESET } from '@/mock/_shared/ui-classes'
import { usePayAmountDraft } from '@/mock/_shared/use-pay-amount-draft'

/** Keep showing the last receive amount while a quote refetch is in flight. */
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

type TradeAmountCardProps = {
  label: string
  /** Editable pay field when set; omit for read-only receive. */
  editable?: boolean
  amount?: number
  amountUsd?: number
  balanceLabel?: string
  trailing?: ReactNode
  headerTrailing?: ReactNode
  presetsDisabled?: boolean
  isReceiveLoading?: boolean
  inputId?: string
  onAmountChange?: (amount: number | undefined) => void
  onHalf?: () => void
  onMax?: () => void
}

/**
 * Bridge-inspired send/receive amount card — shared by stake, mint, sell, bridge.
 * Pay side: draft-aware NumericFormat + Half/Max. Receive side: truncated read-only.
 */
export function TradeAmountCard({
  label,
  editable = false,
  amount,
  amountUsd,
  balanceLabel,
  trailing,
  headerTrailing,
  presetsDisabled = false,
  isReceiveLoading = false,
  inputId,
  onAmountChange,
  onHalf,
  onMax,
}: TradeAmountCardProps) {
  const amountValue = toTradePayAmount(amount)
  const payDraft = usePayAmountDraft({
    onAmountChange: onAmountChange ?? (() => undefined),
  })
  const hasAmount = amountValue != null && amountValue > 0
  const displayPay = payDraft.displayValue(amountValue ?? '')
  const stickyReceive = useStickyReceiveAmount(amountValue, isReceiveLoading)
  const displayReceive = stickyReceive != null ? formatTradeReceiveDisplay(stickyReceive) : ''

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex w-full items-center gap-2">
        <p className="min-w-0 flex-1 text-sm leading-5 font-book text-stone-500 uppercase">
          {label}
        </p>
        {headerTrailing}
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {editable ? (
            <>
              <label className="sr-only" htmlFor={inputId}>
                {label}
              </label>
              <NumericFormat
                id={inputId}
                inputMode="decimal"
                decimalScale={TRADE_PAY_DECIMALS}
                thousandSeparator
                allowNegative={false}
                allowedDecimalSeparators={['.']}
                placeholder="0"
                value={displayPay}
                onFocus={payDraft.onFocus}
                onBlur={payDraft.onBlur}
                onValueChange={payDraft.onValueChange}
                isAllowed={isTradePayInputAllowed}
                className={cn(
                  'w-full bg-transparent text-left font-suisse text-2xl leading-8 font-medium tabular-nums',
                  FOCUS_RESET,
                  hasAmount || payDraft.hasActiveDraft ? 'text-stone-900' : 'text-stone-600',
                )}
              />
              {amountUsd != null ? (
                <p className="text-sm leading-5 font-book text-stone-500 tabular-nums">
                  {formatUsd(amountUsd)}
                </p>
              ) : null}
            </>
          ) : (
            <input
              id={inputId}
              readOnly
              placeholder="0"
              value={displayReceive}
              className={cn(
                'w-full bg-transparent text-left font-suisse text-2xl leading-8 font-medium text-stone-600 tabular-nums',
                FOCUS_RESET,
                isReceiveLoading && 'animate-pulse',
              )}
            />
          )}
        </div>
        {trailing}
      </div>

      {editable && (balanceLabel != null || onHalf || onMax) ? (
        <>
          <div className="h-px w-full bg-stone-200" />
          <div className="flex w-full items-center gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-stone-600">{balanceLabel}</p>
            {onHalf && onMax ? (
              <HalfMaxButtons
                disabled={presetsDisabled}
                onHalf={() => {
                  payDraft.clearDraft()
                  onHalf()
                }}
                onMax={() => {
                  payDraft.clearDraft()
                  onMax()
                }}
              />
            ) : null}
          </div>
        </>
      ) : null}

      {!editable && balanceLabel ? (
        <>
          <div className="h-px w-full bg-stone-200" />
          <p className="text-sm leading-5 text-stone-600">{balanceLabel}</p>
        </>
      ) : null}
    </div>
  )
}
