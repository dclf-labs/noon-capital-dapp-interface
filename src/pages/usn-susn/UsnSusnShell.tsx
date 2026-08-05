import { Outlet } from 'react-router-dom'

import { ProductHero } from '@/mock/vaults/ProductHero'

/**
 * Shared USN / sUSN shell — Louize tabs for Mint · Redeem · Stake · Unstake · Withdraw.
 * Subtitle is path-resolved in ProductHero (per-tab copy). Hero stays mounted across routes.
 */
export function UsnSusnShell() {
  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero />
        <div className="flex w-full min-w-0 flex-col items-stretch lg:max-w-[70%] lg:min-w-[45%]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
