import { type ReactElement, type ReactNode } from 'react'

import { render } from '@testing-library/react'

export function renderWithProviders(ui: ReactElement) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper })
}
