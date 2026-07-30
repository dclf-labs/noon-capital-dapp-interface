import { describe, expect, it } from 'vitest'

import starknetConfig from '@/config/chains/starknet'
import { getStarknetChainId, getSuiChainId } from '@/lib/chain'
import { clearUserScopedQueries, sameWalletAddress } from '@/lib/wallet-query-sync'
import {
  buildEvmConnection,
  buildReadOnlyConnection,
  buildStarknetConnection,
  buildSuiConnection,
  canWriteSession,
  composeActiveWalletSession,
  getChainFamily,
  type LiveFamilyAccounts,
  nextActiveChainFromEvmWalletChange,
  resolveActiveChain,
  toUnifiedConnection,
} from '@/lib/wallet-session'

const ETH = 1 as const
const VALID = '0x1111111111111111111111111111111111111111' as const
const SUI = `0x${'11'.repeat(32)}` as const
const STARKNET = `0x0${'a'.repeat(63)}` as const

describe('resolveActiveChain', () => {
  const disconnected = { isConnected: false as const }

  it('prefers a valid UI selection over a different connected EVM wallet chain', () => {
    const resolved = resolveActiveChain({
      selectedChainId: ETH,
      evm: { isConnected: true, chainId: 8453 },
      starknet: disconnected,
      sui: disconnected,
    })
    expect(resolved.chainId).toBe(ETH)
    expect(resolved.chainFamily).toBe('evm')
  })

  it('uses the connected EVM wallet network when selection is missing', () => {
    const resolved = resolveActiveChain({
      selectedChainId: null,
      evm: { isConnected: true, chainId: 8453 },
      starknet: disconnected,
      sui: disconnected,
    })
    expect(resolved.chainId).toBe(8453)
    expect(resolved.chainFamily).toBe('evm')
  })

  it('defaults to Ethereum when selection is missing and no EVM wallet is connected', () => {
    const resolved = resolveActiveChain({
      selectedChainId: null,
      evm: disconnected,
      starknet: disconnected,
      sui: disconnected,
    })
    expect(resolved.chainId).toBe(ETH)
    expect(resolved.chainFamily).toBe('evm')
  })

  it('honors Starknet / Sui UI selections', () => {
    const starknetId = getStarknetChainId()!
    const suiId = getSuiChainId()!

    expect(
      resolveActiveChain({
        selectedChainId: starknetId,
        evm: { isConnected: true, chainId: ETH },
        starknet: disconnected,
        sui: disconnected,
      }).chainFamily,
    ).toBe('starknet')

    expect(
      resolveActiveChain({
        selectedChainId: suiId,
        evm: { isConnected: true, chainId: ETH },
        starknet: disconnected,
        sui: disconnected,
      }).chainFamily,
    ).toBe('sui')
  })

  it('defaults to Ethereum when nothing is connected and selection is invalid', () => {
    const resolved = resolveActiveChain({
      selectedChainId: 999999 as never,
      evm: disconnected,
      starknet: disconnected,
      sui: disconnected,
    })
    expect(resolved.chainId).toBe(ETH)
    expect(resolved.chainFamily).toBe('evm')
  })
})

describe('nextActiveChainFromEvmWalletChange', () => {
  const starknetId = getStarknetChainId()!
  const suiId = getSuiChainId()!

  it('adopts wallet chain on first observation while dapp is on EVM', () => {
    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: ETH,
        walletChainId: 8453,
        previousWalletChainId: undefined,
        isEvmConnected: true,
      }).nextSelected,
    ).toBe(8453)
  })

  it('follows a subsequent wallet network change', () => {
    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: ETH,
        walletChainId: 8453,
        previousWalletChainId: ETH,
        isEvmConnected: true,
      }).nextSelected,
    ).toBe(8453)
  })

  it('does not overwrite a dapp EVM pick while wallet chain is unchanged', () => {
    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: 8453,
        walletChainId: ETH,
        previousWalletChainId: ETH,
        isEvmConnected: true,
      }).nextSelected,
    ).toBeNull()
  })

  it('does not override Starknet or Sui selections', () => {
    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: starknetId,
        walletChainId: 8453,
        previousWalletChainId: ETH,
        isEvmConnected: true,
      }).nextSelected,
    ).toBeNull()

    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: suiId,
        walletChainId: 8453,
        previousWalletChainId: ETH,
        isEvmConnected: true,
      }).nextSelected,
    ).toBeNull()
  })

  it('no-ops when already aligned or disconnected', () => {
    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: 8453,
        walletChainId: 8453,
        previousWalletChainId: ETH,
        isEvmConnected: true,
      }).nextSelected,
    ).toBeNull()

    expect(
      nextActiveChainFromEvmWalletChange({
        selectedChainId: ETH,
        walletChainId: 8453,
        previousWalletChainId: undefined,
        isEvmConnected: false,
      }).nextSelected,
    ).toBeNull()
  })
})

