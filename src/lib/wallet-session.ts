import type { ChainFamily } from '@/chains/types'
import type { Address } from '@/config/address'
import type { ProtocolChainId } from '@/config/chain-id'
import suiConfig from '@/config/chains/sui'
import { DEFAULT_AVATAR, DEFAULT_USERNAME } from '@/constants/api'
import { isAddressValid, isEVMAddressValid, isSuiAddressValid } from '@/lib/address'
import {
  type ChainId,
  getChainConfig,
  getChainConfigWithoutFallback,
  getDefaultChainId,
  getSupportedChainIds,
  isEvmChainId,
  isStarknetChain,
  isSuiChain,
  isValidChainId,
} from '@/lib/chain'
import type {
  ActiveEvmConnection,
  ActiveStarknetConnection,
  ActiveSuiConnection,
  EVMConnection,
  ProtocolChainConfig,
  StarknetConnection,
  SuiConnection,
  UnifiedConnection,
} from '@/lib/connection'

export type { ChainFamily }

export type ResolvedChain =
  | { chainId: ChainId; chainFamily: 'evm'; config: ProtocolChainConfig }
  | { chainId: ChainId; chainFamily: 'starknet'; config: ProtocolChainConfig }
  | { chainId: ChainId; chainFamily: 'sui'; config: ProtocolChainConfig }

export type WalletPresence = {
  isConnected: boolean
  address?: string
  chainId?: ChainId
}

export type ResolveActiveChainInput = {
  /** UI selection from Zustand — never treated as signing authority alone. */
  selectedChainId: ChainId | null
  evm: WalletPresence
  starknet: WalletPresence
  sui: WalletPresence
}

/**
 * Pure active-chain resolution (no React / no store writes).
 *
 * Priority:
 * 1. Valid UI selection (persisted dapp network — source of truth while set)
 * 2. Connected EVM wallet network (when nothing valid is selected yet)
 * 3. Default Ethereum
 *
 * While an EVM selection is set, the store wins so a dapp→wallet switch can
 * pend without being overwritten. Wallet→dapp updates go through
 * `nextActiveChainFromEvmWalletChange` + the sync hook into the store.
 */
export function resolveActiveChain(input: ResolveActiveChainInput): ResolvedChain {
  const { selectedChainId, evm } = input

  if (isValidChainId(selectedChainId)) {
    return toResolved(selectedChainId)
  }

  if (evm.isConnected && isValidChainId(evm.chainId) && isEvmChainId(evm.chainId)) {
    return toResolved(evm.chainId)
  }

  return toResolved(getDefaultChainId())
}

export type EvmWalletActiveChainSyncInput = {
  selectedChainId: ChainId | null
  walletChainId: ChainId | undefined
  /** Last observed wallet chain (undefined = not yet observed / disconnected). */
  previousWalletChainId: ChainId | undefined
  isEvmConnected: boolean
}

/**
 * Decide whether an EVM wallet observation should update the dapp active network.
 *
 * Rules:
 * - Non-EVM dapp selection (Starknet / Sui) is sticky — never overridden here
 * - Only react when the wallet chain **changes** (connect, disconnect→reconnect, or switch)
 *   so a dapp-initiated EVM pick is not immediately overwritten while switchChain pends
 * - On connect / wallet switch while dapp is in EVM mode → follow the wallet
 */
export function nextActiveChainFromEvmWalletChange(input: EvmWalletActiveChainSyncInput): {
  nextSelected: ChainId | null
  nextPrevious: ChainId | undefined
} {
  const walletChain =
    input.isEvmConnected && isValidChainId(input.walletChainId) && isEvmChainId(input.walletChainId)
      ? input.walletChainId
      : undefined

  const nextPrevious = walletChain

  if (walletChain === undefined) {
    return { nextSelected: null, nextPrevious }
  }

  const prev = input.previousWalletChainId
  const walletChanged = prev === undefined || Number(prev) !== Number(walletChain)
  if (!walletChanged) {
    return { nextSelected: null, nextPrevious }
  }

  // Starknet / Sui product selection must not be yanked by MetaMask switches.
  if (isValidChainId(input.selectedChainId) && !isEvmChainId(input.selectedChainId)) {
    return { nextSelected: null, nextPrevious }
  }

  if (Number(input.selectedChainId) === Number(walletChain)) {
    return { nextSelected: null, nextPrevious }
  }

  return { nextSelected: walletChain, nextPrevious }
}

