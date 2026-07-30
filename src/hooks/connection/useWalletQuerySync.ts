import { useEffect, useRef } from 'react'

import { useLiveWalletAccounts } from '@/hooks/connection/useWalletSession'
import { clearUserScopedQueries, sameWalletAddress } from '@/lib/wallet-query-sync'

/**
 * Watches live wallet addresses across families and clears user-scoped
 * React Query caches when any connected address changes or disconnects.
 * Mount once under AppProviders via `WalletQuerySync`.
 */
export function useWalletQuerySync(): void {
  const accounts = useLiveWalletAccounts()
  const prevRef = useRef<{
    evm?: string
    starknet?: string
    sui?: string
  } | null>(null)

  useEffect(() => {
    const next = {
      evm: accounts.evm.isConnected ? accounts.evm.address : undefined,
      starknet: accounts.starknet.isConnected ? accounts.starknet.address : undefined,
      sui: accounts.sui.isConnected ? accounts.sui.address : undefined,
    }

    if (prevRef.current === null) {
      prevRef.current = next
      return
    }

    const prev = prevRef.current
    const changed =
      !sameWalletAddress(prev.evm, next.evm) ||
      !sameWalletAddress(prev.starknet, next.starknet) ||
      !sameWalletAddress(prev.sui, next.sui)

    if (changed) {
      clearUserScopedQueries()
    }

    prevRef.current = next
  }, [
    accounts.evm.address,
    accounts.evm.isConnected,
    accounts.starknet.address,
    accounts.starknet.isConnected,
    accounts.sui.address,
    accounts.sui.isConnected,
  ])
}
