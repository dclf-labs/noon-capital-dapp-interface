import { type ReactNode } from 'react'

import { DisableFieldAutocomplete } from '@/components/DisableFieldAutocomplete'
import { ChainFamilySelectorModalProvider, SuiWalletSelectorProvider } from '@/features/shell'
import { WalletQuerySync } from '@/hooks/connection/WalletQuerySync'
import { EvmWalletProvider } from '@/wallet/evm/provider'
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
 * 4. Shell connect modals (chain family → wallet UI)
 * 5. WalletQuerySync — clears user-scoped caches on account change
 * 6. DisableFieldAutocomplete — no outline/ring CSS is global; this strips autocomplete
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <EvmWalletProvider>
      <StarknetWalletProvider>
        <SuiWalletProvider>
          <SuiWalletSelectorProvider>
            <ChainFamilySelectorModalProvider>
              <WalletQuerySync>
                <DisableFieldAutocomplete />
                {children}
              </WalletQuerySync>
            </ChainFamilySelectorModalProvider>
          </SuiWalletSelectorProvider>
        </SuiWalletProvider>
      </StarknetWalletProvider>
    </EvmWalletProvider>
  )
}
