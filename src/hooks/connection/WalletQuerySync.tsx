import { type ReactNode } from 'react'

import { useSyncActiveChainFromEvmWallet } from '@/hooks/connection/useSyncActiveChainFromEvmWallet'
import { useWalletQuerySync } from '@/hooks/connection/useWalletQuerySync'

/** Mount once under AppProviders to keep React Query + active chain in sync. */
export function WalletQuerySync({ children }: { children: ReactNode }) {
  useWalletQuerySync()
  useSyncActiveChainFromEvmWallet()
  return children
}
