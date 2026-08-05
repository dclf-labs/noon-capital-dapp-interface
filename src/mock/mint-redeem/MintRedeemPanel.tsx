import { useState } from 'react'

import { NumericFormat } from 'react-number-format'

import type { Token } from '@/config/token'
import { formatTokenAmount, formatUsd } from '@/features/_shared/trade-display'
import {
  formatTradeReceiveDisplay,
  isTradePayInputAllowed,
  parseTradePayInput,
  toTradePayAmount,
  toTradeReceiveStoredAmount,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'
import type { MintRedeemMode } from '@/features/mint-redeem'
import { SafeExplorerLink } from '@/mock/_shared'
import { TokenDropdown } from '@/mock/buy/TokenDropdown'
import * as styles from '@/mock/mint-redeem/mint-redeem-styles'

export type MintRedeemPanelProps = {
  mode: MintRedeemMode
  step: number
  isConnected: boolean
  unsupported?: boolean
  tokenIn?: Token
  tokenOut?: Token
  /** Selectable tokens for the variable side (mint: collateral in; redeem: collateral out). */
  variableTokens?: Token[]
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
  isWhitelisted: boolean
  primaryLabel: string
  primaryDisabled: boolean
  primaryLoading?: boolean
  statusMessage?: string
  txnUrl?: string
  onAmountInChange: (amount: number | undefined) => void
  onHalf: () => void
  onMax: () => void
  onVariableTokenChange: (token: Token) => void
  onPrimary: () => void
  onBack?: () => void
  onReset?: () => void
  presetsDisabled?: boolean
}

export function MintRedeemPanel({
  mode,
  step,
  isConnected,
  unsupported,
  tokenIn,
  tokenOut,
  variableTokens,
  amountIn,
  amountOut,
  amountInUsd,
  balanceInLabel,
  balanceOutLabel,
  unitRateLabel,
  feeLabel,
  isFetchingQuote,
  isInsufficientBalance: _isInsufficientBalance,
  isApproved: _isApproved,
  isWhitelisted,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  statusMessage,
  txnUrl,
  onAmountInChange,
  onHalf,
  onMax,
  onVariableTokenChange,
  onPrimary,
  onBack,
  onReset,
  presetsDisabled,
}: MintRedeemPanelProps) {
  const title = mode === 'mint' ? 'Mint' : 'Redeem'
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
        <SafeExplorerLink
          href={txnUrl}
          style={styles.link}
          fallback={<p style={styles.muted}>Waiting for explorer link…</p>}
        >
          View on explorer
        </SafeExplorerLink>
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
        {/* Off-chain price quote: minAmountOut === amountOut (no AMM haircut). */}
        <p style={styles.muted}>Slippage 0%</p>
        {statusMessage ? <p style={styles.muted}>{statusMessage}</p> : null}
        <div style={styles.row}>
          {onBack ? (
            <button type="button" style={styles.buttonSecondary} onClick={onBack}>
              Back
            </button>
          ) : null}
          <button
            type="button"
            className={primaryLoading ? 'animate-pulse' : undefined}
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

  const receiveDisplay = amountOutValue != null ? formatTradeReceiveDisplay(amountOutValue) : ''
  const isReceiveLoading = Boolean(isFetchingQuote)
  const variableToken = mode === 'mint' ? tokenIn : tokenOut
  const fixedToken = mode === 'mint' ? tokenOut : tokenIn

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      {!isWhitelisted ? (
        <p style={styles.banner}>
          This wallet is not whitelisted for direct {title.toLowerCase()}.
        </p>
      ) : null}

      <div style={styles.field}>
        <div style={styles.row}>
          <strong>Sending</strong>
          <span style={styles.muted}>{balanceInLabel}</span>
        </div>
        <div style={styles.row}>
          <NumericFormat
            style={styles.input}
            inputMode="decimal"
            placeholder="0"
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
            isAllowed={isTradePayInputAllowed}
          />
          {mode === 'mint' ? (
            <TokenDropdown
              token={variableToken}
              tokens={variableTokens}
              onChange={onVariableTokenChange}
              size="sm"
              label={`Select send token${variableToken ? `, currently ${variableToken.symbol}` : ''}`}
            />
          ) : (
            <input
              style={{ ...styles.select, opacity: 0.85 }}
              readOnly
              value={fixedToken?.symbol || 'USN'}
            />
          )}
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
            className={isReceiveLoading ? 'animate-pulse' : undefined}
            readOnly
            placeholder="0"
            decimalScale={TRADE_RECEIVE_DISPLAY_DECIMALS}
            thousandSeparator
            allowNegative={false}
            value={receiveDisplay}
            // Field shows ≤2dp; title keeps full stored 6dp for hover/debug.
            title={amountOutValue != null ? String(amountOutValue) : undefined}
          />
          {mode === 'redeem' ? (
            <TokenDropdown
              token={variableToken}
              tokens={variableTokens}
              onChange={onVariableTokenChange}
              size="sm"
              label={`Select receive token${variableToken ? `, currently ${variableToken.symbol}` : ''}`}
            />
          ) : (
            <input
              style={{ ...styles.select, opacity: 0.85 }}
              readOnly
              value={fixedToken?.symbol || 'USN'}
            />
          )}
        </div>
        {unitRateLabel ? <p style={styles.muted}>Rate {unitRateLabel}</p> : null}
        {feeLabel ? <p style={styles.muted}>Est. fee {feeLabel}</p> : null}
        {/* Off-chain price quote: minAmountOut === amountOut (no AMM haircut). */}
        <p style={styles.muted}>Slippage 0%</p>
      </div>

      {statusMessage ? <p style={styles.muted}>{statusMessage}</p> : null}

      <button
        type="button"
        className={primaryLoading ? 'animate-pulse' : undefined}
        style={primaryDisabled || primaryLoading ? styles.buttonDisabled : styles.button}
        disabled={primaryDisabled || primaryLoading}
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
    </section>
  )
}
