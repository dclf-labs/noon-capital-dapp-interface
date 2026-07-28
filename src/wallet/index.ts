export { wagmiAdapter, wagmiConfig } from '@/wallet/evm/config'
export { getEthersBrowserProvider, getEthersSigner } from '@/wallet/evm/ethers'
export {
  getEthersJsonRpcProvider,
  getEvmNativeBalance,
  getEvmPublicClient,
} from '@/wallet/evm/reader'
export { createChainReader, getChainReader } from '@/wallet/readers'
export { getStarknetRpcProvider } from '@/wallet/starknet/reader'
export { useStarknetWallet } from '@/wallet/starknet/useStarknetWallet'
export { suiDAppKit } from '@/wallet/sui/config'
export { getSuiClient, getSuiNativeBalance } from '@/wallet/sui/reader'
export type { ChainReader, EvmWriteClient, MultiChainClient, WalletSession } from '@/wallet/types'
export { useMultiChainClient } from '@/wallet/useMultiChainClient'
