import { type ReactNode, useMemo } from 'react'

import { mainnet } from '@starknet-react/chains'
import {
  braavos,
  jsonRpcProvider,
  ready,
  StarknetConfig,
  useInjectedConnectors,
  voyager,
} from '@starknet-react/core'

import { appEnv } from '@/lib/env'
import { queryClient } from '@/lib/query'

interface StarknetWalletProviderProps {
  children: ReactNode
}

/**
 * Starknet-react provider — always uses `appEnv.rpc.starknet` so explicit
 * `VITE_STARKNET_RPC_URL`, Infura-built URL, and the public Blast default stay aligned
 * with chain readers / protocol config. See `src/lib/env/README.md` and `src/wallet/README.md`.
 */
function createStarknetProvider() {
  const nodeUrl = appEnv.rpc.starknet
  return jsonRpcProvider({
    rpc: () => ({ nodeUrl }),
  })
}

/**
 * Discovers injected Starknet wallets and always surfaces Ready (Argent) + Braavos
 * via `useInjectedConnectors`.
 */
function StarknetConfigWithConnectors({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [ready(), braavos()],
    includeRecommended: 'always',
    order: 'alphabetical',
  })
  const provider = useMemo(() => createStarknetProvider(), [])

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={provider}
      connectors={connectors}
      explorer={voyager}
      queryClient={queryClient}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}

export function StarknetWalletProvider({ children }: StarknetWalletProviderProps) {
  return <StarknetConfigWithConnectors>{children}</StarknetConfigWithConnectors>
}
