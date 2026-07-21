import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'

function Boom(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('resets and remounts children after Try again', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true

    function Flaky() {
      if (shouldThrow) {
        throw new Error('temporary')
      }
      return <p>all good</p>
    }

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )

    expect(screen.getByText('temporary')).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(screen.getByText('all good')).toBeInTheDocument()
    })

    spy.mockRestore()
  })
})
