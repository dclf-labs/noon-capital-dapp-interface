import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SafeExplorerLink } from '@/mock/_shared/SafeExplorerLink'

describe('SafeExplorerLink', () => {
  it('renders a sanitized https link', () => {
    render(
      <SafeExplorerLink href="https://etherscan.io/tx/0xabc">View on explorer</SafeExplorerLink>,
    )
    const link = screen.getByRole('link', { name: /view on explorer/i })
    expect(link).toHaveAttribute('href', 'https://etherscan.io/tx/0xabc')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('blocks javascript: and http: hrefs', () => {
    const { rerender } = render(
      <SafeExplorerLink href="javascript:alert(1)" fallback={<span>blocked</span>}>
        View on explorer
      </SafeExplorerLink>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('blocked')).toBeInTheDocument()

    rerender(
      <SafeExplorerLink href="http://etherscan.io/tx/0xabc" fallback={<span>blocked</span>}>
        View on explorer
      </SafeExplorerLink>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders nothing when href is missing and no fallback is provided', () => {
    const { container } = render(
      <SafeExplorerLink href={undefined}>View on explorer</SafeExplorerLink>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
