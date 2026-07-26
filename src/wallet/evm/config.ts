import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { evmAppKitNetworks } from '@/chains'
import { APP_DESCRIPTION, APP_NAME } from '@/constants'
import { env, isDev } from '@/lib/env'

const projectId = env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId && isDev) {
  console.warn(
    '[evm] VITE_WALLETCONNECT_PROJECT_ID is empty. Set it in .env (https://dashboard.reown.com).',
  )
}

/** Non-empty fallback keeps AppKit bootable in local/CI without a real project id. */
const resolvedProjectId = projectId || '00000000000000000000000000000000'

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
