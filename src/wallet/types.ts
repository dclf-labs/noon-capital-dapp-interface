import type { ChainFamily, ChainKey, EvmChainKey } from '@/chains/types'

/** Connected wallet session for one chain family (EVM / Starknet / Sui). */
export interface WalletSession {
  family: ChainFamily
  address: string | undefined
  isConnected: boolean
  /** Active network label when known (EVM chain id, SN_MAIN, sui mainnet, …). */
  networkLabel?: string
}

/** Read-only chain access — usable without a connected wallet (bridge / quotes). */
export interface ChainReader {
  chainKey: ChainKey
  family: ChainFamily
  getNativeBalance(address: string): Promise<bigint>
}

/** EVM-specific write surface (wagmi + ethers). */
export interface EvmWriteClient {
  chainKey: EvmChainKey
  /** viem wallet client sendTransaction / writeContract via wagmi when connected */
  getConnectedAddress(): string | undefined
}

/**
 * Multi-chain facade used by bridge and product features.
 * Wallet sessions and readers are independent so you can read Sui while
 * the active wallet is EVM (and vice versa).
 */
export interface MultiChainClient {
  getWalletSession(family: ChainFamily): WalletSession
  getReader(chainKey: ChainKey): ChainReader
  listConnectedAddresses(): Partial<Record<ChainFamily, string>>
}
