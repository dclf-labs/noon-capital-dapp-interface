import { createConfig, fallback, http } from 'wagmi'
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

import { env, isDev } from '@/lib/env'

const projectId = env.VITE_WALLETCONNECT_PROJECT_ID
const alchemyKey = env.VITE_ALCHEMY_API_KEY

export const supportedChains = [mainnet, arbitrum, base, optimism, polygon, sepolia] as const

export type SupportedChainId = (typeof supportedChains)[number]['id']

const supportedChainIdSet = new Set<number>(supportedChains.map((chain) => chain.id))

export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return supportedChainIdSet.has(chainId)
}

function alchemyUrl(network: string): string | undefined {
  if (!alchemyKey) return undefined
  return `https://${network}.g.alchemy.com/v2/${alchemyKey}`
}

function transportFor(network: string) {
  const alchemy = alchemyUrl(network)
  return alchemy ? fallback([http(alchemy), http()]) : http()
}

if (isDev && !projectId) {
  console.info(
    '[web3] VITE_WALLETCONNECT_PROJECT_ID is empty — WalletConnect connector disabled. Injected wallets still work.',
  )
}

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected({ shimDisconnect: true }),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: 'Noon Capital',
              description: 'Multichain capital markets protocol',
              url: 'https://noon.capital',
              icons: ['https://noon.capital/icon.png'],
            },
            showQrModal: true,
          }),
        ]
      : []),
    coinbaseWallet({ appName: 'Noon Capital' }),
  ],
  transports: {
    [mainnet.id]: transportFor('eth-mainnet'),
    [arbitrum.id]: transportFor('arb-mainnet'),
    [base.id]: transportFor('base-mainnet'),
    [optimism.id]: transportFor('opt-mainnet'),
    [polygon.id]: transportFor('polygon-mainnet'),
    [sepolia.id]: transportFor('eth-sepolia'),
  },
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
