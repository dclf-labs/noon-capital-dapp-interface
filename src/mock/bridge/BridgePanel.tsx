import { useId, useState } from 'react'

import { NumericFormat } from 'react-number-format'

import {
  formatTradeReceiveDisplay,
  parseTradePayInput,
  toTradePayAmount,
  TRADE_PAY_DECIMALS,
} from '@/features/_shared'
import { formatUsd } from '@/features/_shared/trade-display'
import { tokenIconSrc } from '@/lib/token-icon'
import { cn, truncateAddress } from '@/lib/utils'
import { BridgeNetworkPicker } from '@/mock/bridge/BridgeNetworkPicker'
import { BRIDGE_ETA_LABEL, DEFAULT_BRIDGE_FEE_LABEL } from '@/mock/bridge/constants'
import { resolveBridgeStatusNotice } from '@/mock/bridge/status-notice'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import type { BridgePanelProps } from '@/mock/bridge/types'
import { TokenDropdown } from '@/mock/buy/TokenDropdown'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

export type { BridgeNetworkOption, BridgePanelProps } from '@/mock/bridge/types'

/** Presentational bridge card — step 0 (Figma). Fully controlled by live adapters. */
export function BridgePanel({
  isConnected,
  unsupported,
  connectedAddress,
  sourceNetworks,
  destinationNetworks,
  sourceChainId,
  destinationChainId,
  onSourceChange,
  onDestinationChange,
  onFlipNetworks,
  tokens,
  token,
  onTokenChange,
  amount,
  amountUsd,
  balanceInLabel = 'Bal: —',
  balanceOutLabel = 'Bal: —',
  receiverValue,
  receiverPlaceholder,
  onReceiverChange,
  feeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  etaLabel = BRIDGE_ETA_LABEL,
  warning,
  isFetchingFee = false,
  isLoadingFee = false,
  isInsufficientBalance = false,
  primaryLabel = 'Enter amount',
  primaryDisabled = true,
  primaryLoading = false,
  presetsDisabled = false,
  onAmountChange,
  onHalf,
  onMax,
  onPrimary,
}: BridgePanelProps) {
  const amountId = useId()
  const receiveId = useId()
  const receiverId = useId()
  const amountValue = toTradePayAmount(amount)

  const [payFocused, setPayFocused] = useState(false)
  const [payDraft, setPayDraft] = useState<string | undefined>(undefined)
  const [editingReceiver, setEditingReceiver] = useState(false)

  const clearPayDraft = () => {
    setPayFocused(false)
    setPayDraft(undefined)
  }

  const onAmountValueChange = (values: { floatValue?: number; value: string }) => {
    if (payFocused) setPayDraft(values.value)
    const parsed = parseTradePayInput(values)
    if (parsed.kind === 'draft') return
    if (parsed.kind === 'clear') {
      onAmountChange(undefined)
      return
    }
    onAmountChange(parsed.amount)
  }

  const displayPay = payFocused && payDraft !== undefined ? payDraft : (amountValue ?? '')
  const displayReceive =
    amountValue != null ? formatTradeReceiveDisplay(amountValue) : formatTradeReceiveDisplay(0)
  const hasAmount = amountValue != null && amountValue > 0
  const canFlip = Boolean(onFlipNetworks && sourceChainId && destinationChainId)
  const notice = resolveBridgeStatusNotice(warning)

  return (
    <>
      {unsupported ? (
        <div className="mb-3 w-full">
          <StatusCallout
            type="error"
            title="Wallet network does not match the selected network."
            description="Switch network in the header and approve the wallet prompt."
          />
        </div>
      ) : null}

      <div className="w-full overflow-hidden rounded-xl border border-stone-300 bg-white shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
        {/* Sending / Receiving networks */}
        <div className="flex w-full items-stretch border-b border-stone-200">
          <div className="min-w-0 flex-1 border-r border-stone-200">
            <BridgeNetworkPicker
              label="sending"
              networks={sourceNetworks}
              value={sourceChainId}
              onChange={onSourceChange}
            />
          </div>
          <div className="min-w-0 flex-1">
            <BridgeNetworkPicker
              label="receiving"
              networks={destinationNetworks}
              value={destinationChainId}
              placeholder="Select network"
              onChange={(chainId) => onDestinationChange(chainId)}
            />
          </div>
        </div>

        <div className="relative flex w-full flex-col gap-1 p-2">
          {/* You're sending */}
          <div className="flex w-full flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex w-full items-center gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 font-book text-stone-500 uppercase">
                You&apos;re sending
              </p>
              {isConnected && connectedAddress ? (
                <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-1 text-sm leading-5 font-medium text-emerald-600">
                  {truncateAddress(connectedAddress)}
                </span>
              ) : null}
            </div>

            <div className="flex w-full items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <label className="sr-only" htmlFor={amountId}>
                  Send amount
                </label>
                <NumericFormat
                  id={amountId}
                  inputMode="decimal"
                  decimalScale={TRADE_PAY_DECIMALS}
                  thousandSeparator
                  allowNegative={false}
                  allowedDecimalSeparators={['.']}
                  placeholder="0.00"
                  value={displayPay}
                  onFocus={() => setPayFocused(true)}
                  onBlur={clearPayDraft}
                  onValueChange={onAmountValueChange}
                  isAllowed={(values) => {
                    const parts = values.value.split('.')
                    if (parts[0] && parts[0].length > 18) return false
                    return !parts[1] || parts[1].length <= TRADE_PAY_DECIMALS
                  }}
                  className={cn(
                    'w-full bg-transparent text-left text-2xl leading-8 font-medium tabular-nums',
                    focusReset,
                    hasAmount || (payFocused && payDraft && payDraft !== '0')
                      ? 'text-stone-900'
                      : 'text-stone-600',
                  )}
                />
                <p className="text-sm leading-5 text-stone-500 tabular-nums">
                  {formatUsd(amountUsd)}
                </p>
              </div>
              <TokenDropdown
                token={token}
                tokens={tokens}
                onChange={(next) => {
                  clearPayDraft()
                  onTokenChange(next)
                }}
                size="sm"
                label={`Select bridge token${token ? `, currently ${token.symbol}` : ''}`}
              />
            </div>

            <div className="h-px w-full bg-stone-200" />

            <div className="flex w-full items-center gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-stone-600">{balanceInLabel}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={presetsDisabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onHalf}
                  className={cn(
                    'rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5',
                    'text-sm leading-5 font-medium text-stone-600',
                    focusReset,
                    presetsDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  HALF
                </button>
                <button
                  type="button"
                  disabled={presetsDisabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onMax}
                  className={cn(
                    'rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5',
                    'text-sm leading-5 font-medium text-stone-600',
                    focusReset,
                    presetsDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Flip — Figma uses horizontal swap icon rotated -90° so arrows read up/down. */}
          <div className="absolute top-1/2 left-1/2 z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <button
              type="button"
              disabled={!canFlip}
              aria-label="Flip sending and receiving networks"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onFlipNetworks}
              className={cn(
                'flex items-center justify-center rounded-md border border-stone-200 bg-white p-2',
                focusReset,
                canFlip ? 'hover:bg-stone-50' : 'cursor-not-allowed opacity-40',
              )}
            >
              <img
                src="/assets/bridge/arrow-swap-horizontal.svg"
                alt=""
                width={28}
                height={28}
                className="size-7 -rotate-90"
              />
            </button>
          </div>

          {/* You're receiving */}
          <div className="flex w-full flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex w-full items-center gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 font-book text-stone-500 uppercase">
                You&apos;re receiving
              </p>
              {editingReceiver ? (
                <input
                  id={receiverId}
                  value={receiverValue}
                  placeholder={receiverPlaceholder}
                  onChange={(event) => onReceiverChange(event.target.value)}
                  onBlur={() => setEditingReceiver(false)}
                  autoFocus
                  className={cn(
                    'max-w-[180px] rounded-md border border-sky-200 bg-sky-50 px-2 py-1',
                    'text-sm leading-5 font-medium text-sky-800',
                    focusReset,
                  )}
                />
              ) : (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setEditingReceiver(true)}
                  className={cn(
                    'flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-1',
                    'text-sm leading-5 font-medium text-sky-700',
                    focusReset,
                    'hover:bg-sky-100',
                  )}
                >
                  <span>CHANGE</span>
                  <span className="tabular-nums">
                    {receiverValue ? truncateAddress(receiverValue) : 'Add'}
                  </span>
                </button>
              )}
            </div>

            <div className="flex w-full items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <label className="sr-only" htmlFor={receiveId}>
                  Receive amount
                </label>
                <input
                  id={receiveId}
                  readOnly
                  value={displayReceive}
                  className={cn(
                    'w-full bg-transparent text-left text-2xl leading-8 font-medium text-stone-600 tabular-nums',
                    focusReset,
                  )}
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-stone-200 bg-white py-1.5 pr-2 pl-1.5 shadow-[0px_4px_2px_rgba(111,125,185,0.05)]">
                <span className="relative size-[22px] shrink-0 overflow-hidden rounded-md bg-stone-200">
                  {token ? (
                    <img
                      src={tokenIconSrc(token)}
                      alt=""
                      width={22}
                      height={22}
                      className="size-full object-cover"
                    />
                  ) : null}
                </span>
                <span className="text-base leading-6 font-medium text-stone-600">
                  {token?.symbol ?? '—'}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-stone-200" />

            <p className="text-sm leading-5 text-stone-600">{balanceOutLabel}</p>
          </div>
        </div>

        {/* Old-dapp Info sits between inputs and fee/CTA — not between fee and button. */}
        {notice || isInsufficientBalance ? (
          <div className="flex w-full flex-col gap-2 px-4 pt-2">
            {notice ? (
              <StatusCallout
                type={notice.type}
                title={notice.title}
                description={notice.description}
              />
            ) : null}
            {isInsufficientBalance ? (
              <StatusCallout
                type="error"
                title="Insufficient wallet balance."
                description={
                  token?.symbol
                    ? `Add ${token.symbol} to your wallet or lower the send amount.`
                    : 'Add tokens to your wallet or lower the send amount.'
                }
              />
            ) : null}
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-4 px-4 pt-2 pb-6">
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full items-center gap-1">
              <img
                src="/assets/buy/gas-pump.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0"
              />
              <span className="min-w-0 flex-1 text-sm leading-5 font-book text-stone-500">
                Bridging fees
              </span>
              {(isLoadingFee || isFetchingFee) && feeLabel === DEFAULT_BRIDGE_FEE_LABEL ? (
                <span
                  aria-label="Estimating bridge fee"
                  className="inline-block h-6 w-14 animate-pulse rounded-md bg-stone-200"
                />
              ) : (
                <p className="text-base leading-6 font-semibold text-stone-600 tabular-nums">
                  {feeLabel}
                </p>
              )}
            </div>

            <div className="hidden w-full items-center gap-1 md:flex">
              <img
                src="/assets/bridge/clock.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0"
              />
              <span className="min-w-0 flex-1 text-sm leading-5 font-book text-stone-500">
                Bridge ETA
              </span>
              <p className="text-base leading-6 font-semibold text-stone-600">{etaLabel}</p>
            </div>
          </div>

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
    </>
  )
}
