import { type ReactElement, type ReactNode } from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { type AppStore, createAppStore, type RootState } from '@/store'

interface Options {
  route?: string
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const store = options.store ?? createAppStore(options.preloadedState)

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[options.route ?? '/']}>{children}</MemoryRouter>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  }
}
