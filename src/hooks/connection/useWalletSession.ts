import { useEffect, useMemo } from 'react'

import { useCurrentAccount, useCurrentNetwork, useWalletConnection } from '@mysten/dapp-kit-react'
import { useAccount as useStarknetAccount } from '@starknet-react/core'
import { useAccount as useEvmAccount } from 'wagmi'

import starknetConfig from '@/config/chains/starknet'
import useUsername from '@/features/api/hooks/useUsername'
import { asChainId, type ChainId, getDefaultChainId, isValidChainId } from '@/lib/chain'
import type {
  EVMConnection,
  StarknetConnection,
  SuiConnection,
  UnifiedConnection,
} from '@/lib/connection'
import { getAvatar, getName } from '@/lib/user'
import {
  buildEvmConnection,
  type ChainFamily,
  composeActiveWalletSession,
  resolveActiveChain,
  type ResolvedChain,
} from '@/lib/wallet-session'
import { useActiveChainStore } from '@/state/active-chain'
import { wagmiAdapter } from '@/wallet/evm/config'

type LiveAccounts = ReturnType<typeof useLiveWalletAccounts>

/**
 * Live wallet accounts from AppKit / starknet-react / Sui dapp-kit.
 * Single subscription point for session composition.
 */
export function useLiveWalletAccounts() {
  const evmAccount = useEvmAccount({ config: wagmiAdapter.wagmiConfig })
  const starknetAccount = useStarknetAccount()
  const suiAccount = useCurrentAccount()
  const suiNetwork = useCurrentNetwork()
  const {
    wallet: suiWallet,
    status: suiStatus,
    isConnected: suiSdkConnected,
  } = useWalletConnection()

  return useMemo(() => {
    const evmConnected = Boolean(evmAccount.isConnected && evmAccount.address)
    const starknetConnected = Boolean(starknetAccount.isConnected && starknetAccount.address)
    const suiConnected =
      suiSdkConnected && suiStatus === 'connected' && Boolean(suiAccount?.address)

    return {
      evm: {
        isConnected: evmConnected,
        address: evmAccount.address,
        connector: evmAccount.connector,
        chainId: asChainId(evmAccount.chain?.id),
      },
      starknet: {
        isConnected: starknetConnected,
        address: starknetAccount.address,
        connector: starknetAccount.connector,
        chainId: asChainId(starknetAccount.chainId),
        account: starknetAccount.account,
      },
      sui: {
        isConnected: suiConnected,
        address: suiAccount?.address,
        connector: suiWallet
          ? { id: suiWallet.name, name: suiWallet.name, icon: suiWallet.icon }
          : undefined,
        account: suiAccount ? { address: suiAccount.address } : undefined,
        network: String(suiNetwork ?? ''),
      },
    }
  }, [
    evmAccount.isConnected,
    evmAccount.address,
    evmAccount.connector,
    evmAccount.chain?.id,
    starknetAccount.address,
    starknetAccount.chainId,
    starknetAccount.connector,
    starknetAccount.isConnected,
    starknetAccount.account,
    suiAccount,
    suiWallet,
    suiStatus,
    suiSdkConnected,
    suiNetwork,
  ])
}

function useResolvedChainFromAccounts(accounts: LiveAccounts): ResolvedChain {
  const selectedChainId = useActiveChainStore((s) => s.selectedChainId)
  const setSelectedChainId = useActiveChainStore((s) => s.setSelectedChainId)

  useEffect(() => {
    if (!isValidChainId(selectedChainId)) {
      setSelectedChainId(getDefaultChainId())
    }
  }, [selectedChainId, setSelectedChainId])

  return useMemo(
    () =>
      resolveActiveChain({
        selectedChainId: isValidChainId(selectedChainId) ? selectedChainId : getDefaultChainId(),
        evm: {
          isConnected: accounts.evm.isConnected,
          chainId: accounts.evm.chainId,
        },
        starknet: {
          isConnected: accounts.starknet.isConnected,
          chainId: accounts.starknet.chainId,
        },
        sui: { isConnected: accounts.sui.isConnected },
      }),
    [accounts, selectedChainId],
  )
}

/**
 * Resolve the product active chain from UI selection + live wallets.
 * Clears invalid Zustand selections in an effect (never inside render/memo).
 */
export function useResolvedChain(): ResolvedChain {
  const accounts = useLiveWalletAccounts()
  return useResolvedChainFromAccounts(accounts)
}

export type UseWalletSessionOptions =
  | { mode?: 'active' }
  | {
      mode: 'target'
      chainId: ChainId | undefined
      fallbackToDefault?: boolean
    }
  | { mode: 'family'; family: ChainFamily }

/**
 * Canonical wallet + chain session for product features.
 *
 * - `active` (default): session for the resolved active chain family
 * - `target`: live EVM wallet with config locked to `chainId` (mint/redeem/bridge source)
 * - `family`: live wallet for a specific family (buy/sell on Starknet, etc.)
 *
 * Wallet SDKs are the only signing authority. UI chain selection never implies connected.
 */
