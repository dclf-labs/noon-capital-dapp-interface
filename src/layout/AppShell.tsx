import { useMemo, useState } from 'react'

import { Outlet, useLocation } from 'react-router-dom'

import {
  APP_SHELL_MAX_PX,
  AppFooter,
  AppHeader,
  AppSidebar,
  shellNavForPath,
  type SidebarApyPeriod,
} from '@/components/shell'
import { MobileNavDrawer } from '@/components/shell/MobileNavDrawer'
import useSidebarProtocolMetrics from '@/features/shell/hooks/useSidebarProtocolMetrics'
import { useWalletSession } from '@/hooks/connection'
import { openEvmAppKit } from '@/wallet/evm/open-appkit'

function shortenAddress(address?: string) {
  if (!address) return undefined
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

/**
 * Shared app chrome: background, max-width column, header (network + wallet),
 * hover-expand sidebar (desktop) / mobile nav drawer, footer.
 */
export function AppShell() {
  const location = useLocation()
  const session = useWalletSession()
  const [apyPeriod, setApyPeriod] = useState<SidebarApyPeriod>('7d')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { apy: sidebarApy, tvl: sidebarTvl } = useSidebarProtocolMetrics(apyPeriod)

  const navItems = useMemo(() => shellNavForPath(location.pathname), [location.pathname])

  const walletLabel =
    session.name ||
    shortenAddress(session.address) ||
    (session.isConnected ? 'Connected' : undefined)

  const openWallet = () => {
    void openEvmAppKit()
  }

  return (
    <div
      className="relative m-0 mx-auto flex min-h-dvh w-full flex-col border-0 p-0 font-suisse text-[#111]"
      style={{
        maxWidth: APP_SHELL_MAX_PX,
        backgroundImage:
          'linear-gradient(90deg, rgb(233, 233, 233) 0%, rgb(233, 233, 233) 100%), linear-gradient(180deg, rgb(220, 211, 212) 0%, rgb(211, 206, 192) 100%)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
        <img
          src="/assets/vaults/bg-waves.svg"
          alt=""
          className="absolute top-[-15px] left-1/2 block h-[1004px] w-[1761px] max-w-none -translate-x-1/2"
        />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full min-w-0 flex-1 flex-col">
        <AppHeader
          walletLabel={walletLabel}
          isConnected={session.isConnected}
          apy={sidebarApy}
          tvl={sidebarTvl}
          onMenuClick={() => setMobileMenuOpen(true)}
          onConnectClick={openWallet}
        />

        <div className="flex flex-1 gap-4 px-4 pb-16 lg:pr-5 lg:pl-[5px]">
          <div className="hidden lg:contents">
            <AppSidebar
              apy={sidebarApy}
              tvl={sidebarTvl}
              apyPeriod={apyPeriod}
              onApyPeriodChange={setApyPeriod}
              navItems={navItems}
            />
          </div>

          <main className="flex min-w-0 flex-1 flex-col items-center">
            {/* Full width on mobile/tablet; 60% beside the sidebar from lg up. */}
            <div className="flex w-full min-w-0 flex-1 flex-col lg:w-[60%]">
              <Outlet />
            </div>
          </main>
        </div>

        <AppFooter />
      </div>

      <MobileNavDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        apy={sidebarApy}
        tvl={sidebarTvl}
        isConnected={session.isConnected}
        walletLabel={walletLabel}
        onConnectClick={openWallet}
      />
    </div>
  )
}
