import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const selectActiveChain = vi.fn()

vi.mock('@/hooks/connection', () => ({
  useSelectActiveChain: () => ({
    selectedChainId: 1,
    selectActiveChain,
    isSwitchingEvmNetwork: false,
  }),
}))

vi.mock('@/components/shell/network', async () => {
  const actual = await vi.importActual('@/components/shell/network')
  return {
    ...(actual as object),
    chainIconSrc: () => '/assets/chains/ethereum.svg',
  }
})

import { shellNavForPath } from '@/components/shell/constants'
import { MobileNavDrawer } from '@/components/shell/MobileNavDrawer'

function renderDrawer(overrides: Partial<ComponentProps<typeof MobileNavDrawer>> = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    navItems: shellNavForPath('/vaults'),
    apy: '6.94%',
    tvl: '35.1M',
    isConnected: false,
    onConnectClick: vi.fn(),
    ...overrides,
  }
  return {
    props,
    ...render(
      <MemoryRouter>
        <MobileNavDrawer {...props} />
      </MemoryRouter>,
    ),
  }
}

describe('MobileNavDrawer', () => {
  beforeEach(() => {
    selectActiveChain.mockReset()
  })

  it('renders nothing when closed', () => {
    renderDrawer({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows network selector and bottom Connect wallet when disconnected', () => {
    renderDrawer({ isConnected: false })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /network:/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('shows the connected wallet control at the bottom when connected', () => {
    renderDrawer({ isConnected: true, walletLabel: 'alice.eth' })
    expect(screen.getByRole('button', { name: 'alice.eth' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^connect wallet$/i })).not.toBeInTheDocument()
  })

  it('disables unshipped nav destinations', () => {
    renderDrawer()
    expect(screen.getByTitle(/Noon Points — coming soon/i)).toHaveAttribute('aria-disabled', 'true')
  })

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    const { props } = renderDrawer()
    await user.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalled()
  })

  it('waits for the selection pill before closing after a nav click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { props } = renderDrawer()

    await user.click(screen.getByRole('link', { name: 'Home' }))
    expect(props.onClose).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(260)
    expect(props.onClose).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})