export function useWalletSession(options?: { mode?: 'active' }): UnifiedConnection
export function useWalletSession(options: {
  mode: 'target'
  chainId: ChainId | undefined
  fallbackToDefault?: boolean
}): EVMConnection & { chainFamily: 'evm'; activeChainId: ChainId }
export function useWalletSession(options: {
  mode: 'family'
  family: 'evm'
}): EVMConnection & { chainFamily: 'evm'; activeChainId: ChainId }
export function useWalletSession(options: {
  mode: 'family'
  family: 'starknet'
}): StarknetConnection & { chainFamily: 'starknet'; activeChainId: ChainId }
export function useWalletSession(options: {
  mode: 'family'
  family: 'sui'
}): SuiConnection & { chainFamily: 'sui'; activeChainId: ChainId }
export function useWalletSession(
  options: UseWalletSessionOptions = {},
):
  | UnifiedConnection
  | (EVMConnection & { chainFamily: 'evm'; activeChainId: ChainId })
  | (StarknetConnection & { chainFamily: 'starknet'; activeChainId: ChainId })
  | (SuiConnection & { chainFamily: 'sui'; activeChainId: ChainId }) {
  const mode = options.mode ?? 'active'
  const family = options.mode === 'family' ? options.family : undefined
  const targetChainId = options.mode === 'target' ? options.chainId : undefined
  const fallbackToDefault = options.mode === 'target' ? (options.fallbackToDefault ?? true) : true

  const accounts = useLiveWalletAccounts()
  const resolved = useResolvedChainFromAccounts(accounts)

  const usernameAddress =
    mode === 'family'
      ? family === 'evm'
        ? accounts.evm.address
        : undefined
      : mode === 'target'
        ? accounts.evm.address
        : resolved.chainFamily === 'evm'
          ? accounts.evm.address
          : undefined

  const username = useUsername({ address: usernameAddress })
  const displayName = getName(username.data)
  const avatar = getAvatar()

  return useMemo(() => {
    if (mode === 'target') {
      const evmSession = buildEvmConnection({
        isConnected: accounts.evm.isConnected,
        address: accounts.evm.address,
        connector: accounts.evm.connector,
        connectedChainId: accounts.evm.chainId,
        targetChainId,
        fallbackToDefault,
        name: displayName,
        avatar,
      })
      return {
        ...evmSession,
        chainFamily: 'evm' as const,
        activeChainId: evmSession.config.id,
      }
    }

    // Pass the already-resolved product chain so `active` tracks the dapp
    // selection while family sessions stay independently connected.
    const { active, familySessions } = composeActiveWalletSession({
      selectedChainId: resolved.chainId,
      accounts: {
        evm: {
          isConnected: accounts.evm.isConnected,
          address: accounts.evm.address,
          connector: accounts.evm.connector,
          chainId: accounts.evm.chainId,
        },
        starknet: {
          isConnected: accounts.starknet.isConnected,
          address: accounts.starknet.address,
          connector: accounts.starknet.connector,
          account: accounts.starknet.account,
          chainId: accounts.starknet.chainId,
        },
        sui: {
          isConnected: accounts.sui.isConnected,
          address: accounts.sui.address,
          connector: accounts.sui.connector,
          account: accounts.sui.account,
          network: accounts.sui.network,
        },
      },
      starknetConfig,
      name: displayName,
      avatar,
    })

    if (mode === 'family') {
      if (family === 'starknet') {
        return {
          ...familySessions.starknet,
          chainFamily: 'starknet' as const,
          activeChainId: familySessions.starknet.config.id,
        }
      }
      if (family === 'sui') {
        return {
          ...familySessions.sui,
          chainFamily: 'sui' as const,
          activeChainId: familySessions.sui.config.id,
        }
      }
      return {
        ...familySessions.evm,
        chainFamily: 'evm' as const,
        activeChainId: familySessions.evm.config.id,
      }
    }

    return active
  }, [accounts, avatar, displayName, fallbackToDefault, family, mode, resolved, targetChainId])
}

/** EVM wallet with config locked to a protocol chain (mint / redeem / stake / bridge source). */
export function useEvmTargetSession(
  chainId: ChainId | undefined,
  options?: { fallbackToDefault?: boolean },
): EVMConnection {
  return useWalletSession({
    mode: 'target',
    chainId,
    fallbackToDefault: options?.fallbackToDefault,
  })
}

export function useEvmFamilySession(): EVMConnection {
  return useWalletSession({ mode: 'family', family: 'evm' })
}

export function useStarknetFamilySession(): StarknetConnection {
  return useWalletSession({ mode: 'family', family: 'starknet' })
}

export function useSuiFamilySession(): SuiConnection {
  return useWalletSession({ mode: 'family', family: 'sui' })
}
