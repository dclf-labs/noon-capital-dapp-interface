import type { UseAccountResult } from '@starknet-react/core'
import type { UseAccountReturnType } from 'wagmi'

import type { Address } from '@/config/address'
import type { ProtocolChainId } from '@/config/chain-id'
import type { ProtocolChainConfig } from '@/config/types'
import { getChainConfig, getDefaultChainId } from '@/lib/chain'

export type { ProtocolChainConfig }

export enum TxnStatus {
  IDLE,
  PROCESSING,
  TXN_SUCCESS,
  TXN_FAILURE,
  TXN_SUBMITTED_ON_CHAIN,
}

export type EVMConnection = {
  name: string
  avatar: string
  unsupported: boolean
  address: UseAccountReturnType['address']
  connector: UseAccountReturnType['connector']
  /** Always a definite boolean — builders normalize SDK optionals. */
  isConnected: boolean
  account?: UseAccountReturnType | undefined
  config: ProtocolChainConfig
  /** Live wallet EIP-155 chain id when connected. */
  connectedChainId: ProtocolChainId | undefined
}

export type StarknetConnection = {
  name: string
  avatar: string
  unsupported: boolean
  address: UseAccountResult['address']
  connector: UseAccountResult['connector']
  /** Always a definite boolean — builders normalize SDK optionals. */
  isConnected: boolean
  account: UseAccountResult['account'] | undefined
  config: ProtocolChainConfig
  connectedChainId: ProtocolChainId | undefined
}

export type SuiConnection = {
  name: string
  avatar: string
  unsupported: boolean
  address: Address | undefined
  connector: { id: string; name: string; icon?: string } | undefined
  isConnected: boolean
  account: { address: string } | undefined
  config: ProtocolChainConfig
  connectedChainId: ProtocolChainId | undefined
}

/**
 * Active product session — discriminated by `chainFamily` so callers can narrow
 * without `as EVMConnection` casts.
 *
 * - `connectedChainId` — wallet's live network (when connected)
 * - `activeChainId` — dapp product network (`selectedChainId` / resolve)
 */
export type ActiveEvmConnection = EVMConnection & {
  chainFamily: 'evm'
  activeChainId: ProtocolChainId
}

export type ActiveStarknetConnection = StarknetConnection & {
  chainFamily: 'starknet'
  activeChainId: ProtocolChainId
}

export type ActiveSuiConnection = SuiConnection & {
  chainFamily: 'sui'
  activeChainId: ProtocolChainId
}

export type UnifiedConnection = ActiveEvmConnection | ActiveStarknetConnection | ActiveSuiConnection

/** @deprecated Prefer `UnifiedConnection` — kept for existing feature imports. */
export type Connection = UnifiedConnection

const disabledProtocolConfig = (): ProtocolChainConfig => getChainConfig(getDefaultChainId())

/** Disabled stub for hooks that always call EVM sub-hooks (rules of hooks). */
export const EMPTY_EVM_CONNECTION: EVMConnection = {
  name: '',
  avatar: '',
  unsupported: true,
  address: undefined,
  connector: undefined,
  isConnected: false,
  account: undefined,
  config: disabledProtocolConfig(),
  connectedChainId: undefined,
}

/** Disabled stub for hooks that always call Starknet sub-hooks (rules of hooks). */
export const EMPTY_STARKNET_CONNECTION: StarknetConnection = {
  name: '',
  avatar: '',
  unsupported: true,
  address: undefined,
  connector: undefined,
  isConnected: false,
  account: undefined,
  config: disabledProtocolConfig(),
  connectedChainId: undefined,
}

/** Disabled stub for hooks that always call Sui sub-hooks (rules of hooks). */
export const EMPTY_SUI_CONNECTION: SuiConnection = {
  name: '',
  avatar: '',
  unsupported: true,
  address: undefined,
  connector: undefined,
  isConnected: false,
  account: undefined,
  config: disabledProtocolConfig(),
  connectedChainId: undefined,
}

export function isActiveEvmConnection(
  connection: UnifiedConnection | undefined,
): connection is ActiveEvmConnection {
  return connection?.chainFamily === 'evm'
}

export function isActiveStarknetConnection(
  connection: UnifiedConnection | undefined,
): connection is ActiveStarknetConnection {
  return connection?.chainFamily === 'starknet'
}

export function isActiveSuiConnection(
  connection: UnifiedConnection | undefined,
): connection is ActiveSuiConnection {
  return connection?.chainFamily === 'sui'
}

export { canWriteSession } from '@/lib/wallet-session'
