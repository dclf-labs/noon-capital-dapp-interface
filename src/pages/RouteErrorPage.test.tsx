import { render, screen } from '@testing-library/react'
import * as ReactRouterDom from 'react-router-dom'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as object),
    useRouteError: vi.fn(),
  }
})

import { RouteErrorPage } from '@/pages/RouteErrorPage'

describe('RouteErrorPage', () => {
  beforeEach(() => {
    vi.mocked(ReactRouterDom.useRouteError).mockReset()
  })

  it('renders message from an Error', () => {
    vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(new Error('route blew up'))

    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Unexpected error')).toBeInTheDocument()
    expect(screen.getByText('route blew up')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
  })
})
