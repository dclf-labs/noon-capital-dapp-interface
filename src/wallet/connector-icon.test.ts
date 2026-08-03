import { describe, expect, it } from 'vitest'

import { resolveConnectorIconSrc } from '@/wallet/connector-icon'

describe('resolveConnectorIconSrc', () => {
  it('returns undefined when there is no connector', () => {
    expect(resolveConnectorIconSrc(undefined, 'evm')).toBeUndefined()
    expect(resolveConnectorIconSrc(null, 'starknet')).toBeUndefined()
  })

  it('uses the connector-provided icon string on EVM', () => {
    expect(
      resolveConnectorIconSrc({ id: 'coinbaseWallet', icon: 'https://example.com/cb.svg' }, 'evm'),
    ).toBe('https://example.com/cb.svg')
  })

  it('uses Braavos light/dark icons on Starknet', () => {
    expect(
      resolveConnectorIconSrc(
        {
          id: 'braavos',
          name: 'Braavos',
          icon: { light: 'data:image/svg+xml;braavos', dark: 'data:image/svg+xml;braavos-dark' },
        },
        'starknet',
      ),
    ).toBe('data:image/svg+xml;braavos')
  })

  it('maps MetaMask ids only for the EVM family', () => {
    expect(resolveConnectorIconSrc({ id: 'metaMask' }, 'evm')).toBe('/assets/shell/metamask.svg')
    expect(resolveConnectorIconSrc({ id: 'metaMask' }, 'starknet')).toBeUndefined()
    expect(
      resolveConnectorIconSrc({ id: 'injected', name: 'MetaMask' }, 'starknet'),
    ).toBeUndefined()
  })

  it('maps Ready / Argent ids on Starknet', () => {
    expect(resolveConnectorIconSrc({ id: 'argentX' }, 'starknet')).toBe('/assets/wallets/ready.png')
  })

  it('does not default unknown wallets to MetaMask', () => {
    expect(resolveConnectorIconSrc({ id: 'rainbow', name: 'Rainbow' }, 'evm')).toBeUndefined()
  })

  it('survives starknet connectors whose icon getter throws', () => {
    const connector = {
      id: 'braavos',
      name: 'Braavos',
      get icon(): string {
        throw new Error('ensureWallet failed')
      },
    }
    expect(resolveConnectorIconSrc(connector, 'starknet')).toBeUndefined()
  })
})
