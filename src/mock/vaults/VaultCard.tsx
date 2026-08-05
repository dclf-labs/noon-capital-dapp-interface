import { ArrowUpRightIcon } from '@/assets/icons'
import { safeExternalHref } from '@/lib/safe-external-href'
import { cn } from '@/lib/utils'
import type { VaultListItem } from '@/mock/vaults/types'

type VaultCardProps = {
  vault: VaultListItem
}

function MetaChip({
  label,
  iconSrc,
  value,
  iconClassName,
}: {
  label: string
  iconSrc: string
  value: string
  iconClassName?: string
}) {
  return (
    <p className="whitespace-nowrap">
      <span className="mr-1.5 inline-block align-middle text-sm tracking-[0.28px] text-[rgba(17,17,17,0.5)]">
        {label}
      </span>
      <span
        className={cn(
          'mr-1.5 inline-block size-5 overflow-hidden rounded align-middle',
          iconClassName,
        )}
      >
        <img src={iconSrc} alt="" width={20} height={20} className="block size-full object-cover" />
      </span>
      <span className="inline-block align-middle text-base leading-6 font-book text-stone-900">
        {value}
      </span>
    </p>
  )
}

function EarnNowLabel() {
  return (
    <>
      <span className="shrink-0">Earn Now</span>
      <ArrowUpRightIcon
        width={14}
        height={14}
        className="size-3.5 shrink-0 text-white"
        aria-hidden
      />
    </>
  )
}

export function VaultCard({ vault }: VaultCardProps) {
  const href = safeExternalHref(vault.href)
  const linkProps = href
    ? ({
        href,
        target: '_blank',
        rel: 'noreferrer noopener',
      } as const)
    : undefined

  return (
    <div className="group/card relative flex w-full flex-col gap-2 md:gap-0">
      {linkProps ? (
        <a {...linkProps} className="block w-full rounded-2xl" aria-label={`Open ${vault.name}`}>
          <VaultCardBody vault={vault} />
        </a>
      ) : (
        <VaultCardBody vault={vault} />
      )}

      {/* Mobile: full-width Earn Now under the card (Figma). */}
      {linkProps ? (
        <a
          {...linkProps}
          className={cn(
            'flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-3',
            'text-base tracking-[0.32px] whitespace-nowrap text-white md:hidden',
          )}
          aria-label={`Earn now in ${vault.name}`}
        >
          <EarnNowLabel />
        </a>
      ) : null}

      {/* Desktop: side hover panel — slides + fades in from the card. */}
      {linkProps ? (
        <a
          {...linkProps}
          className={cn(
            'absolute top-1/2 left-full z-10 hidden h-[154px] items-center pl-3 md:flex',
            'translate-x-3 -translate-y-1/2 opacity-0',
            'pointer-events-none',
            'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'group-hover/card:pointer-events-auto group-hover/card:translate-x-0 group-hover/card:opacity-100',
            'focus-visible:pointer-events-auto focus-visible:translate-x-0 focus-visible:opacity-100',
            'group-focus-within/card:pointer-events-auto group-focus-within/card:translate-x-0 group-focus-within/card:opacity-100',
          )}
          aria-label={`Earn now in ${vault.name}`}
        >
          <span
            className={cn(
              'flex h-full min-w-[148px] flex-row items-center justify-center gap-1.5 rounded-2xl bg-accent px-7',
              'text-base tracking-[0.32px] whitespace-nowrap text-white',
              'origin-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'scale-95 group-focus-within/card:scale-100 group-hover/card:scale-100',
            )}
          >
            <EarnNowLabel />
          </span>
        </a>
      ) : null}
    </div>
  )
}

function VaultCardBody({ vault }: { vault: VaultListItem }) {
  return (
    <article className="flex w-full flex-col gap-6 rounded-2xl border border-stone-200 bg-white p-4 md:gap-4">
      {/* Title row — APY sits on the right on desktop only. */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-lg md:size-14">
            <img
              src={vault.iconSrc}
              alt=""
              width={56}
              height={56}
              className="size-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-xl leading-7 tracking-[-0.4px] text-[#111]">{vault.name}</h3>
            <p className="line-clamp-2 text-base tracking-[0.32px] text-[rgba(17,17,17,0.6)]">
              {vault.description}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1 md:flex">
          <p className="text-sm leading-5 font-book text-stone-500">APY, 7D</p>
          <p
            className={cn(
              'font-denton text-[28px] leading-none text-black',
              vault.isApyLoading && 'animate-pulse',
            )}
          >
            {vault.apyLabel}
          </p>
        </div>
      </div>

      {/* Mobile metrics grid */}
      <div className="flex w-full flex-col gap-2 md:hidden">
        <div className="flex w-full gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm leading-5 font-book text-stone-500">APY, 7D</p>
            <p
              className={cn(
                'font-denton text-[28px] leading-none text-black',
                vault.isApyLoading && 'animate-pulse',
              )}
            >
              {vault.apyLabel}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-sm tracking-[0.28px] text-[rgba(17,17,17,0.5)]">TVL</p>
            <p
              className={cn(
                'text-base leading-6 font-book text-stone-900',
                vault.isTvlLoading && 'animate-pulse',
              )}
            >
              {vault.tvlLabel}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2">
          <div className="flex min-w-0 flex-1 items-center">
            <MetaChip label="Chain" iconSrc={vault.chainIconSrc} value={vault.chainName} />
          </div>
          <div className="flex min-w-0 flex-1 items-center">
            <MetaChip
              label="Assets"
              iconSrc={vault.assetIconSrc}
              value={vault.assetSymbol}
              iconClassName="bg-[#1d2228]"
            />
          </div>
        </div>
      </div>

      {/* Desktop metrics row */}
      <div className="hidden items-center gap-6 md:flex">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          <MetaChip label="Chain" iconSrc={vault.chainIconSrc} value={vault.chainName} />
          <MetaChip
            label="Assets"
            iconSrc={vault.assetIconSrc}
            value={vault.assetSymbol}
            iconClassName="bg-[#1d2228]"
          />
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <p className="text-sm tracking-[0.28px] text-[rgba(17,17,17,0.5)]">TVL</p>
          <p
            className={cn(
              'text-base leading-6 font-book text-stone-900',
              vault.isTvlLoading && 'animate-pulse',
            )}
          >
            {vault.tvlLabel}
          </p>
        </div>
      </div>
    </article>
  )
}
