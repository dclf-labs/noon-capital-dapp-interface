import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { ProductTab } from '@/mock/_shared/product-tabs'

type ProductTabNavProps = {
  tabs: ReadonlyArray<ProductTab & { active: boolean }>
  /** `product` = Louize 32/40px hero; `action` = slightly smaller cluster switcher. */
  size?: 'product' | 'action'
  'aria-label'?: string
}

/**
 * Shared Louize tab strip used for Vaults/Buy/Bridge/USN/sUSN and for
 * Buy|Sell / Mint|Redeem / Stake|Unstake|Withdraw action clusters.
 */
export function ProductTabNav({
  tabs,
  size = 'product',
  'aria-label': ariaLabel = 'Product',
}: ProductTabNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap items-center justify-center gap-6 font-louize text-[#474747] md:gap-8',
        size === 'product'
          ? 'text-[32px] leading-10 tracking-[-0.64px] md:text-[40px] md:tracking-[-0.8px]'
          : 'text-[24px] leading-8 tracking-[-0.48px] md:text-[28px] md:tracking-[-0.56px]',
      )}
    >
      {tabs.map((tab) =>
        tab.active ? (
          <span key={tab.id} aria-current="page">
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.id}
            to={tab.href}
            className="text-[rgba(71,71,71,0.3)] ring-0 transition-colors outline-none hover:text-primary focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
          >
            {tab.label}
          </Link>
        ),
      )}
    </nav>
  )
}
