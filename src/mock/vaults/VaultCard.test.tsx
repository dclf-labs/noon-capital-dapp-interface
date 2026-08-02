import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { VaultListItem } from '@/mock/vaults/types'
import { VaultCard } from '@/mock/vaults/VaultCard'

const baseVault: VaultListItem = {
  id: 'v1',
  name: 'Test Vault',
  description: 'A demo vault',
  chainName: 'Ethereum',
  chainIconSrc: '/assets/chains/ethereum.svg',
  assetSymbol: 'USDC',
  assetIconSrc: '/assets/tokens/usdc.svg',
  apyLabel: '10%',
  tvlLabel: '$1M',
  iconSrc: '/assets/vaults/test.svg',
}

describe('VaultCard', () => {
  it('renders safe https Earn Now links with noreferrer noopener', () => {
    render(
      <VaultCard
        vault={{
          ...baseVault,
          href: 'https://yield.accountable.capital/vaults/0xabc',
        }}
      />,
    )

    const open = screen.getByRole('link', { name: /open test vault/i })
    expect(open).toHaveAttribute('href', 'https://yield.accountable.capital/vaults/0xabc')
    expect(open).toHaveAttribute('target', '_blank')
    expect(open).toHaveAttribute('rel', 'noreferrer noopener')

    const earnLinks = screen.getAllByRole('link', { name: /earn now in test vault/i })
    expect(earnLinks.length).toBeGreaterThan(0)
    for (const link of earnLinks) {
      expect(link).toHaveAttribute('href', 'https://yield.accountable.capital/vaults/0xabc')
      expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    }
  })

  it('omits links when the vault href is unsafe', () => {
    render(
      <VaultCard
        vault={{
          ...baseVault,
          href: 'javascript:alert(1)',
        }}
      />,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Test Vault')).toBeInTheDocument()
  })

  it('omits links when href is missing', () => {
    render(<VaultCard vault={baseVault} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
