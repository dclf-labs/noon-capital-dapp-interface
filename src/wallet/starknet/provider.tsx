import { type ReactNode, useMemo } from 'react'

import { mainnet } from '@starknet-react/chains'
import {
  braavos,
  infuraProvider,
  publicProvider,
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

/** Starknet-react provider: Infura when keyed, else public RPC. */
function createStarknetProvider() {
  const infuraKey = appEnv.rpc.starknetInfuraApiKey
  if (infuraKey) {
    return infuraProvider({ apiKey: infuraKey })
  }
  return publicProvider()
}

/**
 * Discovers injected Starknet wallets and always surfaces Ready (Argent) + Braavos,
 * matching old-dapp `useInjectedConnectors` behavior.
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
