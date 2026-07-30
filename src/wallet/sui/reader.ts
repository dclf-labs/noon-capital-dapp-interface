import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc'

import { suiMainnet } from '@/chains'
import { suiConfig } from '@/config'
import { appEnv, DEFAULT_SUI_RPC_URL } from '@/lib/env'

/**
 * Resolve Sui JSON-RPC URL.
 * Order: `VITE_SUI_RPC_URL` → protocol config → Mysten fullnode default.
 */
function resolveSuiRpcUrl(network: typeof suiMainnet.network = suiMainnet.network): string {
  if (appEnv.rpc.sui) return appEnv.rpc.sui
  if (network === 'mainnet' && suiConfig.rpcUrl) return suiConfig.rpcUrl
  return getJsonRpcFullnodeUrl(network) || DEFAULT_SUI_RPC_URL
}

export function getSuiClient(network: typeof suiMainnet.network = suiMainnet.network) {
  return new SuiJsonRpcClient({
    url: resolveSuiRpcUrl(network),
    network,
  })
}

export async function getSuiNativeBalance(address: string): Promise<bigint> {
  const client = getSuiClient()
  const balance = await client.getBalance({ owner: address })
  return BigInt(balance.totalBalance)
}
