/**
 * Chain families supported by Noon Capital.
 * Bridge flows need cross-family reads even when only one wallet is active.
 */
export type ChainFamily = 'evm' | 'starknet' | 'sui'

/** Stable app-level chain keys (not raw chain IDs). */
export type ChainKey =
  | 'ethereum'
  | 'tac'
  | 'zksync'
  | 'hyperevm'
  | 'citrea'
  | 'base'
  | 'sophon'
  | 'berachain'
  | 'sui'
  | 'starknet'

export type EvmChainKey = Extract<
  ChainKey,
  'ethereum' | 'tac' | 'zksync' | 'hyperevm' | 'citrea' | 'base' | 'sophon' | 'berachain'
>

export interface NativeCurrency {
  name: string
  symbol: string
  decimals: number
}

interface ChainDefinitionBase {
  key: ChainKey
  family: ChainFamily
  name: string
  shortName: string
  nativeCurrency: NativeCurrency
  explorerUrl?: string
  isTestnet?: boolean
}

export interface EvmChainDefinition extends ChainDefinitionBase {
  family: 'evm'
  key: EvmChainKey
  /** EIP-155 chain id */
  chainId: number
  rpcUrls: readonly string[]
}

export interface StarknetChainDefinition extends ChainDefinitionBase {
  family: 'starknet'
  key: 'starknet'
  /** Starknet chain id hex, e.g. SN_MAIN */
  chainId: string
  rpcUrls: readonly string[]
}

export interface SuiChainDefinition extends ChainDefinitionBase {
  family: 'sui'
  key: 'sui'
  network: 'mainnet' | 'testnet' | 'devnet' | 'localnet'
  rpcUrls: readonly string[]
}

export type ChainDefinition = EvmChainDefinition | StarknetChainDefinition | SuiChainDefinition

export function isEvmChain(chain: ChainDefinition): chain is EvmChainDefinition {
  return chain.family === 'evm'
}

export function isStarknetChain(chain: ChainDefinition): chain is StarknetChainDefinition {
  return chain.family === 'starknet'
}

export function isSuiChain(chain: ChainDefinition): chain is SuiChainDefinition {
  return chain.family === 'sui'
}
