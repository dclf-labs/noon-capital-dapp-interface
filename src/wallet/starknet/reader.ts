import { RpcProvider } from 'starknet'

import { starknetMainnet } from '@/chains'

let provider: RpcProvider | undefined

export function getStarknetRpcProvider(): RpcProvider {
  if (!provider) {
    provider = new RpcProvider({
      nodeUrl: starknetMainnet.rpcUrls[0],
    })
  }
  return provider
}

/**
 * Placeholder native-balance probe for Starknet.
 * ETH/STRK on Starknet are ERC-20s — bridge code should call token `balanceOf`
 * via this RpcProvider (or starknet-react `useReadContract`).
 */
export async function getStarknetNativeBalance(address: string): Promise<bigint> {
  const rpc = getStarknetRpcProvider()
  try {
    await rpc.getClassHashAt(address)
    return 0n
  } catch {
    return 0n
  }
}
