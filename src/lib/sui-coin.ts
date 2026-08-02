import { SUI_SUSN_COIN_TYPE } from '@/config/chains/sui'
import type { Token } from '@/config/token'

/** Native SUI Move coin type. */
export const NATIVE_SUI_COIN_TYPE = '0x2::sui::SUI'

/**
 * Resolve a Move coin type for balance / OFT calls.
 * Returns undefined when the token is not a known Sui asset in this app.
 */
export const getSuiCoinType = (token: Token | undefined): string | undefined => {
  if (!token) return undefined
  if (token.symbol === 'sUSN') return SUI_SUSN_COIN_TYPE
  if (token.symbol === 'SUI' || token.isNative) return NATIVE_SUI_COIN_TYPE
  return undefined
}
