import { type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from '@/wallet/evm/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

interface EvmProviderProps {
  children: ReactNode
}

/**
 * AppKit + wagmi + TanStack Query for all EVM chains.
 * AppKit is initialized in `@/wallet/evm/config` at module load.
 */
export function EvmProvider({ children }: EvmProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { queryClient }
