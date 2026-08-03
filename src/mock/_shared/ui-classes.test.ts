import { describe, expect, it, vi } from 'vitest'

import {
  accentCtaClassName,
  preventMouseDownFocus,
  primaryCtaClassName,
  secondaryCtaClassName,
} from '@/mock/_shared/ui-classes'

describe('primaryCtaClassName', () => {
  it('uses accent styles when enabled', () => {
    const cls = primaryCtaClassName()
    expect(cls).toContain('bg-accent')
    expect(cls).toContain('w-full')
    expect(cls).not.toContain('bg-cta-disabled')
  })

  it('uses disabled styles when disabled or loading', () => {
    expect(primaryCtaClassName({ disabled: true })).toContain('bg-cta-disabled')
    expect(primaryCtaClassName({ loading: true })).toContain('animate-pulse')
    expect(primaryCtaClassName({ loading: true })).toContain('bg-cta-disabled')
  })
})

describe('accentCtaClassName / secondaryCtaClassName', () => {
  it('builds flex-1 accent and secondary variants', () => {
    expect(accentCtaClassName()).toContain('bg-accent')
    expect(accentCtaClassName()).toContain('flex-1')
    expect(secondaryCtaClassName()).toContain('bg-stone-100')
    expect(secondaryCtaClassName({ disabled: true })).toContain('text-stone-400')
  })
})

describe('preventMouseDownFocus', () => {
  it('calls preventDefault', () => {
    const event = { preventDefault: vi.fn() }
    preventMouseDownFocus(event)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })
})
