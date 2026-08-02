import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConnectWalletButton } from '@/components/shell/ConnectWalletButton'

describe('ConnectWalletButton', () => {
  it('renders the connect label and invokes onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ConnectWalletButton onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: /connect wallet/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports full-width mode for the mobile drawer', () => {
    render(<ConnectWalletButton fullWidth />)
    expect(screen.getByRole('button', { name: /connect wallet/i }).className).toContain('w-full')
  })
})
