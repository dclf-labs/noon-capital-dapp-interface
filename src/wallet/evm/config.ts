import type { AppKitNetwork } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { evmAppKitNetworks } from '@/chains'
import { APP_NAME, APPKIT_DESCRIPTION, APPKIT_URL } from '@/constants'
import { appEnv, isDev, isProd } from '@/lib/env'
import { resolveWalletConnectProjectId } from '@/wallet/evm/projectId'

const resolvedProjectId = resolveWalletConnectProjectId({
  projectId: appEnv.walletConnect.projectId,
  isProd,
  isDev,
})

const networks = [...evmAppKitNetworks] as [AppKitNetwork, ...AppKitNetwork[]]

export const appkitMetadata = {
  name: APP_NAME,
  description: APPKIT_DESCRIPTION,
  url: typeof window !== 'undefined' ? window.location.origin : APPKIT_URL,
  icons:
    typeof window !== 'undefined'
      ? [`${window.location.origin}/assets/favicon.svg`]
      : [`${APPKIT_URL}/assets/favicon.svg`],
}

export const wagmiAdapter = new WagmiAdapter({
  projectId: resolvedProjectId,
  networks,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

export const appkitConfig = {
  projectId: resolvedProjectId,
  networks,
  metadata: appkitMetadata,
} as const

/**
 * Singleton AppKit instance. Prefer this over `useAppKit().open` so open() always
 * targets the same object `createAppKit` returned (avoids duplicate-package pitfalls).
 */
export const appKit =
  typeof window !== 'undefined'
    ? createAppKit({
        adapters: [wagmiAdapter],
        networks,
        projectId: resolvedProjectId,
        metadata: {
          ...appkitMetadata,
          url: window.location.origin,
          icons: [`${window.location.origin}/assets/favicon.svg`],
        },
        features: {
          analytics: false,
          email: false,
          socials: false,
          emailShowWallets: true,
          collapseWallets: false,
          connectMethodsOrder: ['wallet'],
        },
        enableWalletGuide: false,
        enableWallets: true,
        showWallets: true,
      })
    : undefined
