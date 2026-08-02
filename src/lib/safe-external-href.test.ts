import { describe, expect, it } from 'vitest'

import { safeExternalHref } from '@/lib/safe-external-href'

describe('safeExternalHref', () => {
  it('accepts absolute https URLs and normalizes them', () => {
    expect(safeExternalHref('https://yield.accountable.capital/vaults/0xabc')).toBe(
      'https://yield.accountable.capital/vaults/0xabc',
    )
    expect(safeExternalHref('  https://noon.capital/path  ')).toBe('https://noon.capital/path')
  })

  it('rejects missing, blank, relative, and non-https schemes', () => {
    expect(safeExternalHref(undefined)).toBeUndefined()
    expect(safeExternalHref(null)).toBeUndefined()
    expect(safeExternalHref('')).toBeUndefined()
    expect(safeExternalHref('   ')).toBeUndefined()
    expect(safeExternalHref('/vaults')).toBeUndefined()
    expect(safeExternalHref('http://noon.capital')).toBeUndefined()
    expect(safeExternalHref('javascript:alert(1)')).toBeUndefined()
    expect(safeExternalHref('data:text/html,hi')).toBeUndefined()
    expect(safeExternalHref('not a url')).toBeUndefined()
  })

  it('rejects https URLs with embedded credentials', () => {
    expect(safeExternalHref('https://user:pass@evil.example/path')).toBeUndefined()
  })
})
