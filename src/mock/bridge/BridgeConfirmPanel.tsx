import { ArrowUpRightIcon } from '@/assets/icons'
import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { safeExternalHref } from '@/lib/safe-external-href'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { cn, truncateAddress } from '@/lib/utils'
import { FOCUS_RESET, PanelChrome, PrimaryCtaButton, StepPanelHeader } from '@/mock/_shared'
import { BridgingFeesCollapsible } from '@/mock/bridge/BridgingFeesCollapsible'
import { BRIDGE_ETA_LABEL, DEFAULT_BRIDGE_FEE_LABEL } from '@/mock/bridge/constants'
import { resolveBridgeStatusNotice } from '@/mock/bridge/status-notice'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import type { BridgeConfirmPanelProps } from '@/mock/bridge/types'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'

/** `${addressExplorerUrl}/${address}` explorer join. */
function addressExplorerHref(
  addressExplorerUrl: string | undefined,
  address: string | undefined,
): string | undefined {
  if (!addressExplorerUrl || !address) return undefined
  const base = addressExplorerUrl.replace(/\/+$/, '')
  return safeExternalHref(`${base}/${address}`)
}

function ExplorerAddressLink({ address, explorerUrl }: { address?: string; explorerUrl?: string }) {
  if (!address) return null
  const href = addressExplorerHref(explorerUrl, address)
  const label = truncateAddress(address)

  if (!href) {
    return <p className="text-sm leading-5 font-book text-stone-500">{label}</p>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center justify-center gap-0.5',
        'text-sm leading-5 font-book text-stone-500 transition-colors',
        'hover:text-primary',
        FOCUS_RESET,
      )}
    >
      <span>{label}</span>
      <ArrowUpRightIcon
        width={20}
        height={20}
        className="size-4 shrink-0 text-stone-400 transition-colors group-hover:text-primary"
        aria-hidden
      />
    </a>
  )
}

function ChainNameMark({ name, iconSrc }: { name: string; iconSrc?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm leading-5 font-book text-stone-500">
      {iconSrc ? (
        <span className="size-4 shrink-0 overflow-hidden rounded-[3px] bg-stone-200">
          <img
            src={iconSrc}
            alt=""
            width={16}
            height={16}
            className="size-full object-cover"
            draggable={false}
          />
        </span>
      ) : null}
      <span>{name}</span>
    </span>
  )
}

function BridgeAmountColumn({
  label,
  amount,
  tokenSymbol,
  tokenIcon,
  chainIcon,
  networkName,
  networkIconSrc,
  address,
  addressExplorerUrl,
}: {
  label: string
  amount: string
  tokenSymbol?: string
  tokenIcon: string
  chainIcon?: string
  networkName?: string
  networkIconSrc?: string
  address?: string
  addressExplorerUrl?: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      {/* Label → network → token+amount → explorer address */}
      <p className="text-base leading-6 font-medium text-stone-500">{label}</p>
      {networkName ? <ChainNameMark name={networkName} iconSrc={networkIconSrc} /> : null}
      <TokenSymbolMark
        symbol={tokenSymbol}
        iconSrc={tokenIcon}
        chainIconSrc={chainIcon}
        size="lg"
        middle={amount}
      />
      <ExplorerAddressLink address={address} explorerUrl={addressExplorerUrl} />
    </div>
  )
}

/** Presentational bridge confirm card — step 1 (mirrors buy confirm layout). */
export function BridgeConfirmPanel({
  amount,
  token,
  sourceName,
  destinationName,
  sourceChainIconSrc,
  destinationChainIconSrc,
  sourceAddress,
  receiverValue,
  sourceAddressExplorerUrl,
  destinationAddressExplorerUrl,
  networkFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  networkFeeNativeLabel,
  gasFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  gasFeeNativeLabel,
  protocolFeeLabel = '$0',
  protocolFeeNativeLabel,
  bridgeFeeLabel,
  etaLabel = BRIDGE_ETA_LABEL,
  warning,
  primaryLabel = 'Confirm bridge',
  primaryDisabled = false,
  primaryLoading = false,
  isLoadingFee = false,
  onPrimary,
  onBack,
}: BridgeConfirmPanelProps) {
  // Bridge is 1:1 — same amount on both sides (buy-style left → right columns).
  const displayAmount = formatConfirmAmount(amount, 6)
  const notice = resolveBridgeStatusNotice(warning)
  const tokenIcon = tokenIconSrc(token)
  const tokenChainIcon = tokenChainIconSrc(token)
  const totalFeeLabel = bridgeFeeLabel ?? DEFAULT_BRIDGE_FEE_LABEL

  return (
    <PanelChrome>
      <StepPanelHeader title="Confirm your bridge transaction" onBack={onBack} />

      <div className="flex min-h-60 w-full flex-col items-center justify-center gap-4">
        {/* Desktop: left ↔ right. Mobile: top ↕ bottom. */}
        <div className="flex w-full flex-col items-center gap-2 px-2 md:flex-row md:gap-0 md:px-1">
          <BridgeAmountColumn
            label="Bridge from"
            amount={displayAmount}
            tokenSymbol={token?.symbol}
            tokenIcon={tokenIcon}
            chainIcon={tokenChainIcon ?? sourceChainIconSrc}
            networkName={sourceName}
            networkIconSrc={sourceChainIconSrc}
            address={sourceAddress}
            addressExplorerUrl={sourceAddressExplorerUrl}
          />

          <div className="flex size-[34px] shrink-0 items-center justify-center" aria-hidden>
            <img
              src="/assets/buy/arrow-right.svg"
              alt=""
              width={25}
              height={19}
              className="h-[19px] w-[25px] -rotate-90 md:rotate-180"
            />
          </div>

          <BridgeAmountColumn
            label="Bridge to"
            amount={displayAmount}
            tokenSymbol={token?.symbol}
            tokenIcon={tokenIcon}
            chainIcon={destinationChainIconSrc ?? tokenChainIcon}
            networkName={destinationName}
            networkIconSrc={destinationChainIconSrc}
            address={receiverValue}
            addressExplorerUrl={destinationAddressExplorerUrl}
          />
        </div>
      </div>

      {notice ? (
        <div className="px-3">
          <StatusCallout type={notice.type} title={notice.title} description={notice.description} />
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-4 px-3">
        <div className="flex w-full flex-col gap-2">
          <BridgingFeesCollapsible
            totalLabel={totalFeeLabel}
            protocolFeeLabel={protocolFeeLabel}
            protocolFeeNativeLabel={protocolFeeNativeLabel}
            networkFeeLabel={networkFeeLabel}
            networkFeeNativeLabel={networkFeeNativeLabel}
            gasFeeLabel={gasFeeLabel}
            gasFeeNativeLabel={gasFeeNativeLabel}
            isLoading={isLoadingFee}
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
    </PanelChrome>
  )
}
