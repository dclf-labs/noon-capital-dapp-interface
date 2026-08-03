import type { Token } from '@/config/token'

/** Public path for a token glyph (`iconSlug` from protocol config). */
export function tokenIconSrc(token: Pick<Token, 'iconSlug'> | undefined): string {
  const slug = token?.iconSlug?.trim()
  if (!slug) return '/assets/buy/usn.png'
  return `/assets/tokens/${slug}.svg`
}

/** Public path for a token’s chain badge (`chainIconSlug` from protocol config). */
export function tokenChainIconSrc(
  token: Pick<Token, 'chainIconSlug'> | undefined,
): string | undefined {
  const slug = token?.chainIconSlug?.trim()
  if (!slug) return undefined
  return `/assets/chains/${slug}.svg`
}

/** Stable select / list key for a token option. */
export function tokenOptionKey(token: Pick<Token, 'contractAddress' | 'symbol'>): string {
  return `${token.contractAddress}:${token.symbol}`
}
