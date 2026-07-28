import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { evmAppKitNetworks } from '@/chains'
import { APP_DESCRIPTION, APP_NAME } from '@/constants'
import { env, isDev, isProd } from '@/lib/env'

const projectId = env.VITE_WALLETCONNECT_PROJECT_ID.trim()

/** Dev/test-only placeholder so AppKit can boot without a real Reown project id. */
const DEV_PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000'

function resolveWalletConnectProjectId(): string {
  if (projectId) return projectId

  if (isProd) {
    throw new Error(
      '[evm] VITE_WALLETCONNECT_PROJECT_ID is required in production. Get one at https://dashboard.reown.com',
    )
  }

  if (isDev) {
    console.warn(
      '[evm] VITE_WALLETCONNECT_PROJECT_ID is empty. Set it in .env (https://dashboard.reown.com).',
    )
  }

  return DEV_PLACEHOLDER_PROJECT_ID
}

const resolvedProjectId = resolveWalletConnectProjectId()

export const wagmiAdapter = new WagmiAdapter({
  projectId: resolvedProjectId,
  networks: [...evmAppKitNetworks],
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

if (typeof window !== 'undefined') {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [...evmAppKitNetworks],
    projectId: resolvedProjectId,
    metadata: {
      name: APP_NAME,
      description: APP_DESCRIPTION,
      url: window.location.origin,
      icons: [`${window.location.origin}/assets/favicon.svg`],
    },
    features: {
      analytics: false,
    },
  })
}
