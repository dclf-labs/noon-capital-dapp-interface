import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PoweredByRow } from '@/mock/buy/PoweredByRow'

describe('PoweredByRow', () => {
  it('links the badge to the protocol home page', () => {
    render(
      <PoweredByRow
        poweredBy={{
          venue: 'ekubo',
          name: 'Ekubo',
          logoSrc: '/assets/tokens/EKUBO.svg',
          href: 'https://ekubo.org/',
        }}
      />,
    )

    const link = screen.getByRole('link', { name: 'Ekubo home' })
    expect(link).toHaveAttribute('href', 'https://ekubo.org/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('renders a non-link badge when the href is unsafe', () => {
    render(
      <PoweredByRow
        poweredBy={{
          venue: 'curve',
          name: 'Curve',
          logoSrc: '/assets/tokens/CRV.svg',
          href: 'javascript:alert(1)',
        }}
      />,
    )

    expect(screen.queryByRole('link', { name: 'Curve home' })).not.toBeInTheDocument()
    expect(screen.getByText('Curve')).toBeInTheDocument()
  })
})
