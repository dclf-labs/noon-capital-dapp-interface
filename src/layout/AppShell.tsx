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
import { useLiveWalletAccounts, useWalletSession } from '@/hooks/connection'
import { getShellWalletChrome } from '@/layout/shell-wallet-chrome'
import { resolveConnectorIconSrc } from '@/wallet/connector-icon'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

/**
 * Shared app chrome — navbar, body, and footer live inside `APP_SHELL_MAX_PX`
 * (`mx-auto`). Desktop sidebar is in-flow beside the header column (4px top /
 * 5px left insets) and scrolls with the page.
 */
export function AppShell() {
  const location = useLocation()
  // Active product network only — EVM connected + Starknet selected ⇒ Connect.
  const session = useWalletSession()
  const liveAccounts = useLiveWalletAccounts()
  const { isConnected, walletLabel, chainFamily } = getShellWalletChrome(session)
  // Badge must follow the *active family's* live connector (never a parallel EVM MetaMask).
  const familyConnector =
    chainFamily === 'starknet'
      ? liveAccounts.starknet.connector
      : chainFamily === 'sui'
        ? liveAccounts.sui.connector
        : liveAccounts.evm.connector
  const walletIconSrc = isConnected
    ? resolveConnectorIconSrc(familyConnector, chainFamily)
    : undefined
  const connectWalletFamily = useConnectWalletFamily()
  const [apyPeriod, setApyPeriod] = useState<SidebarApyPeriod>('7d')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {
    apy: sidebarApy,
    tvl: sidebarTvl,
    isApyLoading: sidebarApyLoading,
    isTvlLoading: sidebarTvlLoading,
  } = useSidebarProtocolMetrics(apyPeriod)

  const navItems = useMemo(() => shellNavForPath(location.pathname), [location.pathname])

  // Open the connect UI for the *selected* family (EVM / Starknet / Sui).
  const openWallet = () => {
    void connectWalletFamily(chainFamily)
  }

  return (
    <div
      className="relative mx-auto flex min-h-dvh w-full flex-col border-0 p-0 font-suisse text-[#111]"
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
        {/* Desktop: sidebar beside header+main so 4px top inset is from the shell top.
            Mobile: sidebar hidden; header stays above main inside the column. */}
        <div className="flex flex-1 gap-4 px-4 pb-16 lg:pr-5 lg:pl-0">
          <div className="hidden lg:contents">
            <AppSidebar
              apy={sidebarApy}
              tvl={sidebarTvl}
              isApyLoading={sidebarApyLoading}
              isTvlLoading={sidebarTvlLoading}
              apyPeriod={apyPeriod}
              onApyPeriodChange={setApyPeriod}
              navItems={navItems}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader
              walletLabel={walletLabel}
              walletIconSrc={walletIconSrc}
              isConnected={isConnected}
              apy={sidebarApy}
              tvl={sidebarTvl}
              isApyLoading={sidebarApyLoading}
              isTvlLoading={sidebarTvlLoading}
              onMenuClick={() => setMobileMenuOpen(true)}
              onConnectClick={openWallet}
            />

            <main className="flex min-w-0 flex-1 flex-col items-center">
              {/* Full width on mobile/tablet; 60% beside the sidebar from lg up. */}
              <div className="flex w-full min-w-0 flex-1 flex-col lg:w-[60%]">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        <AppFooter />
      </div>

      <MobileNavDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        apy={sidebarApy}
        tvl={sidebarTvl}
        isApyLoading={sidebarApyLoading}
        isTvlLoading={sidebarTvlLoading}
        isConnected={isConnected}
        walletLabel={walletLabel}
        walletIconSrc={walletIconSrc}
        onConnectClick={openWallet}
      />
    </div>
  )
}