describe('multi-wallet connect + active chain switching', () => {
  const starknetId = getStarknetChainId()!
  const suiId = getSuiChainId()!

  /** User has MetaMask + Argent + Sui Wallet all connected at once. */
  const allConnected: LiveFamilyAccounts = {
    evm: {
      isConnected: true,
      address: VALID,
      connector: undefined,
      chainId: ETH,
    },
    starknet: {
      isConnected: true,
      address: STARKNET,
      connector: undefined,
      account: undefined,
      chainId: starknetId,
    },
    sui: {
      isConnected: true,
      address: SUI,
      connector: { id: 'sui', name: 'Sui' },
      account: { address: SUI },
      network: 'mainnet',
    },
  }

  function compose(selectedChainId: number | null) {
    return composeActiveWalletSession({
      selectedChainId,
      accounts: allConnected,
      starknetConfig,
    })
  }

  it('keeps all three family sessions live while switching the dapp active chain', () => {
    for (const selected of [ETH, 8453, starknetId, suiId, null] as const) {
      const { familySessions } = compose(selected)
      expect(familySessions.evm.isConnected).toBe(true)
      expect(familySessions.evm.address).toBe(VALID)
      expect(familySessions.starknet.isConnected).toBe(true)
      expect(familySessions.starknet.address).toBe(STARKNET)
      expect(familySessions.sui.isConnected).toBe(true)
      expect(familySessions.sui.address).toBe(SUI)
    }
  })

  it('points active session at EVM when the UI selects Ethereum', () => {
    const { resolved, active } = compose(ETH)
    expect(resolved.chainFamily).toBe('evm')
    expect(resolved.chainId).toBe(ETH)
    expect(active.chainFamily).toBe('evm')
    expect(active.activeChainId).toBe(ETH)
    expect(active.address).toBe(VALID)
    expect(active.isConnected).toBe(true)
    expect(canWriteSession(active)).toBe(true)
  })

  it('points active session at Starknet when the UI selects Starknet (EVM still connected)', () => {
    const { resolved, active, familySessions } = compose(starknetId)
    expect(resolved.chainFamily).toBe('starknet')
    expect(active.chainFamily).toBe('starknet')
    expect(active.activeChainId).toBe(starknetId)
    expect(active.address).toBe(STARKNET)
    expect(active.address).not.toBe(VALID)
    expect(canWriteSession(active)).toBe(true)
    expect(familySessions.evm.isConnected).toBe(true)
    expect(familySessions.sui.isConnected).toBe(true)
  })

  it('points active session at Sui when the UI selects Sui (EVM + Starknet still connected)', () => {
    const { resolved, active } = compose(suiId)
    expect(resolved.chainFamily).toBe('sui')
    expect(active.chainFamily).toBe('sui')
    expect(active.activeChainId).toBe(suiId)
    expect(active.address).toBe(SUI)
    expect(canWriteSession(active)).toBe(true)
  })

  it('switches active address across families without dropping other connections', () => {
    const eth = compose(ETH)
    const sn = compose(starknetId)
    const sui = compose(suiId)

    expect(eth.active.address).toBe(VALID)
    expect(sn.active.address).toBe(STARKNET)
    expect(sui.active.address).toBe(SUI)

    expect(eth.familySessions.evm.address).toBe(sn.familySessions.evm.address)
    expect(eth.familySessions.starknet.address).toBe(sui.familySessions.starknet.address)
    expect(eth.familySessions.sui.address).toBe(sn.familySessions.sui.address)
  })

  it('falls back to Ethereum when selection is cleared while all wallets are connected', () => {
    const { resolved, active } = compose(null)
    expect(resolved.chainFamily).toBe('evm')
    expect(resolved.chainId).toBe(ETH)
    expect(active.address).toBe(VALID)
  })

  it('marks active EVM unsupported when UI selects Base but wallet is still on Ethereum', () => {
    const { active, familySessions } = compose(8453)
    expect(active.chainFamily).toBe('evm')
    expect(active.activeChainId).toBe(8453)
    expect(active.config.id).toBe(8453)
    expect(active.unsupported).toBe(true)
    expect(canWriteSession(active)).toBe(false)
    expect(familySessions.evm.isConnected).toBe(true)
    expect(familySessions.evm.unsupported).toBe(false)
  })

  it('prefers UI Starknet over connected EVM/Sui wallets when selecting Starknet', () => {
    const resolved = resolveActiveChain({
      selectedChainId: starknetId,
      evm: { isConnected: true, chainId: 324 },
      starknet: { isConnected: true, chainId: starknetId },
      sui: { isConnected: true },
    })
    expect(resolved.chainId).toBe(starknetId)
    expect(resolved.chainFamily).toBe('starknet')
  })

  it('does not steal EVM address when active chain is Starknet but Starknet is disconnected', () => {
    const { active, familySessions } = composeActiveWalletSession({
      selectedChainId: starknetId,
      accounts: {
        ...allConnected,
        starknet: {
          isConnected: false,
          address: undefined,
          connector: undefined,
          account: undefined,
          chainId: undefined,
        },
      },
      starknetConfig,
    })
    expect(active.chainFamily).toBe('starknet')
    expect(active.isConnected).toBe(false)
    expect(active.address).toBeUndefined()
    expect(familySessions.evm.isConnected).toBe(true)
    expect(canWriteSession(active)).toBe(false)
  })

  it('updates active EVM address when the EVM account changes while on Ethereum', () => {
    const other = '0x2222222222222222222222222222222222222222' as const
    const before = composeActiveWalletSession({
      selectedChainId: ETH,
      accounts: allConnected,
      starknetConfig,
    })
    const after = composeActiveWalletSession({
      selectedChainId: ETH,
      accounts: {
        ...allConnected,
        evm: { ...allConnected.evm, address: other },
      },
      starknetConfig,
    })
    expect(before.active.address).toBe(VALID)
    expect(after.active.address).toBe(other)
    expect(after.familySessions.starknet.address).toBe(STARKNET)
  })
})

