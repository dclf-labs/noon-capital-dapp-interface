import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SuccessCheckIcon } from '@/mock/_shared/SuccessCheckIcon'

describe('SuccessCheckIcon', () => {
  it('renders the shared check asset and stays decorative', () => {
    const { container } = render(<SuccessCheckIcon />)

    const tile = container.firstElementChild as HTMLElement
    expect(tile).toHaveAttribute('aria-hidden', 'true')

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/assets/buy/check-circle.svg')
    expect(img).toHaveAttribute('alt', '')
  })
})
