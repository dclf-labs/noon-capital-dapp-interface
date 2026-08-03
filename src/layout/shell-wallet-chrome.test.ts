import { describe, expect, it } from 'vitest'

import { DEFAULT_USERNAME } from '@/constants/api'
import { getShellWalletChrome } from '@/layout/shell-wallet-chrome'
import type { UnifiedConnection } from '@/lib/connection'

function session(
  partial: Partial<UnifiedConnection> & Pick<UnifiedConnection, 'chainFamily'>,
): UnifiedConnection {
  return {
    name: DEFAULT_USERNAME,
    avatar: '',
    unsupported: false,
    address: undefined,
    connector: undefined,
    isConnected: false,
    connectedChainId: undefined,
    config: { id: 1, name: 'Ethereum', iconSlug: 'ethereum' } as UnifiedConnection['config'],
    activeChainId: 1 as UnifiedConnection['activeChainId'],
    ...partial,
  } as UnifiedConnection
}

describe('getShellWalletChrome', () => {
  it('shows Connect when the selected family wallet is disconnected', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'starknet',
        isConnected: false,
        address: undefined,
      }),
    )
    expect(chrome.isConnected).toBe(false)
    expect(chrome.walletLabel).toBeUndefined()
    expect(chrome.chainFamily).toBe('starknet')
  })

  it('does not treat a default username as connected', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'evm',
        isConnected: false,
        address: undefined,
        name: DEFAULT_USERNAME,
      }),
    )
    expect(chrome.isConnected).toBe(false)
    expect(chrome.walletLabel).toBeUndefined()
  })

  it('shows the account chip when the selected family wallet is connected', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'evm',
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        name: DEFAULT_USERNAME,
      }),
    )
    expect(chrome.isConnected).toBe(true)
    expect(chrome.walletLabel).toBe('0x1234…5678')
  })

  it('prefers a real username over the shortened address', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'sui',
        isConnected: true,
        address: '0xabc',
        name: 'alice',
      }),
    )
    expect(chrome.walletLabel).toBe('alice')
  })

  it('exposes the active connector icon for the wallet badge', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'evm',
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        connector: {
          id: 'coinbaseWalletSDK',
          name: 'Coinbase Wallet',
          icon: 'https://example.com/coinbase.svg',
        } as UnifiedConnection['connector'],
      }),
    )
    expect(chrome.walletIconSrc).toBe('https://example.com/coinbase.svg')
  })

  it('uses the Starknet connector icon (Braavos), not MetaMask', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'starknet',
        isConnected: true,
        address: '0xabc',
        connector: {
          id: 'braavos',
          name: 'Braavos',
          icon: { light: 'data:image/svg+xml;braavos', dark: 'data:image/svg+xml;braavos' },
        } as UnifiedConnection['connector'],
      }),
    )
    expect(chrome.walletIconSrc).toBe('data:image/svg+xml;braavos')
    expect(chrome.walletIconSrc).not.toContain('metamask')
  })

  it('does not hardcode MetaMask when the connector is unknown', () => {
    const chrome = getShellWalletChrome(
      session({
        chainFamily: 'evm',
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        connector: { id: 'rainbow', name: 'Rainbow' } as UnifiedConnection['connector'],
      }),
    )
    expect(chrome.walletIconSrc).toBeUndefined()
  })
})