describe('getChainFamily', () => {
  it('maps chain ids to wallet families', () => {
    expect(getChainFamily(ETH)).toBe('evm')
    expect(getChainFamily(getStarknetChainId())).toBe('starknet')
    expect(getChainFamily(getSuiChainId())).toBe('sui')
    expect(getChainFamily(null)).toBe('evm')
  })
})

describe('buildEvmConnection', () => {
  it('requires a valid address to be connected', () => {
    const session = buildEvmConnection({
      isConnected: true,
      address: undefined,
      connector: undefined,
      connectedChainId: ETH,
    })
    expect(session.isConnected).toBe(false)
    expect(session.address).toBeUndefined()
  })

  it('clears session address when disconnected', () => {
    const session = buildEvmConnection({
      isConnected: false,
      address: VALID,
      connector: undefined,
      connectedChainId: ETH,
    })
    expect(session.isConnected).toBe(false)
    expect(session.address).toBeUndefined()
    expect(session.connectedChainId).toBeUndefined()
  })

  it('marks unsupported when wallet chain ≠ target', () => {
    const session = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: 324,
      targetChainId: ETH,
    })
    expect(session.isConnected).toBe(true)
    expect(session.unsupported).toBe(true)
    expect(session.config.id).toBe(ETH)
    expect(canWriteSession(session)).toBe(false)
  })

  it('allows writes when connected on the target chain', () => {
    const session = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: ETH,
      targetChainId: ETH,
    })
    expect(canWriteSession(session)).toBe(true)
  })

  it('marks unsupported for unknown wallet chains without a target', () => {
    const session = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: 999999 as never,
    })
    expect(session.unsupported).toBe(true)
  })
  it('uses a real config and marks unsupported when target is unknown without fallback', () => {
    const session = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: ETH,
      targetChainId: 999999 as never,
      fallbackToDefault: false,
    })
    expect(session.config.id).toBe(ETH)
    expect(session.unsupported).toBe(true)
    expect(canWriteSession(session)).toBe(false)
  })
})

describe('buildStarknetConnection', () => {
  it('requires a valid address and marks chain mismatches unsupported', () => {
    const ok = buildStarknetConnection({
      isConnected: true,
      address: STARKNET,
      connector: undefined,
      account: undefined,
      connectedChainId: starknetConfig.id,
      config: starknetConfig,
    })
    expect(ok.isConnected).toBe(true)
    expect(canWriteSession(ok)).toBe(true)

    const mismatch = buildStarknetConnection({
      isConnected: true,
      address: STARKNET,
      connector: undefined,
      account: undefined,
      connectedChainId: ETH,
      config: starknetConfig,
    })
    expect(mismatch.unsupported).toBe(true)
    expect(canWriteSession(mismatch)).toBe(false)

    const disconnected = buildStarknetConnection({
      isConnected: true,
      address: undefined,
      connector: undefined,
      account: undefined,
      connectedChainId: starknetConfig.id,
      config: starknetConfig,
    })
    expect(disconnected.isConnected).toBe(false)
  })
})

