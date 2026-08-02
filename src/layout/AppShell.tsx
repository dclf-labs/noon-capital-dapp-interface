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
import useProductVaults from '@/features/vault/hooks/useProductVaults'
import { useResolvedChain, useWalletSession } from '@/hooks/connection'
import { openEvmAppKit, openEvmAppKitNetworks } from '@/wallet/evm/open-appkit'

function shortenAddress(address?: string) {
  if (!address) return undefined
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function networkIconForChain(name?: string): string {
  const key = name?.toLowerCase() ?? ''
  if (key.includes('monad')) return '/assets/chains/monad.svg'
  if (key.includes('citrea')) return '/assets/chains/citrea.svg'
  if (key.includes('stark')) return '/assets/chains/starknet.svg'
  if (key.includes('eth') || key.includes('base') || key.includes('zk')) {
    return '/assets/chains/ethereum.svg'
  }
  return '/assets/shell/ethereum.png'
}

/**
 * Shared app chrome: background, max-width column, header (network + wallet),
 * hover-expand sidebar, footer. Product routes render in `<Outlet />`.
 */
export function AppShell() {
  const location = useLocation()
  const session = useWalletSession()
  const { config } = useResolvedChain()
  const { sidebarApy, sidebarTvl } = useProductVaults()
  const [apyPeriod, setApyPeriod] = useState<SidebarApyPeriod>('7d')

  const navItems = useMemo(() => shellNavForPath(location.pathname), [location.pathname])

  const walletLabel =
    session.name ||
    shortenAddress(session.address) ||
    (session.isConnected ? 'Connected' : undefined)

  return (
    <div
      className="relative min-h-dvh font-suisse text-[#111]"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(233, 233, 233) 0%, rgb(233, 233, 233) 100%), linear-gradient(180deg, rgb(220, 211, 212) 0%, rgb(211, 206, 192) 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-15px] left-1/2 h-[1004px] w-[1761px] -translate-x-1/2 opacity-80"
      >
        <img src="/assets/vaults/bg-waves.svg" alt="" className="block size-full max-w-none" />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full flex-col">
        <div className="mx-auto flex w-full flex-1 flex-col" style={{ maxWidth: APP_SHELL_MAX_PX }}>
          <AppHeader
            walletLabel={walletLabel}
            networkIconSrc={networkIconForChain(config?.name)}
            onConnectClick={() => {
              void openEvmAppKit()
            }}
            onNetworkClick={() => {
              void openEvmAppKitNetworks()
            }}
          />

          <div className="flex flex-1 gap-4 px-3 pb-16 sm:px-5">
            <AppSidebar
              apy={sidebarApy}
              tvl={sidebarTvl}
              apyPeriod={apyPeriod}
              onApyPeriodChange={setApyPeriod}
              navItems={navItems}
            />

            <main className="flex min-w-0 flex-1 flex-col">
              <Outlet />
            </main>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  )
}
