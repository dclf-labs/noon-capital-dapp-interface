import { type Config, getWalletClient } from '@wagmi/core'
import { BrowserProvider, type Eip1193Provider, type Signer } from 'ethers'

import { wagmiConfig } from '@/wallet/evm/config'

/**
 * ethers.js signer bound to the currently connected EVM wallet (via wagmi).
 * Returns null when no wallet is connected.
 */
export async function getEthersSigner(config: Config = wagmiConfig): Promise<Signer | null> {
  const walletClient = await getWalletClient(config)
  if (!walletClient) return null

  const provider = new BrowserProvider(walletClient.transport as unknown as Eip1193Provider)
  return provider.getSigner(walletClient.account.address)
}

export async function getEthersBrowserProvider(
  config: Config = wagmiConfig,
): Promise<BrowserProvider | null> {
  const walletClient = await getWalletClient(config)
  if (!walletClient) return null
  return new BrowserProvider(walletClient.transport as unknown as Eip1193Provider)
}
