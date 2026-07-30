import { useMemo } from 'react'

import type { ProtocolChainId } from '@/config/chain-id'
import type { Address } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import { buildReadOnlyConnection } from '@/lib/wallet-session'

/**
 * Read-only session for bridge destinations / typed receivers.
 * Never sets `isConnected: true` — wallet SDKs alone authorize writes.
 */
export function useReadOnlySession(
  chainId: ProtocolChainId | undefined,
  address?: Address | string | undefined,
): EVMConnection {
  return useMemo(() => buildReadOnlyConnection({ chainId, address }), [address, chainId])
}

export default useReadOnlySession
