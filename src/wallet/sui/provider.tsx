import { type ReactNode } from 'react'

import { DAppKitProvider } from '@mysten/dapp-kit-react'

import { suiDAppKit } from '@/wallet/sui/config'

interface SuiWalletProviderProps {
  children: ReactNode
}

export function SuiWalletProvider({ children }: SuiWalletProviderProps) {
  return <DAppKitProvider dAppKit={suiDAppKit}>{children}</DAppKitProvider>
}
