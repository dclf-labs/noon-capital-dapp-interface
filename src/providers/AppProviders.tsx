import { type ReactNode } from 'react'

import { EvmProvider } from '@/wallet/evm/provider'
import { StarknetWalletProvider } from '@/wallet/starknet/provider'
import { SuiWalletProvider } from '@/wallet/sui/provider'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Provider order:
 * 1. EVM (AppKit/wagmi + shared QueryClient)
 * 2. Starknet (reuses QueryClient)
 * 3. Sui (independent dApp Kit)
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <EvmProvider>
      <StarknetWalletProvider>
        <SuiWalletProvider>{children}</SuiWalletProvider>
      </StarknetWalletProvider>
    </EvmProvider>
  )
}
