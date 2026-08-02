import { Link } from 'react-router-dom'

import { PRODUCT_TABS } from '@/mock/vaults/constants'

export function VaultsHero() {
  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <nav
        aria-label="Product"
        className="flex items-center gap-8 font-louize text-[40px] leading-10 tracking-[-0.8px] text-[#474747]"
      >
        {PRODUCT_TABS.map((tab) =>
          tab.active ? (
            <span key={tab.id}>{tab.label}</span>
          ) : (
            <Link
              key={tab.id}
              to={tab.href}
              className="opacity-30 transition-opacity hover:opacity-60"
            >
              {tab.label}
            </Link>
          ),
        )}
      </nav>
      <p className="max-w-[330px] text-base tracking-[0.32px] text-[rgba(17,17,17,0.6)]">
        Secure environments built to isolate, protect, and control critical systems.
      </p>
    </header>
  )
}
