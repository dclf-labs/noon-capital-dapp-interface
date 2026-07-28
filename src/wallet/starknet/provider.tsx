import { type ReactNode, useMemo } from 'react'

import { mainnet } from '@starknet-react/chains'
import {
  argent,
  braavos,
  type Connector,
  publicProvider,
  StarknetConfig,
} from '@starknet-react/core'

import { queryClient } from '@/lib/query'

interface StarknetWalletProviderProps {
  children: ReactNode
}

export function StarknetWalletProvider({ children }: StarknetWalletProviderProps) {
  const connectors = useMemo<Connector[]>(() => [argent(), braavos()], [])

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={publicProvider()}
      connectors={connectors}
      queryClient={queryClient}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}
