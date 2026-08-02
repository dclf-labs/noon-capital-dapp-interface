import { useState } from 'react'

import { NumericFormat } from 'react-number-format'

import type { Token } from '@/config/token'
import { formatTokenAmount, formatUsd } from '@/features/_shared/trade-display'
import {
  parseTradePayInput,
  toTradePayAmount,
  toTradeReceiveStoredAmount,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'
import type { TradeMode } from '@/features/_shared/trade-primary'
import { down } from '@/lib/format'
import * as styles from '@/pages/swap/trade-styles'

export type TradePanelViewProps = {
  mode: TradeMode
  step: number
  isConnected: boolean
  unsupported?: boolean
  tokenIn?: Token
  tokenOut?: Token
  tokensIn?: Token[]
  tokensOut?: Token[]
  amountIn?: number
  amountOut?: number
  amountInUsd: number
  balanceInLabel?: string
  balanceOutLabel?: string
  unitRateLabel?: string
  feeLabel?: string
  isFetchingQuote: boolean
  isInsufficientBalance: boolean
  isApproved: boolean
  primaryLabel: string
  primaryDisabled: boolean
  primaryLoading?: boolean
  statusMessage?: string
  txnUrl?: string
  onAmountInChange: (amount: number | undefined) => void
  onHalf: () => void
  onMax: () => void
  onTokenInChange: (token: Token) => void
  onTokenOutChange: (token: Token) => void
  onPrimary: () => void
  onBack?: () => void
  onReset?: () => void
  presetsDisabled?: boolean
}

function tokenOptionKey(token: Token): string {
  return `${token.contractAddress}:${token.symbol}`
}

export function TradePanelView({
  mode,
  step,
  isConnected,
  unsupported,
  tokenIn,
  tokenOut,
  tokensIn,
  tokensOut,
  amountIn,
  amountOut,
  amountInUsd,
  balanceInLabel,
  balanceOutLabel,
  unitRateLabel,
  feeLabel,
  isFetchingQuote,
  isInsufficientBalance,
  isApproved,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  statusMessage,
  txnUrl,
  onAmountInChange,
  onHalf,
  onMax,
  onTokenInChange,
  onTokenOutChange,
  onPrimary,
  onBack,
  onReset,
  presetsDisabled,
}: TradePanelViewProps) {
  const title = mode === 'buy' ? 'Buy' : 'Sell'
  const amountOutValue = toTradeReceiveStoredAmount(amountOut)
  const amountInValue = toTradePayAmount(amountIn)

  const [payFocused, setPayFocused] = useState(false)
  const [payDraft, setPayDraft] = useState<string | undefined>(undefined)

  const clearPayDraft = () => {
    setPayFocused(false)
    setPayDraft(undefined)
  }

  if (!isConnected) {
    return <p style={styles.muted}>Connect a wallet on Home to {title.toLowerCase()}.</p>
  }

  if (unsupported) {
    return (
      <p style={styles.errorText}>
        Wallet network does not match the selected network. Use the network switcher above and
        approve the wallet prompt.
      </p>
    )
  }

  if (step >= 2) {
    return (
      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Transaction submitted</h2>
        {txnUrl ? (
          <a href={txnUrl} target="_blank" rel="noreferrer noopener" style={styles.link}>
            View on explorer
          </a>
        ) : (
          <p style={styles.muted}>Waiting for explorer link…</p>
        )}
        <button type="button" style={styles.button} onClick={onReset}>
          {title} more
        </button>
      </section>
    )
  }

  if (step === 1) {
    return (
      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Confirm {title.toLowerCase()}</h2>
        <p style={styles.muted}>
          {formatTokenAmount(amountInValue, tokenIn?.symbol, TRADE_PAY_DECIMALS)} →{' '}
          {formatTokenAmount(amountOutValue, tokenOut?.symbol, TRADE_RECEIVE_DISPLAY_DECIMALS)}
        </p>
        {feeLabel ? <p style={styles.muted}>Network fee {feeLabel}</p> : null}
        <p style={styles.muted}>
          {/* Display approx of submit `slippageAdjustedAmount(..., 1)` — not the signed bigint. */}
          Min received (1% slippage){' '}
          {formatTokenAmount(
            amountOutValue != null
              ? toTradeReceiveStoredAmount(down(amountOutValue * 0.99, TRADE_PAY_DECIMALS))
              : undefined,
            tokenOut?.symbol,
            TRADE_RECEIVE_DISPLAY_DECIMALS,
          )}
        </p>
        {statusMessage ? <p style={styles.muted}>{statusMessage}</p> : null}
        <div style={styles.row}>
          {onBack ? (
            <button type="button" style={styles.buttonSecondary} onClick={onBack}>
              Back
            </button>
          ) : null}
          <button
            type="button"
            style={primaryDisabled || primaryLoading ? styles.buttonDisabled : styles.button}
            disabled={primaryDisabled || primaryLoading}
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>
        </div>
      </section>
    )
  }

  const receiveDisplayValue =
    amountOutValue != null ? down(amountOutValue, TRADE_RECEIVE_DISPLAY_DECIMALS) : ''
  const receivePlaceholder = isFetchingQuote && amountOutValue == null ? '…' : '0.00'

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div style={styles.field}>
        <div style={styles.row}>
          <strong>You pay</strong>
          <span style={styles.muted}>{balanceInLabel}</span>
        </div>
        <div style={styles.row}>
          <NumericFormat
            style={styles.input}
            inputMode="decimal"
            placeholder="0.00"
            decimalScale={TRADE_PAY_DECIMALS}
            thousandSeparator
            allowNegative={false}
            value={payFocused && payDraft !== undefined ? payDraft : (amountInValue ?? '')}
            onFocus={() => setPayFocused(true)}
            onBlur={() => {
              setPayFocused(false)
              setPayDraft(undefined)
            }}
            onValueChange={(values) => {
              if (payFocused) setPayDraft(values.value)
              const parsed = parseTradePayInput(values)
              if (parsed.kind === 'draft') return
              if (parsed.kind === 'clear') {
                onAmountInChange(undefined)
                return
              }
              onAmountInChange(parsed.amount)
            }}
            isAllowed={(values) => {
              const parts = values.value.split('.')
              return !parts[1] || parts[1].length <= TRADE_PAY_DECIMALS
            }}
          />
          <select
            style={styles.select}
            value={tokenIn ? tokenOptionKey(tokenIn) : ''}
            onChange={(event) => {
              const next = tokensIn?.find((token) => tokenOptionKey(token) === event.target.value)
              if (next) onTokenInChange(next)
            }}
          >
            {(tokensIn || []).map((token) => (
              <option key={tokenOptionKey(token)} value={tokenOptionKey(token)}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.row}>
          <span style={styles.muted}>{formatUsd(amountInUsd)}</span>
          <button
            type="button"
            style={presetsDisabled ? styles.buttonDisabled : styles.buttonSecondary}
            disabled={presetsDisabled}
            onClick={(event) => {
              event.preventDefault()
              if (presetsDisabled) return
              clearPayDraft()
              onHalf()
            }}
          >
            Half
          </button>
          <button
            type="button"
            style={presetsDisabled ? styles.buttonDisabled : styles.buttonSecondary}
            disabled={presetsDisabled}
            onClick={(event) => {
              event.preventDefault()
              if (presetsDisabled) return
              clearPayDraft()
              onMax()
            }}
          >
            Max
          </button>
        </div>
      </div>

      <div style={styles.field}>
        <div style={styles.row}>
          <strong>You receive</strong>
          <span style={styles.muted}>{balanceOutLabel}</span>
        </div>
        <div style={styles.row}>
          <NumericFormat
            style={{ ...styles.input, opacity: 0.85 }}
            readOnly
            placeholder={receivePlaceholder}
            decimalScale={TRADE_RECEIVE_DISPLAY_DECIMALS}
            thousandSeparator
            allowNegative={false}
            value={receiveDisplayValue}
            // Field shows ≤2dp; title keeps full stored 6dp for hover/debug.
            title={amountOutValue != null ? String(amountOutValue) : undefined}
          />
          <select
            style={styles.select}
            value={tokenOut ? tokenOptionKey(tokenOut) : ''}
            onChange={(event) => {
              const next = tokensOut?.find((token) => tokenOptionKey(token) === event.target.value)
              if (next) onTokenOutChange(next)
            }}
          >
            {(tokensOut || []).map((token) => (
              <option key={tokenOptionKey(token)} value={tokenOptionKey(token)}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        {unitRateLabel ? <p style={styles.muted}>Rate {unitRateLabel}</p> : null}
        {feeLabel ? <p style={styles.muted}>Est. fee {feeLabel}</p> : null}
      </div>

      {isInsufficientBalance ? <p style={styles.errorText}>Insufficient balance</p> : null}
      {!isApproved && amountIn ? <p style={styles.muted}>Approval required before swap.</p> : null}
      {statusMessage ? <p style={styles.muted}>{statusMessage}</p> : null}

      <button
        type="button"
        style={primaryDisabled || primaryLoading ? styles.buttonDisabled : styles.button}
        disabled={primaryDisabled || primaryLoading}
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
    </section>
  )
}
