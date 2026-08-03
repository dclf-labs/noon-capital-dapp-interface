import type { ReactNode } from 'react'

import { ProductHero } from '@/mock/vaults/ProductHero'

type ProductStepShellProps = {
  children: ReactNode
  subtitle: string
  /** Optional footer under the card (e.g. PoweredByRow). */
  footer?: ReactNode
  /** When false, parent owns the product hero (keeps it mounted across family swaps). */
  showHero?: boolean
}

/** Shared product page chrome: hero + card column (+ optional footer). */
export function ProductStepShell({
  children,
  subtitle,
  footer,
  showHero = true,
}: ProductStepShellProps) {
  const card = (
    <div
      className={
        footer
          ? 'flex w-full min-w-0 flex-col items-stretch gap-4 lg:max-w-[70%] lg:min-w-[45%]'
          : 'flex w-full min-w-0 flex-col items-stretch lg:max-w-[70%] lg:min-w-[45%]'
      }
    >
      <div className="w-full min-w-0">{children}</div>
      {footer ? <div className="flex w-full justify-center">{footer}</div> : null}
    </div>
  )

  if (!showHero) return card

  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero subtitle={subtitle} />
        {card}
      </div>
    </div>
  )
}
