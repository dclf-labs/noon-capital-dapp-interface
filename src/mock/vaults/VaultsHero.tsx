import { Link } from 'react-router-dom'

import { PRODUCT_TABS } from '@/mock/vaults/constants'

export function VaultsHero() {
  return (
    <header className="flex flex-col items-center text-center">
      <nav
        aria-label="Product"
        className="flex items-center gap-8 font-louize text-[32px] leading-10 tracking-[-0.64px] text-[#474747] md:text-[40px] md:tracking-[-0.8px]"
      >
        {PRODUCT_TABS.map((tab) =>
          tab.active ? (
            <span key={tab.id}>{tab.label}</span>
          ) : (
            <Link
              key={tab.id}
              to={tab.href}
              className="text-[rgba(71,71,71,0.3)] transition-colors hover:text-primary focus-visible:text-primary"
            >
              {tab.label}
            </Link>
          ),
        )}
      </nav>
      <p className="max-w-[330px] text-base tracking-[0.32px] text-[rgba(17,17,17,0.6)]">
        Vaults are the easiest way to generate returns within Noon&apos;s ecosystem.
      </p>
    </header>
  )
}
