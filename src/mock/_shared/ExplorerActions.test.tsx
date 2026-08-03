import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ExplorerActions } from '@/mock/_shared/ExplorerActions'

describe('ExplorerActions', () => {
  it('wires a safe explorer link and more CTA', async () => {
    const user = userEvent.setup()
    const onMore = vi.fn()
    render(
      <ExplorerActions
        txnUrl="https://etherscan.io/tx/0xabc"
        moreLabel="Buy More"
        onMore={onMore}
      />,
    )

    const link = screen.getByRole('link', { name: /view explorer/i })
    expect(link).toHaveAttribute('href', 'https://etherscan.io/tx/0xabc')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')

    await user.click(screen.getByRole('button', { name: 'Buy More' }))
    expect(onMore).toHaveBeenCalledTimes(1)
  })

  it('disables explorer when txnUrl is unsafe', () => {
    render(
      <ExplorerActions txnUrl="javascript:alert(1)" moreLabel="Bridge more" onMore={vi.fn()} />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view explorer/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bridge more' })).toBeEnabled()
  })
})
