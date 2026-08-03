import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { usePayAmountDraft } from '@/mock/_shared/use-pay-amount-draft'

describe('usePayAmountDraft', () => {
  it('commits finite amounts and clears empties', () => {
    const onAmountChange = vi.fn()
    const { result } = renderHook(() => usePayAmountDraft({ onAmountChange }))

    act(() => {
      result.current.onFocus()
      result.current.onValueChange({ floatValue: 12.3456789, value: '12.3456789' })
    })
    expect(onAmountChange).toHaveBeenCalledWith(12.345678)

    act(() => {
      result.current.onValueChange({ value: '' })
    })
    expect(onAmountChange).toHaveBeenCalledWith(undefined)
  })

  it('keeps drafts without committing and clears on blur', () => {
    const onAmountChange = vi.fn()
    const { result } = renderHook(() => usePayAmountDraft({ onAmountChange }))

    act(() => {
      result.current.onFocus()
      result.current.onValueChange({ floatValue: 1, value: '1.' })
    })
    expect(onAmountChange).not.toHaveBeenCalled()
    expect(result.current.displayValue(5)).toBe('1.')
    expect(result.current.hasActiveDraft).toBe(true)

    act(() => {
      result.current.onBlur()
    })
    expect(result.current.displayValue(5)).toBe(5)
    expect(result.current.hasActiveDraft).toBe(false)
  })
})
