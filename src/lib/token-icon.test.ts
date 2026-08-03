import { describe, expect, it } from 'vitest'

import { tokenIconSrc, tokenOptionKey } from '@/lib/token-icon'

describe('tokenIconSrc', () => {
  it('maps iconSlug to the public tokens path', () => {
    expect(tokenIconSrc({ iconSlug: 'USN' })).toBe('/assets/tokens/USN.svg')
    expect(tokenIconSrc({ iconSlug: 'USDT' })).toBe('/assets/tokens/USDT.svg')
  })

  it('falls back when slug is missing', () => {
    expect(tokenIconSrc(undefined)).toBe('/assets/buy/usn.png')
    expect(tokenIconSrc({ iconSlug: '  ' })).toBe('/assets/buy/usn.png')
  })
})

describe('tokenOptionKey', () => {
  it('joins address and symbol', () => {
    expect(
      tokenOptionKey({
        contractAddress: '0xabc' as never,
        symbol: 'USN',
      }),
    ).toBe('0xabc:USN')
  })
})
