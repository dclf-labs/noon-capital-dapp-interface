import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PrimaryCtaButton } from '@/mock/_shared/PrimaryCtaButton'

describe('PrimaryCtaButton', () => {
  it('invokes onClick when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<PrimaryCtaButton onClick={onClick}>Next</PrimaryCtaButton>)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled while loading or explicitly disabled', () => {
    const { rerender } = render(
      <PrimaryCtaButton disabled onClick={vi.fn()}>
        Next
      </PrimaryCtaButton>,
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    rerender(
      <PrimaryCtaButton loading onClick={vi.fn()}>
        Next
      </PrimaryCtaButton>,
    )
    const button = screen.getByRole('button', { name: 'Next' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
