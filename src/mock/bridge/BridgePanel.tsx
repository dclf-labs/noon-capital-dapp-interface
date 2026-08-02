import { useState } from 'react'

import { NumericFormat } from 'react-number-format'

import type { Token } from '@/config/token'
import { formatTokenAmount, formatUsd } from '@/features/_shared/trade-display'
import {
  parseTradePayInput,
  toTradePayAmount,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'
import { down } from '@/lib/format'
import * as styles from '@/mock/bridge/bridge-styles'

/**
 * Bridge form UI. Receive mirrors send 1:1 (OFT); pay uses `amount` (not amountIn/Out).
 * Confirm/LZ submit may still apply a 1% `minAmountLd` haircut under the hood.
 */

export type BridgeNetworkOption = {
  id: number
  name: string
}

export type BridgePanelProps = {
  step: number
  isConnected: boolean
  unsupported?: boolean
  sourceNetworks: BridgeNetworkOption[]
  destinationNetworks: BridgeNetworkOption[]
  sourceChainId?: number
  destinationChainId?: number
  onSourceChange: (chainId: number) => void
  onDestinationChange: (chainId: number | undefined) => void
  tokens?: Token[]
  token?: Token
  onTokenChange: (token: Token) => void
  amount?: number
  amountUsd: number
  balanceInLabel?: string
  balanceOutLabel?: string
  receiverLabel: string
  receiverValue: string
  receiverPlaceholder: string
  onReceiverChange: (value: string) => void
  feeLabel?: string
  gasLabel?: string
  protocolLabel?: string
  warning?: string
  isFetchingFee: boolean
  isInsufficientBalance: boolean
  primaryLabel: string
  primaryDisabled: boolean
  primaryLoading?: boolean
  statusMessage?: string
  txnUrl?: string
  onAmountChange: (amount: number | undefined) => void
  onHalf: () => void
  onMax: () => void
  onPrimary: () => void
  onBack?: () => void
  onReset?: () => void
  presetsDisabled?: boolean
}

export function BridgePanel({
  step,
  isConnected,
  unsupported,
  sourceNetworks,
  destinationNetworks,
  sourceChainId,
  destinationChainId,
  onSourceChange,
  onDestinationChange,
  tokens,
  token,
  onTokenChange,
  amount,
  amountUsd,
  balanceInLabel,
  balanceOutLabel,
  receiverLabel,
  receiverValue,
  receiverPlaceholder,
  onReceiverChange,
  feeLabel,
  gasLabel,
  protocolLabel,
  warning,
  isFetchingFee,
  isInsufficientBalance,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  statusMessage,
  txnUrl,
  onAmountChange,
  onHalf,
  onMax,
  onPrimary,
  onBack,
  onReset,
  presetsDisabled,
}: BridgePanelProps) {
  const amountValue = toTradePayAmount(amount)
  const [payFocused, setPayFocused] = useState(false)
  const [payDraft, setPayDraft] = useState<string | undefined>(undefined)

  const clearPayDraft = () => {
    setPayFocused(false)
    setPayDraft(undefined)
  }

  if (!isConnected) {
    return <p style={styles.muted}>Connect a wallet on Home to bridge.</p>
  }

  if (unsupported) {
    return (
      <p style={styles.errorText}>
        Wallet network does not match the selected source. Switch to continue.
      </p>
    )
  }

  if (step >= 2) {
    return (
      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Bridge submitted</h2>
        <p style={styles.muted}>Funds usually arrive in 15–20 minutes.</p>
        {txnUrl ? (
          <a href={txnUrl} target="_blank" rel="noreferrer noopener" style={styles.link}>
            View on explorer
          </a>
        ) : (
          <p style={styles.muted}>Waiting for explorer link…</p>
        )}
        <button type="button" style={styles.button} onClick={onReset}>
          Bridge more
        </button>
      </section>
    )
  }

  if (step === 1) {
    return (
      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Confirm bridge</h2>
        <p style={styles.muted}>
          {formatTokenAmount(amountValue, token?.symbol, TRADE_PAY_DECIMALS)} →{' '}
          {formatTokenAmount(amountValue, token?.symbol, TRADE_RECEIVE_DISPLAY_DECIMALS)}
        </p>
        {protocolLabel ? <p style={styles.muted}>Route {protocolLabel}</p> : null}
        {feeLabel ? <p style={styles.muted}>Bridge fee {feeLabel}</p> : null}
        {gasLabel ? <p style={styles.muted}>Network fee {gasLabel}</p> : null}
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
    amountValue != null ? down(amountValue, TRADE_RECEIVE_DISPLAY_DECIMALS) : ''
  const receivePlaceholder = isFetchingFee && amountValue == null ? '…' : '0.00'

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div style={styles.field}>
        <div style={styles.row}>
          <strong>Sending from</strong>
          <strong>Receiving on</strong>
        </div>
        <div style={styles.row}>
          <select
            style={styles.select}
            value={sourceChainId ?? ''}
            onChange={(event) => onSourceChange(Number(event.target.value))}
          >
            <option value="" disabled>
              Source
            </option>
            {sourceNetworks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
          <select
            style={styles.select}
            value={destinationChainId ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onDestinationChange(value ? Number(value) : undefined)
            }}
          >
            <option value="">Destination</option>
            {destinationNetworks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.muted} htmlFor="bridge-receiver">
          {receiverLabel}
        </label>
        <input
          id="bridge-receiver"
          style={styles.input}
          value={receiverValue}
          placeholder={receiverPlaceholder}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => onReceiverChange(event.target.value)}
        />
      </div>

      <div style={styles.field}>
        <div style={styles.row}>
          <strong>Amount</strong>
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
            value={payFocused && payDraft !== undefined ? payDraft : (amountValue ?? '')}
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
                onAmountChange(undefined)
                return
              }
              onAmountChange(parsed.amount)
            }}
            isAllowed={(values) => {
              const parts = values.value.split('.')
              return !parts[1] || parts[1].length <= TRADE_PAY_DECIMALS
            }}
          />
          <select
            style={styles.select}
            value={token?.symbol || ''}
            onChange={(event) => {
              const next = tokens?.find((entry) => entry.symbol === event.target.value)
              if (next) onTokenChange(next)
            }}
          >
            {(tokens || []).map((entry) => (
              <option key={entry.symbol} value={entry.symbol}>
                {entry.symbol}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.row}>
          <span style={styles.muted}>{formatUsd(amountUsd)}</span>
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
        <NumericFormat
          style={{ ...styles.input, opacity: 0.85 }}
          readOnly
          placeholder={receivePlaceholder}
          decimalScale={TRADE_RECEIVE_DISPLAY_DECIMALS}
          thousandSeparator
          allowNegative={false}
          value={receiveDisplay}
          // 1:1 OFT send; 2dp is display-only. Title keeps full pay precision.
          title={amountValue != null ? String(amountValue) : undefined}
        />
        {/* UI copy is 1:1; LZ/Sui OFT submit still sets minAmountLd with 1% haircut. */}
        <p style={styles.muted}>1:1 amount · Slippage 0%</p>
        {protocolLabel ? <p style={styles.muted}>Route {protocolLabel}</p> : null}
        {feeLabel ? <p style={styles.muted}>Est. bridge fee {feeLabel}</p> : null}
        {gasLabel ? <p style={styles.muted}>Est. network fee {gasLabel}</p> : null}
      </div>

      {warning ? <p style={styles.banner}>{warning}</p> : null}
      {isInsufficientBalance ? <p style={styles.errorText}>Insufficient balance</p> : null}
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
