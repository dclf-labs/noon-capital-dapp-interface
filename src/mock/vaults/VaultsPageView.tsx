import { FilterIcon, SortIcon } from '@/assets/icons'
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
    'flex items-center gap-0.5 rounded-full bg-stone-100 py-1 pr-2 pl-1.5 text-sm leading-5 font-book text-stone-600 transition-colors hover:text-primary focus-visible:text-primary'

  return (
    <div className="flex items-start gap-2 self-end">
      {onSortClick ? (
        <button type="button" onClick={onSortClick} className={chip}>
          <SortIcon width={20} height={20} className="size-5" aria-hidden />
          Sort
        </button>
      ) : null}
      {onFilterClick ? (
        <button type="button" onClick={onFilterClick} className={chip}>
          <FilterIcon width={20} height={20} className="size-5" aria-hidden />
          Filter
        </button>
      ) : null}
    </div>
  )
}

/** Vaults list content — shell chrome lives in `src/layout/AppShell`. */
export function VaultsPageView({ vaults, onSortClick, onFilterClick }: VaultsPageViewProps) {
  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <VaultsHero />

        <div className="flex w-full flex-col gap-2">
          <VaultsToolbar onSortClick={onSortClick} onFilterClick={onFilterClick} />

          {/* Desktop: reserve space for the Earn Now hover panel. */}
          <div className="flex w-full flex-col gap-8 md:pr-[11rem]">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
