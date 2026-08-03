import { ArrowUpRightIcon } from '@/assets/icons'
import { formatConfirmAmount } from '@/features/_shared/trade-display'
import { safeExternalHref } from '@/lib/safe-external-href'
import { tokenChainIconSrc, tokenIconSrc } from '@/lib/token-icon'
import { cn, truncateAddress } from '@/lib/utils'
import { BridgingFeesCollapsible } from '@/mock/bridge/BridgingFeesCollapsible'
import { BRIDGE_ETA_LABEL, DEFAULT_BRIDGE_FEE_LABEL } from '@/mock/bridge/constants'
import { resolveBridgeStatusNotice } from '@/mock/bridge/status-notice'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import type { BridgeConfirmPanelProps } from '@/mock/bridge/types'
import { TokenSymbolMark } from '@/mock/buy/TokenSymbolMark'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

/** `${addressExplorerUrl}/${address}` — same join as old-dapp SubmitTxnInfo. */
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
        'hover:text-stone-900',
        focusReset,
      )}
    >
      <span>{label}</span>
      <ArrowUpRightIcon
        width={20}
        height={20}
        className="size-5 shrink-0 text-stone-400 transition-colors group-hover:text-stone-900"
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
      <p className="text-base leading-6 font-medium text-stone-500">{label}</p>
      <div className="flex w-full flex-col items-center gap-1.5">
        <p className="max-w-full truncate font-denton text-[40px] leading-none text-stone-900 tabular-nums md:text-[56px]">
          {amount}
        </p>
        <TokenSymbolMark
          symbol={tokenSymbol}
          iconSrc={tokenIcon}
          chainIconSrc={chainIcon}
          size="sm"
        />
        {networkName ? <ChainNameMark name={networkName} iconSrc={networkIconSrc} /> : null}
        <ExplorerAddressLink address={address} explorerUrl={addressExplorerUrl} />
      </div>
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
  gasFeeLabel = DEFAULT_BRIDGE_FEE_LABEL,
  protocolFeeLabel = '$0',
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
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
      <div className="flex w-full flex-col gap-4 overflow-hidden border border-stone-200 bg-white px-2 pt-2 pb-6 shadow-[0px_4px_4px_0px_rgba(111,125,185,0.05)]">
        {onBack ? (
          <button
            type="button"
            aria-label="Back"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onBack}
            className={cn(
              'flex w-fit items-center rounded-md bg-stone-100 p-1.5',
              'transition-opacity hover:opacity-80',
              focusReset,
            )}
          >
            <img
              src="/assets/buy/arrow-back.svg"
              alt=""
              width={24}
              height={24}
              className="size-6"
            />
          </button>
        ) : null}

        <div className="flex min-h-60 w-full flex-col items-center justify-center gap-4">
          <h2 className="px-2 text-center font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[36px] md:leading-[44px] md:tracking-[-1.8px]">
            Confirm your bridge transaction
          </h2>

          {/* Desktop: left ↔ right. Mobile: top ↕ bottom. */}
          <div className="flex w-full flex-col items-center gap-2 px-2 md:flex-row md:gap-0 md:px-1">
            <BridgeAmountColumn
              label="Bridging"
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
              label="To Receive"
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
            <StatusCallout
              type={notice.type}
              title={notice.title}
              description={notice.description}
            />
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-4 px-3">
          <div className="flex w-full flex-col gap-2">
            <BridgingFeesCollapsible
              totalLabel={totalFeeLabel}
              protocolFeeLabel={protocolFeeLabel}
              networkFeeLabel={networkFeeLabel}
              gasFeeLabel={gasFeeLabel}
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
    </div>
  )
}