describe('buildReadOnlyConnection', () => {
  it('never claims to be connected', () => {
    const session = buildReadOnlyConnection({
      chainId: ETH,
      address: VALID,
    })
    expect(session.isConnected).toBe(false)
    expect(session.address).toBeTruthy()
    expect(canWriteSession(session)).toBe(false)
  })

  it('drops invalid pasted addresses', () => {
    const session = buildReadOnlyConnection({
      chainId: ETH,
      address: 'not-an-address',
    })
    expect(session.address).toBeUndefined()
  })
})

describe('toUnifiedConnection', () => {
  it('marks unsupported when wallet chain ≠ resolved product chain', () => {
    const family = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: 324,
    })
    const unified = toUnifiedConnection(
      family,
      { chainId: ETH, chainFamily: 'evm', config: family.config },
      { walletConnected: true, walletChainId: 324 },
    )
    expect(unified.unsupported).toBe(true)
    expect(unified.chainFamily).toBe('evm')
    expect(canWriteSession(unified)).toBe(false)
  })

  it('keeps a matching wallet writable', () => {
    const family = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: ETH,
      targetChainId: ETH,
    })
    const unified = toUnifiedConnection(
      family,
      { chainId: ETH, chainFamily: 'evm', config: family.config },
      { walletConnected: true, walletChainId: ETH },
    )
    expect(unified.chainFamily).toBe('evm')
    expect(unified.activeChainId).toBe(ETH)
    expect(unified.unsupported).toBe(false)
    expect(canWriteSession(unified)).toBe(true)
  })

  it('builds Starknet and Sui unified sessions with the product activeChainId', () => {
    const starknetId = getStarknetChainId()!
    const suiId = getSuiChainId()!

    const snFamily = buildStarknetConnection({
      isConnected: true,
      address: STARKNET,
      connector: undefined,
      account: undefined,
      connectedChainId: starknetId,
      config: starknetConfig,
    })
    const sn = toUnifiedConnection(
      snFamily,
      { chainId: starknetId, chainFamily: 'starknet', config: starknetConfig },
      { walletConnected: true, walletChainId: starknetId },
    )
    expect(sn.chainFamily).toBe('starknet')
    expect(sn.activeChainId).toBe(starknetId)
    expect(sn.unsupported).toBe(false)

    const suiFamily = buildSuiConnection({
      isConnected: true,
      address: SUI,
      connector: { id: 'sui', name: 'Sui' },
      account: { address: SUI },
      network: 'mainnet',
    })
    const sui = toUnifiedConnection(
      suiFamily,
      { chainId: suiId, chainFamily: 'sui', config: suiFamily.config },
      { walletConnected: true, walletChainId: suiFamily.connectedChainId },
    )
    expect(sui.chainFamily).toBe('sui')
    expect(sui.activeChainId).toBe(suiId)
    expect(sui.unsupported).toBe(false)
  })
})

describe('canWriteSession', () => {
  it('requires connected + valid address + supported chain', () => {
    expect(canWriteSession({ isConnected: true, unsupported: false, address: VALID })).toBe(true)
    expect(canWriteSession({ isConnected: false, unsupported: false, address: VALID })).toBe(false)
    expect(canWriteSession({ isConnected: true, unsupported: true, address: VALID })).toBe(false)
    expect(canWriteSession({ isConnected: true, unsupported: false, address: undefined })).toBe(
      false,
    )
    expect(canWriteSession({ isConnected: true, unsupported: false, address: 'nope' })).toBe(false)
  })
})

describe('buildSuiConnection', () => {
  it('marks unsupported on network mismatch', () => {
    const session = buildSuiConnection({
      isConnected: true,
      address: SUI,
      connector: undefined,
      account: { address: SUI },
      network: 'testnet',
      expectedNetwork: 'mainnet',
    })
    expect(session.isConnected).toBe(true)
    expect(session.unsupported).toBe(true)
    expect(canWriteSession(session)).toBe(false)
  })

  it('connects on mainnet with a valid Sui address', () => {
    const session = buildSuiConnection({
      isConnected: true,
      address: SUI,
      connector: { id: 'sui', name: 'Sui' },
      account: { address: SUI },
      network: 'mainnet',
    })
    expect(session.isConnected).toBe(true)
    expect(session.unsupported).toBe(false)
    expect(canWriteSession(session)).toBe(true)
  })
})

describe('wallet-query-sync helpers', () => {
  it('compares addresses case-insensitively', () => {
    expect(sameWalletAddress('0xAbC', '0xabc')).toBe(true)
    expect(sameWalletAddress(undefined, undefined)).toBe(true)
    expect(sameWalletAddress('0x1', undefined)).toBe(false)
  })

  it('clearUserScopedQueries does not throw', () => {
    expect(() => clearUserScopedQueries()).not.toThrow()
  })
})