function toResolved(chainId: ChainId): ResolvedChain {
  const config = getChainConfig(chainId)
  if (isStarknetChain(chainId)) {
    return { chainId, chainFamily: 'starknet', config }
  }
  if (isSuiChain(chainId)) {
    return { chainId, chainFamily: 'sui', config }
  }
  return { chainId, chainFamily: 'evm', config }
}

export function getChainFamily(chainId: ChainId | null | undefined): ChainFamily {
  if (isStarknetChain(chainId)) return 'starknet'
  if (isSuiChain(chainId)) return 'sui'
  return 'evm'
}

/**
 * A session may authorize writes only when the SDK reports connected,
 * an address is present and valid for the family, and the wallet is on the
 * expected chain (when a target is set).
 */
export function canWriteSession(connection: {
  isConnected: boolean
  unsupported: boolean
  address: string | undefined
}): boolean {
  return (
    connection.isConnected &&
    !connection.unsupported &&
    Boolean(connection.address) &&
    isAddressValid(connection.address as Address | undefined)
  )
}

type BuildEvmParams = {
  isConnected: boolean
  address: EVMConnection['address']
  connector: EVMConnection['connector']
  connectedChainId: ProtocolChainId | undefined
  /** Protocol config the UI/actions target (may differ from wallet chain). */
  targetChainId?: ProtocolChainId | null
  fallbackToDefault?: boolean
  name?: string
  avatar?: string
}

/** Live EVM wallet session. `unsupported` when connected to a non-target / unknown chain. */
export function buildEvmConnection(params: BuildEvmParams): EVMConnection {
  const {
    address,
    connector,
    connectedChainId,
    targetChainId,
    fallbackToDefault = true,
    name = DEFAULT_USERNAME,
    avatar = DEFAULT_AVATAR,
  } = params

  const addressOk = isEVMAddressValid(address)
  const isConnected = Boolean(params.isConnected && addressOk)

  let config: ProtocolChainConfig
  let missingTargetConfig = false
  if (targetChainId !== undefined) {
    if (fallbackToDefault) {
      config = getChainConfig(targetChainId)
    } else {
      const exact = getChainConfigWithoutFallback(targetChainId)
      if (exact) {
        config = exact
      } else {
        missingTargetConfig = true
        config = getChainConfig(getDefaultChainId())
      }
    }
  } else {
    config = getChainConfig(connectedChainId ?? getDefaultChainId())
  }

  const supportedIds = getSupportedChainIds()
  let unsupported = missingTargetConfig
  if (!unsupported && isConnected && connectedChainId !== undefined) {
    if (targetChainId !== undefined && targetChainId !== null) {
      unsupported = Number(connectedChainId) !== Number(targetChainId)
    } else {
      unsupported = !supportedIds.includes(connectedChainId)
    }
  }

  return {
    isConnected,
    // Only expose a session address while the SDK reports a live connection.
    address: isConnected ? address : undefined,
    connector: isConnected ? connector : undefined,
    name,
    avatar,
    connectedChainId: isConnected ? connectedChainId : undefined,
    config,
    unsupported,
  }
}

type BuildStarknetParams = {
  isConnected: boolean
  address: StarknetConnection['address']
  connector: StarknetConnection['connector']
  account: StarknetConnection['account']
  connectedChainId: ProtocolChainId | undefined
  config: ProtocolChainConfig
  name?: string
  avatar?: string
}

export function buildStarknetConnection(params: BuildStarknetParams): StarknetConnection {
  const addressOk = Boolean(params.address && isAddressValid(params.address as Address))
  const isConnected = Boolean(params.isConnected && addressOk)
  const unsupported =
    isConnected &&
    params.connectedChainId !== undefined &&
    Number(params.connectedChainId) !== Number(params.config.id)

  return {
    isConnected,
    address: isConnected ? params.address : undefined,
    connector: isConnected ? params.connector : undefined,
    account: isConnected ? params.account : undefined,
    name: params.name ?? DEFAULT_USERNAME,
    avatar: params.avatar ?? DEFAULT_AVATAR,
    connectedChainId: isConnected ? params.connectedChainId : undefined,
    config: params.config,
    unsupported,
  }
}

