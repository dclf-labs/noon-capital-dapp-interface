import { useLocation } from 'react-router-dom'

import {
  actionTabsForPath,
  heroSubtitleForPath,
  isUsnOrSusnPath,
  productTabsForPath,
} from '@/mock/_shared/product-tabs'
import { ProductTabNav } from '@/mock/_shared/ProductTabNav'

type ProductHeroProps = {
  /** Override path-resolved subtitle when a page needs custom copy. */
  subtitle?: string
  /** When false, hide the USN/sUSN action strip. */
  showActionTabs?: boolean
}

/**
 * Shared product hero.
 * - Home surfaces (Vaults / Buy / Bridge): Louize product tabs only.
 * - USN / sUSN: Mint|Redeem|Stake|Unstake|Withdraw — subtitle follows the active tab.
 */
export function ProductHero({ subtitle, showActionTabs = true }: ProductHeroProps) {
  const { pathname } = useLocation()
  const usnCluster = isUsnOrSusnPath(pathname)
  const productTabs = usnCluster ? null : productTabsForPath(pathname)
  const actionTabs = showActionTabs ? actionTabsForPath(pathname) : null
  const resolvedSubtitle = subtitle ?? heroSubtitleForPath(pathname)

  return (
    <header className="flex flex-col items-center gap-2 text-center">
      {productTabs ? (
        <ProductTabNav tabs={productTabs} size="product" aria-label="Product" />
      ) : null}
      {actionTabs ? (
        <ProductTabNav
          tabs={actionTabs}
          // USN/sUSN: action tabs are the only hero nav — use product size.
          size={usnCluster ? 'product' : 'action'}
          aria-label={usnCluster ? 'Product' : 'Product actions'}
        />
      ) : null}
      <p className="max-w-[330px] text-base font-normal tracking-[0.32px] text-[rgba(17,17,17,0.6)] md:max-w-[448px] md:leading-6">
        {resolvedSubtitle}
      </p>
    </header>
  )
}
