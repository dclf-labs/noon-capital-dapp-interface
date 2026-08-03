import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

import { AppHeader } from '@/components/shell/AppHeader'

describe('AppHeader', () => {
  beforeEach(() => {
    selectActiveChain.mockReset()
  })

  it('shows Connect wallet in the navbar when disconnected', () => {
    render(
      <AppHeader
        isConnected={false}
        apy="6.94%"
        tvl="35.1M"
        onConnectClick={vi.fn()}
        onMenuClick={vi.fn()}
      />,
    )
    // Mobile + desktop headers both expose the active-family connect CTA.
    expect(
      screen.getAllByRole('button', { name: /connect wallet/i }).length,
    ).toBeGreaterThanOrEqual(2)
  })

  it('shows the connected wallet chip when connected', () => {
    render(
      <AppHeader
        isConnected
        walletLabel="0x1234…abcd"
        apy="6.94%"
        tvl="35.1M"
        onConnectClick={vi.fn()}
        onMenuClick={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('button', { name: '0x1234…abcd' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /connect wallet/i })).not.toBeInTheDocument()
  })

  it('opens the mobile menu from the hamburger control', async () => {
    const user = userEvent.setup()
    const onMenuClick = vi.fn()
    render(
      <AppHeader
        isConnected={false}
        apy="6.94%"
        tvl="35.1M"
        onConnectClick={vi.fn()}
        onMenuClick={onMenuClick}
      />,
    )
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })

  it('always exposes a network selector control', () => {
    render(
      <AppHeader
        isConnected={false}
        apy="6.94%"
        tvl="35.1M"
        onConnectClick={vi.fn()}
        onMenuClick={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('button', { name: /network:/i }).length).toBeGreaterThan(0)
  })
})