type BuildSuiParams = {
  isConnected: boolean
  address: string | undefined
  connector: SuiConnection['connector']
  account: SuiConnection['account']
  /** Optional network label from dapp-kit (e.g. "mainnet"). */
  network?: string
  expectedNetwork?: string
  name?: string
  avatar?: string
}

export function buildSuiConnection(params: BuildSuiParams): SuiConnection {
  const addressOk = Boolean(params.address && isSuiAddressValid(params.address))
  const isConnected = Boolean(params.isConnected && addressOk)
  const expectedNetwork = params.expectedNetwork ?? 'mainnet'
  const unsupported =
    isConnected &&
    Boolean(params.network) &&
    String(params.network).toLowerCase() !== expectedNetwork.toLowerCase()

  return {
    isConnected,
    address: isConnected ? (params.address as Address) : undefined,
    connector: isConnected ? params.connector : undefined,
    account: isConnected ? params.account : undefined,
    name: params.name ?? DEFAULT_USERNAME,
    avatar: params.avatar ?? DEFAULT_AVATAR,
    connectedChainId: isConnected ? suiConfig.id : undefined,
    config: suiConfig,
    unsupported,
  }
}

type BuildReadOnlyParams = {
  chainId: ProtocolChainId | undefined
  address?: string | undefined
  name?: string
  avatar?: string
}

/**
 * Explicit non-wallet context (bridge destination / typed receiver).
 * Never sets `isConnected: true` — reads only.
 */
export function buildReadOnlyConnection(params: BuildReadOnlyParams): EVMConnection {
  const chainId = params.chainId ?? getDefaultChainId()
  const addressOk = Boolean(params.address && isAddressValid(params.address as Address))

  return {
    isConnected: false,
    address: addressOk ? (params.address as EVMConnection['address']) : undefined,
    connector: undefined,
    name: params.name ?? DEFAULT_USERNAME,
    avatar: params.avatar ?? DEFAULT_AVATAR,
    connectedChainId: chainId,
    config: getChainConfig(chainId),
    unsupported: false,
  }
}

/**
 * Attach active-chain metadata for the unified facade.
 * Marks `unsupported` when the live wallet chain ≠ resolved product chain.
 */
export function toUnifiedConnection(
  familySession: EVMConnection,
  resolved: ResolvedChain & { chainFamily: 'evm' },
  options?: { walletChainId?: ProtocolChainId | undefined; walletConnected?: boolean },
): ActiveEvmConnection
export function toUnifiedConnection(
  familySession: StarknetConnection,
  resolved: ResolvedChain & { chainFamily: 'starknet' },
  options?: { walletChainId?: ProtocolChainId | undefined; walletConnected?: boolean },
): ActiveStarknetConnection
export function toUnifiedConnection(
  familySession: SuiConnection,
  resolved: ResolvedChain & { chainFamily: 'sui' },
  options?: { walletChainId?: ProtocolChainId | undefined; walletConnected?: boolean },
): ActiveSuiConnection
export function toUnifiedConnection(
  familySession: EVMConnection | StarknetConnection | SuiConnection,
  resolved: ResolvedChain,
  options?: { walletChainId?: ProtocolChainId | undefined; walletConnected?: boolean },
): UnifiedConnection {
  const walletConnected = options?.walletConnected ?? familySession.isConnected
  const walletChainId = options?.walletChainId ?? familySession.connectedChainId
  const chainMismatch =
    walletConnected &&
    walletChainId !== undefined &&
    Number(walletChainId) !== Number(resolved.chainId)
  const unsupported = familySession.unsupported || chainMismatch

  if (resolved.chainFamily === 'starknet') {
    return {
      ...(familySession as StarknetConnection),
      chainFamily: 'starknet',
      activeChainId: resolved.chainId,
      config: resolved.config,
      unsupported,
    }
  }

  if (resolved.chainFamily === 'sui') {
    return {
      ...(familySession as SuiConnection),
      chainFamily: 'sui',
      activeChainId: resolved.chainId,
      config: resolved.config,
      address: familySession.address as Address | undefined,
      unsupported,
    }
  }

  return {
    ...(familySession as EVMConnection),
    chainFamily: 'evm',
    activeChainId: resolved.chainId,
    config: resolved.config,
    unsupported,
  }
}

