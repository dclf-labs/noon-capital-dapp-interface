import { type ReactElement, type ReactNode } from 'react'

import { render } from '@testing-library/react'

/**
 * Thin RTL helper for unit tests. Wallet providers (AppKit / starknet-react /
 * Sui dApp Kit) are heavy — wrap with `AppProviders` only in integration tests.
 */
export function renderWithProviders(ui: ReactElement) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper })
}
