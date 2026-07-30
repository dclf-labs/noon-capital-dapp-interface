import { createDAppKit } from '@mysten/dapp-kit-react'
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc'

import { suiMainnet } from '@/chains'
import { suiConfig } from '@/config'
import { appEnv, DEFAULT_SUI_RPC_URL } from '@/lib/env'

export const SUI_DEFAULT_NETWORK = suiMainnet.network

/**
 * Resolve Sui JSON-RPC URL.
 * Order: `VITE_SUI_RPC_URL` → protocol config → Mysten fullnode default.
 */
function resolveSuiRpcUrl(network: typeof suiMainnet.network): string {
  if (appEnv.rpc.sui) return appEnv.rpc.sui
  if (network === 'mainnet' && suiConfig.rpcUrl) return suiConfig.rpcUrl
  return getJsonRpcFullnodeUrl(network) || DEFAULT_SUI_RPC_URL
}

export const suiDAppKit = createDAppKit({
  networks: [suiMainnet.network],
  defaultNetwork: SUI_DEFAULT_NETWORK,
  createClient(network) {
    return new SuiJsonRpcClient({
      url: resolveSuiRpcUrl(network),
      network,
    })
  },
})

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof suiDAppKit
  }
}