/** Live SDK accounts for all families — may all be connected at once. */
export type LiveFamilyAccounts = {
  evm: {
    isConnected: boolean
    address: EVMConnection['address']
    connector?: EVMConnection['connector']
    chainId: ProtocolChainId | undefined
  }
  starknet: {
    isConnected: boolean
    address: StarknetConnection['address']
    connector?: StarknetConnection['connector']
    account?: StarknetConnection['account']
    chainId: ProtocolChainId | undefined
  }
  sui: {
    isConnected: boolean
    address: string | undefined
    connector?: SuiConnection['connector']
    account?: SuiConnection['account']
    network?: string
  }
}

export type ComposedWalletSessions = {
  /** Product active chain from UI selection + live wallets. */
  resolved: ResolvedChain
  /**
   * Session for the **active** product chain only.
   * Address / isConnected come from that chain's family wallet — not from
   * whichever wallet happened to connect first.
   */
  active: UnifiedConnection
  /** Independent per-family sessions — stay live while the user switches chains. */
  familySessions: {
    evm: EVMConnection
    starknet: StarknetConnection
    sui: SuiConnection
  }
}

/**
 * Compose multi-wallet state the way the dapp shell does:
 * - Keep all three family sessions independently connected
 * - Point `active` at the UI-selected (or fallback) product chain's family
 *
 * Pure — used by `useWalletSession` and unit-tested for switch bugs.
 */
export function composeActiveWalletSession(params: {
  selectedChainId: ChainId | null
  accounts: LiveFamilyAccounts
  /** Starknet protocol config (injected so tests can use the real config). */
  starknetConfig: ProtocolChainConfig
  name?: string
  avatar?: string
}): ComposedWalletSessions {
  const { selectedChainId, accounts, starknetConfig, name, avatar } = params

  const resolved = resolveActiveChain({
    selectedChainId,
    evm: { isConnected: accounts.evm.isConnected, chainId: accounts.evm.chainId },
    starknet: {
      isConnected: accounts.starknet.isConnected,
      chainId: accounts.starknet.chainId,
    },
    sui: { isConnected: accounts.sui.isConnected },
  })

  const familySessions = {
    evm: buildEvmConnection({
      isConnected: accounts.evm.isConnected,
      address: accounts.evm.address,
      connector: accounts.evm.connector,
      connectedChainId: accounts.evm.chainId,
      name,
      avatar,
    }),
    starknet: buildStarknetConnection({
      isConnected: accounts.starknet.isConnected,
      address: accounts.starknet.address,
      connector: accounts.starknet.connector,
      account: accounts.starknet.account,
      connectedChainId: accounts.starknet.chainId,
      config: starknetConfig,
      name,
      avatar,
    }),
    sui: buildSuiConnection({
      isConnected: accounts.sui.isConnected,
      address: accounts.sui.address,
      connector: accounts.sui.connector,
      account: accounts.sui.account,
      network: accounts.sui.network,
      name,
      avatar,
    }),
  }

  let active: UnifiedConnection
  if (resolved.chainFamily === 'starknet') {
    active = toUnifiedConnection(familySessions.starknet, resolved, {
      walletConnected: accounts.starknet.isConnected,
      walletChainId: accounts.starknet.chainId,
    })
  } else if (resolved.chainFamily === 'sui') {
    active = toUnifiedConnection(familySessions.sui, resolved, {
      walletConnected: accounts.sui.isConnected,
      walletChainId: familySessions.sui.connectedChainId,
    })
  } else {
    active = toUnifiedConnection(familySessions.evm, resolved, {
      walletConnected: accounts.evm.isConnected,
      walletChainId: accounts.evm.chainId,
    })
  }

  return { resolved, active, familySessions }
}
