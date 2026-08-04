import { Link, useLocation } from 'react-router-dom'

import { productTabsForPath } from '@/mock/vaults/constants'

type ProductHeroProps = {
  subtitle: string
}

/** Shared Vaults / Buy / Bridge hero used on home product surfaces. */
export function ProductHero({ subtitle }: ProductHeroProps) {
  const { pathname } = useLocation()
  const tabs = productTabsForPath(pathname)

  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <nav
        aria-label="Product"
        className="flex items-center gap-8 font-louize text-[32px] leading-10 tracking-[-0.64px] text-[#474747] md:text-[40px] md:tracking-[-0.8px]"
      >
        {tabs.map((tab) =>
          tab.active ? (
            <span key={tab.id}>{tab.label}</span>
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
      <p className="max-w-[330px] text-base font-normal tracking-[0.32px] text-[rgba(17,17,17,0.6)] md:max-w-[448px] md:leading-6">
        {subtitle}
      </p>
    </header>
  )
}
