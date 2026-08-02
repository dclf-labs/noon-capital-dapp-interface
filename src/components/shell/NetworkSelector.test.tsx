import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const selectActiveChain = vi.fn().mockResolvedValue(undefined)

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

import { NETWORK_SELECTOR_Z_INDEX } from '@/components/shell/constants'
import { NETWORK_OPTIONS } from '@/components/shell/network'
import { NetworkSelector } from '@/components/shell/NetworkSelector'

describe('NetworkSelector', () => {
  beforeEach(() => {
    selectActiveChain.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens the portaled menu above shell chrome and below modals', async () => {
    const user = userEvent.setup()
    render(<NetworkSelector />)

    const trigger = screen.getByRole('button', { name: /network:/i })
    await user.click(trigger)

    const menu = await screen.findByRole('menu', { name: /networks/i })
    expect(menu).toBeInTheDocument()
    expect(menu.style.zIndex).toBe(String(NETWORK_SELECTOR_Z_INDEX))
    expect(menu.parentElement).toBe(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects an allowlisted network and schedules close', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<NetworkSelector />)

    const trigger = screen.getByRole('button', { name: /network:/i })
    await user.click(trigger)
    const zksync = NETWORK_OPTIONS.find((n) => n.key === 'zksync')!
    await user.click(screen.getByRole('menuitemradio', { name: zksync.name }))

    expect(selectActiveChain).toHaveBeenCalledWith(zksync.chainId)

    await act(async () => {
      vi.advanceTimersByTime(260)
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<NetworkSelector />)
    const trigger = screen.getByRole('button', { name: /network:/i })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
