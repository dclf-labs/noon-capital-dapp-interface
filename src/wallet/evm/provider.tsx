import { type ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { queryClient } from '@/lib/query'
import { wagmiConfig } from '@/wallet/evm/config'

interface EvmWalletProviderProps {
  children: ReactNode
}

/**
 * AppKit + wagmi + TanStack Query for all EVM chains.
 * AppKit is initialized in `@/wallet/evm/config` at module load.
 */
export function EvmWalletProvider({ children }: EvmWalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
