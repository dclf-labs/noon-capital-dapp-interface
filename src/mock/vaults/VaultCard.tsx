import { ArrowUpRightIcon } from '@/assets/icons'
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
    <div className="flex items-center gap-1.5">
      <span className="text-sm tracking-[0.28px] text-[rgba(17,17,17,0.5)]">{label}</span>
      <span className={cn('size-5 overflow-hidden rounded', iconClassName)}>
        <img src={iconSrc} alt="" width={20} height={20} className="size-full object-cover" />
      </span>
      <span className="text-base leading-6 font-book text-stone-900">{value}</span>
    </div>
  )
}

/** Only allow absolute https destinations for external vault CTAs. */
function safeExternalHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  try {
    const url = new URL(href)
    if (url.protocol !== 'https:') return undefined
    return url.href
  } catch {
    return undefined
  }
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
    <div className="group/card relative w-full">
      {linkProps ? (
        <a
          {...linkProps}
          className="block w-full rounded-2xl transition-opacity hover:opacity-95"
          aria-label={`Open ${vault.name}`}
        >
          <VaultCardBody vault={vault} />
        </a>
      ) : (
        <VaultCardBody vault={vault} />
      )}

      {linkProps ? (
        <a
          {...linkProps}
          className={cn(
            // Start at the card edge; pl-3 bridges the 12px visual gap so hover never drops.
            'absolute top-1/2 left-full z-10 flex h-[154px] -translate-y-1/2 items-center pl-3',
            'opacity-0 transition-opacity duration-200 ease-out',
            'pointer-events-none group-hover/card:pointer-events-auto group-hover/card:opacity-100',
            'focus-visible:pointer-events-auto focus-visible:opacity-100',
            'group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100',
          )}
          aria-label={`Earn now in ${vault.name}`}
        >
          <span
            className={cn(
              'flex h-full min-w-[148px] flex-row items-center justify-center gap-1.5 rounded-2xl bg-[#6c77e9] px-7',
              'text-base tracking-[0.32px] whitespace-nowrap text-white',
            )}
          >
            <span className="shrink-0">Earn now</span>
            <ArrowUpRightIcon
              width={14}
              height={14}
              className="size-3.5 shrink-0 text-white"
              aria-hidden
            />
          </span>
        </a>
      ) : null}
    </div>
  )
}

function VaultCardBody({ vault }: { vault: VaultListItem }) {
  return (
    <article className="flex w-full flex-col gap-4 rounded-2xl border border-stone-200 bg-white/70 p-4 backdrop-blur-[11.7px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-lg">
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

        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-sm leading-5 font-book text-stone-500">APY, 7D</p>
          <p className="font-denton text-[28px] leading-none text-black">{vault.apyLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
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
          <p className="text-base leading-6 font-book text-stone-900">{vault.tvlLabel}</p>
        </div>
      </div>
    </article>
  )
}
