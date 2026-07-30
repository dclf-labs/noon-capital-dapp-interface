import { describe, expect, it } from 'vitest'

import starknetConfig from '@/config/chains/starknet'
import { getChainConfig, getStarknetChainId, getSuiChainId } from '@/lib/chain'
import {
  canWriteSession,
  composeActiveWalletSession,
  type LiveFamilyAccounts,
  nextActiveChainFromEvmWalletChange,
  resolveActiveChain,
} from '@/lib/wallet-session'

/**
 * Product-contract scenarios for active network + multi-wallet behavior.
 * These encode the rules the dapp must keep consistent across pages.
 */

const ETH = 1
const BASE = 8453
const VALID = '0x1111111111111111111111111111111111111111' as const
const SUI = `0x${'11'.repeat(32)}` as const
const STARKNET = `0x0${'a'.repeat(63)}` as const

const disconnected = { isConnected: false as const }

function accounts(overrides?: Partial<LiveFamilyAccounts>): LiveFamilyAccounts {
  const starknetId = getStarknetChainId()!
  return {
    evm: {
      isConnected: true,
      address: VALID,
      connector: undefined,
      chainId: ETH,
      ...overrides?.evm,
    },
    starknet: {
      isConnected: true,
      address: STARKNET,
      connector: undefined,
      account: undefined,
      chainId: starknetId,
      ...overrides?.starknet,
    },
    sui: {
      isConnected: true,
      address: SUI,
      connector: { id: 'sui', name: 'Sui' },
      account: { address: SUI },
      network: 'mainnet',
      ...overrides?.sui,
    },
  }
}

