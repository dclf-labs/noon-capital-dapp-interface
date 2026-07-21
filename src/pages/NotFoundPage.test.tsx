import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { renderWithProviders } from '@/test/test-utils'

function TitleProbe({ title }: { title?: string }) {
  useDocumentTitle(title)
  return <p>probe</p>
}

describe('NotFoundPage', () => {
  it('renders a 404 message and home link', () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})

describe('useDocumentTitle', () => {
  it('sets document title with app name', () => {
    render(<TitleProbe title="Markets" />)
    expect(document.title).toBe('Markets · Noon Capital')
  })
})
