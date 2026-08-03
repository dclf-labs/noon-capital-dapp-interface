import { useId } from 'react'

import { NumericFormat } from 'react-number-format'

import { WalletIcon } from '@/assets/icons'
import {
  formatTradeReceiveDisplay,
  isTradePayInputAllowed,
  toTradePayAmount,
  TRADE_PAY_DECIMALS,
} from '@/features/_shared'
import { formatUsd } from '@/features/_shared/trade-display'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { cn, truncateAddress } from '@/lib/utils'
import {
  BRIDGE_PANEL_SHELL,
  FOCUS_RESET,
  HalfMaxButtons,
  preventMouseDownFocus,
  PrimaryCtaButton,
  usePayAmountDraft,
} from '@/mock/_shared'
import { BridgeNetworkPicker } from '@/mock/bridge/BridgeNetworkPicker'
import { BridgingFeesCollapsible } from '@/mock/bridge/BridgingFeesCollapsible'
import { BRIDGE_ETA_LABEL, DEFAULT_BRIDGE_FEE_LABEL } from '@/mock/bridge/constants'
import { resolveBridgeStatusNotice } from '@/mock/bridge/status-notice'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import type { BridgePanelProps } from '@/mock/bridge/types'
import { TokenDropdown } from '@/mock/buy/TokenDropdown'

export type { BridgeNetworkOption, BridgePanelProps } from '@/mock/bridge/types'

/** Presentational bridge card — step 0 (Figma). Fully controlled by live adapters. */
export function BridgePanel({
  isConnected,
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
  onOpenReceiverModal,
  feeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  networkFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  gasFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  protocolFeeLabel = '$0',
  etaLabel = BRIDGE_ETA_LABEL,
  warning,
  isFetchingFee = false,
  isLoadingFee = false,
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
  const amountValue = toTradePayAmount(amount)

  const payDraft = usePayAmountDraft({ onAmountChange })
  const displayPay = payDraft.displayValue(amountValue ?? '')
  const displayReceive =
    amountValue != null ? formatTradeReceiveDisplay(amountValue) : formatTradeReceiveDisplay(0)
  const hasAmount = amountValue != null && amountValue > 0
  const canFlip = Boolean(onFlipNetworks && sourceChainId && destinationChainId)
  const notice = resolveBridgeStatusNotice(warning)
  const receiveChainSrc = tokenChainIconSrc(token)

  return (
    <div className={BRIDGE_PANEL_SHELL}>
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
            onChange={onDestinationChange}
          />
        </div>
      </div>

      <div className="relative flex w-full flex-col gap-1 p-2">
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
              <p className="text-sm leading-5 font-book text-stone-500 tabular-nums">
                {formatUsd(amountUsd)}
              </p>
            </div>
            <TokenDropdown
              token={token}
              tokens={tokens}
              onChange={(next) => {
                payDraft.clearDraft()
                onTokenChange(next)
              }}
              size="sm"
              variant="outlined"
              label={`Select bridge token${token ? `, currently ${token.symbol}` : ''}`}
            />
          </div>

          <div className="h-px w-full bg-stone-200" />

          <div className="flex w-full items-center gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-stone-600">{balanceInLabel}</p>
            <HalfMaxButtons disabled={presetsDisabled} onHalf={onHalf} onMax={onMax} />
          </div>
        </div>

        {/* Flip — Figma uses horizontal swap icon rotated -90° so arrows read up/down. */}
        <div
          id="bridge-flip-button"
          className="absolute top-1/2 left-1/2 z-10 flex size-9 -translate-x-[32.5%] -translate-y-[32.5%] items-center justify-center md:size-11"
        >
          <button
            type="button"
            disabled={!canFlip}
            aria-label="Flip sending and receiving networks"
            onMouseDown={preventMouseDownFocus}
            onClick={onFlipNetworks}
            className={cn(
              'flex cursor-pointer items-center justify-center rounded-md border border-stone-200 bg-white p-1.5 md:p-2',
              FOCUS_RESET,
              canFlip ? 'hover:bg-stone-50' : 'cursor-not-allowed',
            )}
          >
            <img
              src="/assets/bridge/arrow-swap-horizontal.svg"
              alt=""
              width={28}
              height={28}
              className="size-5 -rotate-90 md:size-7"
            />
          </button>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="flex w-full items-center gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 font-book text-stone-500 uppercase">
              You&apos;re receiving
            </p>
            <button
              type="button"
              onMouseDown={preventMouseDownFocus}
              onClick={onOpenReceiverModal}
              aria-label={receiverValue ? 'Change receiving address' : 'Set receiving address'}
              className={cn(
                'relative flex items-center gap-1 overflow-visible rounded-md bg-[#E0EAFF] px-1.5 py-1',
                'text-sm leading-5 font-medium text-[#A4BCFD]',
                FOCUS_RESET,
              )}
            >
              <WalletIcon
                width={16}
                height={14}
                className="size-4 shrink-0 text-[#A4BCFD]"
                aria-hidden
              />
              <span>{receiverValue ? 'CHANGE' : 'SET ADDRESS'}</span>
              {receiverValue ? (
                <span className="text-[#6C77E9] tabular-nums">
                  {truncateAddress(receiverValue, 2)}
                </span>
              ) : null}
              <span
                className="pointer-events-none absolute -top-0.5 -right-0.5 flex size-2"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-[2px] bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-[2px] bg-accent" />
              </span>
            </button>
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
                  'w-full bg-transparent text-left font-suisse text-2xl leading-8 font-medium text-stone-600 tabular-nums',
                  FOCUS_RESET,
                )}
              />
            </div>
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
                {receiveChainSrc ? (
                  <span className="absolute right-[-3px] bottom-[-2px] size-3 overflow-hidden rounded-[2px] border border-white bg-white">
                    <img
                      src={receiveChainSrc}
                      alt=""
                      width={12}
                      height={12}
                      className="size-full rounded-[2px] object-cover"
                      draggable={false}
                    />
                  </span>
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

      {notice ? (
        <div className="flex w-full flex-col gap-2 px-4 pt-2">
          <StatusCallout type={notice.type} title={notice.title} description={notice.description} />
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-4 px-4 pt-2 pb-6">
        <div className="flex w-full flex-col gap-2">
          <BridgingFeesCollapsible
            totalLabel={feeLabel}
            protocolFeeLabel={protocolFeeLabel}
            networkFeeLabel={networkFeeLabel}
            gasFeeLabel={gasFeeLabel}
            isLoading={isLoadingFee || isFetchingFee}
          />

          <div className="flex w-full items-center gap-1">
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

        <PrimaryCtaButton disabled={primaryDisabled} loading={primaryLoading} onClick={onPrimary}>
          {primaryLabel}
        </PrimaryCtaButton>
      </div>
    </div>
  )
}
