import { describe, expect, it } from 'vitest'

import { disableFieldAutocomplete } from '@/hooks/ui/useDisableFieldAutocomplete'

describe('disableFieldAutocomplete', () => {
  it('turns off autocomplete / suggestions on text inputs', () => {
    const input = document.createElement('input')
    input.type = 'text'
    disableFieldAutocomplete(input)

    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.getAttribute('autocorrect')).toBe('off')
    expect(input.getAttribute('autocapitalize')).toBe('off')
    expect(input.getAttribute('spellcheck')).toBe('false')
  })

  it('uses new-password for password fields so managers skip autofill', () => {
    const input = document.createElement('input')
    input.type = 'password'
    disableFieldAutocomplete(input)
    expect(input.getAttribute('autocomplete')).toBe('new-password')
  })

  it('applies to textarea and select', () => {
    const textarea = document.createElement('textarea')
    const select = document.createElement('select')
    disableFieldAutocomplete(textarea)
    disableFieldAutocomplete(select)
    expect(textarea.getAttribute('autocomplete')).toBe('off')
    expect(select.getAttribute('autocomplete')).toBe('off')
  })
})
