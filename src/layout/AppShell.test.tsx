import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/wallet/useConnectWalletFamily', () => ({
  useConnectWalletFamily: () => vi.fn(),
}))

vi.mock('@/hooks/connection', () => ({
  useWalletSession: () => ({
    chainFamily: 'evm',
    isConnected: false,
    address: undefined,
    name: undefined,
    connector: undefined,
  }),
  useLiveWalletAccounts: () => ({
    evm: { connector: undefined },
    starknet: { connector: undefined },
    sui: { connector: undefined },
  }),
}))

vi.mock('@/features/shell/hooks/useSidebarProtocolMetrics', () => ({
  default: () => ({ apy: '—', tvl: '—' }),
}))

vi.mock('@/wallet/connector-icon', () => ({
  resolveConnectorIconSrc: () => undefined,
}))

vi.mock('@/components/shell/AppSidebar', () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}))

vi.mock('@/components/shell/AppHeader', () => ({
  AppHeader: () => <header data-testid="app-header" />,
}))

vi.mock('@/components/shell/AppFooter', () => ({
  AppFooter: () => <footer data-testid="app-footer" />,
}))

vi.mock('@/components/shell/MobileNavDrawer', () => ({
  MobileNavDrawer: () => null,
}))

import { AppShell } from '@/layout/AppShell'

describe('AppShell', () => {
  it('places the sidebar beside the header column (not above/below the whole chrome)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const sidebar = screen.getByTestId('app-sidebar')
    const header = screen.getByTestId('app-header')
    const footer = screen.getByTestId('app-footer')

    // Content row wraps [sidebar | header+main column]; footer is after that row.
    const contentRow = sidebar.parentElement?.parentElement
    expect(contentRow).toBeTruthy()
    expect(contentRow).toContainElement(header)
    expect(sidebar.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(
      contentRow?.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