describe('active network product scenarios', () => {
  const starknetId = getStarknetChainId()!
  const suiId = getSuiChainId()!

  describe('default / missing selection', () => {
    it('uses Ethereum when nothing is selected and no EVM wallet is connected', () => {
      const resolved = resolveActiveChain({
        selectedChainId: null,
        evm: disconnected,
        starknet: disconnected,
        sui: disconnected,
      })
      expect(resolved).toMatchObject({ chainId: ETH, chainFamily: 'evm' })
    })

    it('uses the EVM wallet network when nothing is selected but wallet is connected', () => {
      const resolved = resolveActiveChain({
        selectedChainId: null,
        evm: { isConnected: true, chainId: BASE },
        starknet: disconnected,
        sui: disconnected,
      })
      expect(resolved).toMatchObject({ chainId: BASE, chainFamily: 'evm' })
    })

    it('ignores an invalid selection and falls back (wallet wins when connected)', () => {
      const withWallet = resolveActiveChain({
        selectedChainId: 999999 as never,
        evm: { isConnected: true, chainId: BASE },
        starknet: disconnected,
        sui: disconnected,
      })
      expect(withWallet.chainId).toBe(BASE)

      const withoutWallet = resolveActiveChain({
        selectedChainId: 999999 as never,
        evm: disconnected,
        starknet: disconnected,
        sui: disconnected,
      })
      expect(withoutWallet.chainId).toBe(ETH)
    })
  })

  describe('EVM wallet drives dapp while in EVM mode', () => {
    it('adopts wallet chain on first connect observation', () => {
      const { nextSelected, nextPrevious } = nextActiveChainFromEvmWalletChange({
        selectedChainId: ETH,
        walletChainId: BASE,
        previousWalletChainId: undefined,
        isEvmConnected: true,
      })
      expect(nextSelected).toBe(BASE)
      expect(nextPrevious).toBe(BASE)
    })

    it('follows Ethereum → Base in the wallet', () => {
      expect(
        nextActiveChainFromEvmWalletChange({
          selectedChainId: ETH,
          walletChainId: BASE,
          previousWalletChainId: ETH,
          isEvmConnected: true,
        }).nextSelected,
      ).toBe(BASE)
    })

    it('follows Base → Ethereum in the wallet', () => {
      expect(
        nextActiveChainFromEvmWalletChange({
          selectedChainId: BASE,
          walletChainId: ETH,
          previousWalletChainId: BASE,
          isEvmConnected: true,
        }).nextSelected,
      ).toBe(ETH)
    })

    it('ignores unknown / unsupported wallet chain ids', () => {
      expect(
        nextActiveChainFromEvmWalletChange({
          selectedChainId: ETH,
          walletChainId: 999999 as never,
          previousWalletChainId: ETH,
          isEvmConnected: true,
        }).nextSelected,
      ).toBeNull()
    })
  })

  describe('dapp EVM pick vs pending wallet switch', () => {
    it('keeps a dapp Base pick while MetaMask is still on Ethereum', () => {
      // User clicked Base; store is Base; wallet unchanged → do not snap back to ETH.
      expect(
        nextActiveChainFromEvmWalletChange({
          selectedChainId: BASE,
          walletChainId: ETH,
          previousWalletChainId: ETH,
          isEvmConnected: true,
        }).nextSelected,
      ).toBeNull()

      const resolved = resolveActiveChain({
        selectedChainId: BASE,
        evm: { isConnected: true, chainId: ETH },
        starknet: disconnected,
        sui: disconnected,
      })
      expect(resolved.chainId).toBe(BASE)

      const { active } = composeActiveWalletSession({
        selectedChainId: BASE,
        accounts: accounts({ evm: { isConnected: true, address: VALID, chainId: ETH } }),
        starknetConfig,
      })
      expect(active.activeChainId).toBe(BASE)
      expect(active.unsupported).toBe(true)
      expect(canWriteSession(active)).toBe(false)
    })

    it('clears unsupported once wallet catches up to the dapp pick', () => {
      const { active } = composeActiveWalletSession({
        selectedChainId: BASE,
        accounts: accounts({ evm: { isConnected: true, address: VALID, chainId: BASE } }),
        starknetConfig,
      })
      expect(active.unsupported).toBe(false)
      expect(canWriteSession(active)).toBe(true)
    })
  })

  describe('non-EVM selections are sticky', () => {
    it.each([
      ['Starknet', () => starknetId, 'starknet'] as const,
      ['Sui', () => suiId, 'sui'] as const,
    ])('keeps %s selected when MetaMask switches chains', (_label, id, family) => {
      const selected = id()
      expect(
        nextActiveChainFromEvmWalletChange({
          selectedChainId: selected,
          walletChainId: BASE,
          previousWalletChainId: ETH,
          isEvmConnected: true,
        }).nextSelected,
      ).toBeNull()

      const resolved = resolveActiveChain({
        selectedChainId: selected,
        evm: { isConnected: true, chainId: BASE },
        starknet: { isConnected: true, chainId: starknetId },
        sui: { isConnected: true },
      })
      expect(resolved.chainFamily).toBe(family)
      expect(resolved.chainId).toBe(selected)
    })

    it('returns to following the EVM wallet after leaving Starknet for Ethereum', () => {
      // Leaving Starknet: store set to ETH. First wallet observation after that may already be ETH.
      expect(
        nextActiveChainFromEvmWalletChange({
          selectedChainId: ETH,
          walletChainId: BASE,
          previousWalletChainId: undefined,
          isEvmConnected: true,
        }).nextSelected,
      ).toBe(BASE)
    })
  })

  describe('multi-wallet consistency across the dapp', () => {
    it('active session always tracks the product selection, not whichever wallet connected first', () => {
      const live = accounts()

      const onEth = composeActiveWalletSession({
        selectedChainId: ETH,
        accounts: live,
        starknetConfig,
      })
      const onSn = composeActiveWalletSession({
        selectedChainId: starknetId,
        accounts: live,
        starknetConfig,
      })
      const onSui = composeActiveWalletSession({
        selectedChainId: suiId,
        accounts: live,
        starknetConfig,
      })

      expect(onEth.active.address).toBe(VALID)
      expect(onSn.active.address).toBe(STARKNET)
      expect(onSui.active.address).toBe(SUI)

      // Family sessions stay live in every composition.
      for (const composed of [onEth, onSn, onSui]) {
        expect(composed.familySessions.evm.isConnected).toBe(true)
        expect(composed.familySessions.starknet.isConnected).toBe(true)
        expect(composed.familySessions.sui.isConnected).toBe(true)
      }
    })

    it('switching product network does not disconnect other families', () => {
      const sequence = [ETH, BASE, starknetId, suiId, ETH] as const
      let previous = composeActiveWalletSession({
        selectedChainId: sequence[0],
        accounts: accounts(),
        starknetConfig,
      })

      for (const selected of sequence.slice(1)) {
        const next = composeActiveWalletSession({
          selectedChainId: selected,
          accounts: accounts(),
          starknetConfig,
        })
        expect(next.familySessions.evm.address).toBe(previous.familySessions.evm.address)
        expect(next.familySessions.starknet.address).toBe(previous.familySessions.starknet.address)
        expect(next.familySessions.sui.address).toBe(previous.familySessions.sui.address)
        expect(next.resolved.chainId).toBe(selected)
        previous = next
      }
    })

    it('uses protocol config for the active product chain', () => {
      const { active } = composeActiveWalletSession({
        selectedChainId: BASE,
        accounts: accounts({ evm: { isConnected: true, address: VALID, chainId: BASE } }),
        starknetConfig,
      })
      expect(active.config.id).toBe(BASE)
      expect(active.config).toEqual(getChainConfig(BASE))
    })
  })

  describe('end-to-end sync state machine (wallet observations)', () => {
    it('walks connect → switch → dapp pick → wallet catch-up → non-EVM sticky', () => {
      let previous: number | undefined
      let selected: number | null = ETH

      // 1) Connect on Base while dapp defaulted to Ethereum
      {
        const step = nextActiveChainFromEvmWalletChange({
          selectedChainId: selected,
          walletChainId: BASE,
          previousWalletChainId: previous,
          isEvmConnected: true,
        })
        expect(step.nextSelected).toBe(BASE)
        selected = step.nextSelected ?? selected
        previous = step.nextPrevious
      }

      // 2) Wallet switches to Ethereum
      {
        const step = nextActiveChainFromEvmWalletChange({
          selectedChainId: selected,
          walletChainId: ETH,
          previousWalletChainId: previous,
          isEvmConnected: true,
        })
        expect(step.nextSelected).toBe(ETH)
        previous = step.nextPrevious
      }

      // 3) User picks Base in the dapp (store was on ETH from the wallet switch; wallet still ETH)
      selected = BASE
      {
        const step = nextActiveChainFromEvmWalletChange({
          selectedChainId: selected,
          walletChainId: ETH,
          previousWalletChainId: previous,
          isEvmConnected: true,
        })
        expect(step.nextSelected).toBeNull()
        previous = step.nextPrevious
      }

      // 4) Wallet catches up to Base
      {
        const step = nextActiveChainFromEvmWalletChange({
          selectedChainId: selected,
          walletChainId: BASE,
          previousWalletChainId: previous,
          isEvmConnected: true,
        })
        expect(step.nextSelected).toBeNull() // already aligned
        previous = step.nextPrevious
      }

      // 5) User picks Starknet — MetaMask later switching must not override
      selected = starknetId
      {
        const step = nextActiveChainFromEvmWalletChange({
          selectedChainId: selected,
          walletChainId: ETH,
          previousWalletChainId: previous,
          isEvmConnected: true,
        })
        expect(step.nextSelected).toBeNull()
        expect(selected).toBe(starknetId)
      }
    })
  })
})
