import type { VaultsPageViewProps } from '@/mock/vaults/types'
import { VaultCard } from '@/mock/vaults/VaultCard'
import { VaultsHero } from '@/mock/vaults/VaultsHero'

function VaultsToolbar({
  onSortClick,
  onFilterClick,
}: {
  onSortClick?: () => void
  onFilterClick?: () => void
}) {
  if (!onSortClick && !onFilterClick) return null

  const chip =
    'flex items-center gap-0.5 rounded-full bg-stone-100 py-1 pr-2 pl-1.5 text-sm leading-5 font-book text-stone-600'

  return (
    <div className="flex items-start gap-2 self-end">
      {onSortClick ? (
        <button type="button" onClick={onSortClick} className={chip}>
          <img src="/assets/vaults/sort.svg" alt="" width={20} height={20} className="size-5" />
          Sort
        </button>
      ) : null}
      {onFilterClick ? (
        <button type="button" onClick={onFilterClick} className={chip}>
          <img src="/assets/vaults/filter.svg" alt="" width={20} height={20} className="size-5" />
          Filter
        </button>
      ) : null}
    </div>
  )
}

/** Vaults list content — shell chrome lives in `src/layout/AppShell`. */
export function VaultsPageView({
  vaults,
  onSortClick,
  onFilterClick,
  onEarnClick,
}: VaultsPageViewProps) {
  return (
    <div className="flex w-full flex-col items-center pt-10">
      <div className="flex w-full max-w-[624px] flex-col items-center gap-12">
        <VaultsHero />

        <div className="flex w-full flex-col gap-2">
          <VaultsToolbar onSortClick={onSortClick} onFilterClick={onFilterClick} />

          {/* Right padding reserves Earn Now so it never clips or shifts layout. */}
          <div className="flex w-full flex-col gap-8 pr-[7.5rem]">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} onEarnClick={() => onEarnClick?.(vault)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
