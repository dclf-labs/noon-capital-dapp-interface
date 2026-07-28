import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { evmAppKitNetworks } from '@/chains'
import { APP_DESCRIPTION, APP_NAME } from '@/constants'
import { env, isDev, isProd } from '@/lib/env'
import { resolveWalletConnectProjectId } from '@/wallet/evm/projectId'

const resolvedProjectId = resolveWalletConnectProjectId({
  projectId: env.VITE_WALLETCONNECT_PROJECT_ID,
  isProd,
  isDev,
})

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
