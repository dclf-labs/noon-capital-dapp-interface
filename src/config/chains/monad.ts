import { monad } from 'wagmi/chains'

import type { ProtocolChainConfig } from '@/config/types'

export const config: ProtocolChainConfig = {
  id: monad.id,
  name: monad.name,
  iconSlug: 'monad',
  explorerUrl: 'https://monadscan.com',
  rpcUrl: 'https://rpc.monad.xyz',
  contractExplorerUrl: 'https://monadscan.com/address',
  tokenExplorerUrl: 'https://monadscan.com/contract',
  transactionExplorerUrl: 'https://monadscan.com/tx',
  addressExplorerUrl: 'https://monadscan.com/address',
}

export default config
