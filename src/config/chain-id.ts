import { mainnet as starknetMainnetChain } from '@starknet-react/chains'

/** App-level Sui mainnet id (matches LayerZero V2 EID 30378). */
export const SUI_MAINNET_CHAIN_ID = 30378

/**
 * Numeric Starknet mainnet id used as protocol-config map keys.
 * Uses `Number(starknet-react mainnet.id)` (IEEE float; not SN_MAIN hex).
 */
export const STARKNET_MAINNET_CHAIN_ID = Number(starknetMainnetChain.id)

export type ProtocolChainId = number
/** Prefer importing `ChainId` from `@/lib/chain` in app code. */
export type ChainId = ProtocolChainId
export type EvmChainId = ProtocolChainId

export type WithdrawRequest = {
  amount: number
  timestamp: number
  status: string
  requestId: number
  claimed: boolean
}
