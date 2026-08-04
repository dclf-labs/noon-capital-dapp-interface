import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppSidebar } from '@/components/shell/AppSidebar'
import {
  shellNavForPath,
  SIDEBAR_INSET_LEFT_PX,
  SIDEBAR_INSET_TOP_PX,
  SIDEBAR_RAIL_PX,
} from '@/components/shell/constants'

function renderSidebar(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AppSidebar', () => {
  it('renders in document flow (not fixed) with rail width and Figma 4px / 5px insets', () => {
    const { container } = renderSidebar(
      <AppSidebar navItems={shellNavForPath('/vaults')} apy="6.94%" tvl="35.1M" />,
    )

    const rail = container.firstElementChild as HTMLElement
    expect(rail).toBeTruthy()
    expect(rail.className).toContain('relative')
    expect(rail.className).not.toContain('fixed')
    expect(rail.style.width).toBe(`${SIDEBAR_RAIL_PX}px`)
    // AppShell places the rail beside the header column — these margins are
    // from the shell edges (top 4px, left 5px), not from under the header.
    expect(rail.style.marginTop).toBe(`${SIDEBAR_INSET_TOP_PX}px`)
    expect(rail.style.marginLeft).toBe(`${SIDEBAR_INSET_LEFT_PX}px`)
    expect(SIDEBAR_INSET_TOP_PX).toBe(4)
    expect(SIDEBAR_INSET_LEFT_PX).toBe(5)
  })

  it('exposes primary nav links for shipped destinations', () => {
    renderSidebar(<AppSidebar navItems={shellNavForPath('/')} apy="—" tvl="—" />)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.querySelector('a[title="Home"]')).toHaveAttribute('href', '/')
    expect(nav.querySelector('a[title="Vaults"]')).toHaveAttribute('href', '/vaults')
  })
})
