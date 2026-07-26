import { createDAppKit } from '@mysten/dapp-kit-react'
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc'

import { suiMainnet } from '@/chains'

export const suiDAppKit = createDAppKit({
  networks: [suiMainnet.network],
  defaultNetwork: suiMainnet.network,
  createClient(network) {
    return new SuiJsonRpcClient({
      url: getJsonRpcFullnodeUrl(network),
      network,
    })
  },
})

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof suiDAppKit
  }
}

export function getSuiClient(network: typeof suiMainnet.network = suiMainnet.network) {
  return new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(network),
    network,
  })
}

export async function getSuiNativeBalance(address: string): Promise<bigint> {
  const client = getSuiClient()
  const balance = await client.getBalance({ owner: address })
  return BigInt(balance.totalBalance)
}
