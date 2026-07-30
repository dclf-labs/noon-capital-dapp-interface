import { type ReactNode, useMemo } from 'react'

import { mainnet } from '@starknet-react/chains'
import {
  alchemyProvider,
  argent,
  braavos,
  type Connector,
  publicProvider,
  StarknetConfig,
} from '@starknet-react/core'

import { appEnv } from '@/lib/env'
import { queryClient } from '@/lib/query'

interface StarknetWalletProviderProps {
  children: ReactNode
}

/** Starknet-react provider: Alchemy when keyed, else public RPC. */
function createStarknetProvider() {
  const alchemyKey = appEnv.rpc.starknetAlchemyApiKey
  if (alchemyKey) {
    return alchemyProvider({ apiKey: alchemyKey })
  }
  return publicProvider()
}

export function StarknetWalletProvider({ children }: StarknetWalletProviderProps) {
  const connectors = useMemo<Connector[]>(() => [argent(), braavos()], [])
  const provider = useMemo(() => createStarknetProvider(), [])

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={provider}
      connectors={connectors}
      queryClient={queryClient}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}
