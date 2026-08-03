import { useRef, useState } from 'react'

import { parseTradePayInput } from '@/features/_shared'

type PayAmountDraftOptions = {
  onAmountChange: (amount: number | undefined) => void
}

/**
 * Focus/draft state for NumericFormat pay inputs.
 * Keeps in-progress typing (`1.`) from fighting committed parent amounts.
 *
 * Uses a focus ref so a focus + valueChange in the same tick still records the draft
 * (state updates from `onFocus` are not visible to a same-tick `onValueChange` closure).
 */
export function usePayAmountDraft({ onAmountChange }: PayAmountDraftOptions) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState<string | undefined>(undefined)
  const focusedRef = useRef(false)

  const clearDraft = () => {
    focusedRef.current = false
    setFocused(false)
    setDraft(undefined)
  }

  const onFocus = () => {
    focusedRef.current = true
    setFocused(true)
  }

  const onBlur = () => {
    clearDraft()
  }

  const onValueChange = (values: { floatValue?: number; value: string }) => {
    if (focusedRef.current) setDraft(values.value)
    const parsed = parseTradePayInput(values)
    if (parsed.kind === 'draft') return
    if (parsed.kind === 'clear') {
      onAmountChange(undefined)
      return
    }
    onAmountChange(parsed.amount)
  }

  /** Prefer draft while focused; otherwise the committed amount (or empty fallback). */
  const displayValue = (committed: number | string | undefined, empty: string | number = '') =>
    focused && draft !== undefined ? draft : (committed ?? empty)

  const hasActiveDraft = Boolean(focused && draft && draft !== '0')

  return {
    focused,
    draft,
    clearDraft,
    onFocus,
    onBlur,
    onValueChange,
    displayValue,
    hasActiveDraft,
  }
}
