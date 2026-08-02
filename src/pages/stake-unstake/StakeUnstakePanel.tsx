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
import type { StakeUnstakeMode } from '@/features/stake-unstake'
import { down } from '@/lib/format'
import * as styles from '@/pages/stake-unstake/stake-unstake-styles'

export type StakeUnstakePanelProps = {
  mode: StakeUnstakeMode
  step: number
  isConnected: boolean
  unsupported?: boolean
  tokenIn?: Token
  tokenOut?: Token
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
  requiresApproval: boolean
  primaryLabel: string
  primaryDisabled: boolean
  primaryLoading?: boolean
  statusMessage?: string
  txnUrl?: string
  onAmountInChange: (amount: number | undefined) => void
  onHalf: () => void
  onMax: () => void
  onPrimary: () => void
  onBack?: () => void
  onReset?: () => void
  presetsDisabled?: boolean
}

export function StakeUnstakePanel({
  mode,
  step,
  isConnected,
  unsupported,
  tokenIn,
  tokenOut,
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
  requiresApproval,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  statusMessage,
  txnUrl,
  onAmountInChange,
  onHalf,
  onMax,
  onPrimary,
  onBack,
  onReset,
  presetsDisabled,
}: StakeUnstakePanelProps) {
  const title = mode === 'stake' ? 'Stake' : 'Unstake'
  const amountInValue = toTradePayAmount(amountIn)
  const amountOutValue = toTradeReceiveStoredAmount(amountOut)

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
        {title} is only available on Ethereum mainnet. Switch your wallet to Ethereum.
      </p>
    )
  }

  if (step >= 2) {
    return (
      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title} submitted</h2>
        {mode === 'unstake' ? (
          <p style={styles.muted}>
            Your USN is in cooldown. Claim it from the Withdraw tab after the cooling-off period.
          </p>
        ) : null}
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
        {mode === 'unstake' ? (
          <p style={styles.banner}>Unstake starts a cooldown. USN is claimable after it ends.</p>
        ) : null}
        {feeLabel ? <p style={styles.muted}>Network fee {feeLabel}</p> : null}
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

  const receiveDisplay =
    amountOutValue != null ? down(amountOutValue, TRADE_RECEIVE_DISPLAY_DECIMALS) : ''
  const receivePlaceholder = isFetchingQuote && amountOutValue == null ? '…' : '0.00'

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div style={styles.field}>
        <div style={styles.row}>
          <strong>Sending</strong>
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
          <input
            style={{ ...styles.select, opacity: 0.85 }}
            readOnly
            value={tokenIn?.symbol || (mode === 'stake' ? 'USN' : 'sUSN')}
          />
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
          <strong>Receiving</strong>
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
            value={receiveDisplay}
            title={amountOutValue != null ? String(amountOutValue) : undefined}
          />
          <input
            style={{ ...styles.select, opacity: 0.85 }}
            readOnly
            value={tokenOut?.symbol || (mode === 'stake' ? 'sUSN' : 'USN')}
          />
        </div>
        {unitRateLabel ? <p style={styles.muted}>Rate {unitRateLabel}</p> : null}
        {feeLabel ? <p style={styles.muted}>Est. fee {feeLabel}</p> : null}
      </div>

      {isInsufficientBalance ? <p style={styles.errorText}>Insufficient balance</p> : null}
      {requiresApproval && !isApproved && amountIn ? (
        <p style={styles.muted}>Approval required before stake.</p>
      ) : null}
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
