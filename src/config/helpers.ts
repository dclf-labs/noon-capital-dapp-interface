import type { CurvePool, UniV3Pool, UniV4Pool } from '@/config/pools'
import type { Token } from '@/config/token'
import type { ProtocolChainConfig } from '@/config/types'

function normalizeTokenSymbol(token: string): string {
  const upper = token.toUpperCase()
  if (upper === 'SUSN') return 'sUSN'
  if (upper === 'USN') return 'USN'
  return token
}

export function getToken(
  config: ProtocolChainConfig | undefined,
  token: string | undefined,
): (Token & { chainId: ProtocolChainConfig['id']; chainIconSlug: string }) | undefined {
  if (!config?.tokens || !token) return undefined

  const key = normalizeTokenSymbol(token)
  const tokenInfo = config.tokens[key]
  if (!tokenInfo?.contractAddress || !tokenInfo.decimals || !tokenInfo.symbol) {
    return undefined
  }

  return {
    ...tokenInfo,
    chainId: config.id,
    chainIconSlug: config.iconSlug,
  }
}

export function getTokens(
  config: ProtocolChainConfig | undefined,
  tokens: string[] | undefined,
): Token[] | undefined {
  if (!config || !tokens) return undefined

  const tokensInfo = tokens
    .map((token) => getToken(config, token))
    .filter((tokenInfo): tokenInfo is NonNullable<typeof tokenInfo> => Boolean(tokenInfo))

  return tokensInfo.length > 0 ? tokensInfo : undefined
}

export function getTokensWithoutNative(
  config: ProtocolChainConfig | undefined,
  tokens: string[] | undefined,
): Token[] | undefined {
  const tokensInfo = getTokens(config, tokens)
  if (!tokensInfo) return undefined
  return tokensInfo.filter((tokenInfo) => !tokenInfo.isNative)
}

export function getUniV3Pool(
  config: ProtocolChainConfig | undefined,
  tokenIn: string | undefined,
  tokenOut: string | undefined,
): (UniV3Pool & { chainId: ProtocolChainConfig['id']; chainIconSlug: string }) | undefined {
  if (!config?.tokens || !tokenIn || !tokenOut) return undefined

  const inInfo = config.tokens[tokenIn]
  const outInfo = config.tokens[tokenOut]
  if (!inInfo?.symbol || !outInfo?.symbol) return undefined

  const uniV3Pool = config.uniV3Pools?.[`${inInfo.symbol}-${outInfo.symbol}`]
  if (!uniV3Pool) return undefined

  return {
    ...uniV3Pool,
    chainId: config.id,
    chainIconSlug: config.iconSlug,
  }
}

export function getCurvePool(
  config: ProtocolChainConfig | undefined,
  tokenIn: string | undefined,
  tokenOut: string | undefined,
): (CurvePool & { chainId: ProtocolChainConfig['id']; chainIconSlug: string }) | undefined {
  if (!config?.tokens || !tokenIn || !tokenOut) return undefined

  const inInfo = config.tokens[tokenIn]
  const outInfo = config.tokens[tokenOut]
  if (!inInfo?.symbol || !outInfo?.symbol) return undefined

  const curvePool = config.curvePools?.[`${inInfo.symbol}-${outInfo.symbol}`]
  if (!curvePool) return undefined

  return {
    ...curvePool,
    chainId: config.id,
    chainIconSlug: config.iconSlug,
  }
}

export function getUniV4Pool(
  config: ProtocolChainConfig | undefined,
  tokenIn: string | undefined,
  tokenOut: string | undefined,
):
  | (UniV4Pool & {
      chainId: ProtocolChainConfig['id']
      chainIconSlug: string
      isReverse?: boolean
    })
  | undefined {
  if (!config?.tokens || !tokenIn || !tokenOut) return undefined

  const inInfo = config.tokens[tokenIn]
  const outInfo = config.tokens[tokenOut]
  if (!inInfo?.symbol || !outInfo?.symbol) return undefined

  const forward = config.uniV4Pools?.[`${inInfo.symbol}-${outInfo.symbol}`]
  if (forward) {
    return {
      ...forward,
      chainId: config.id,
      chainIconSlug: config.iconSlug,
    }
  }

  const reverse = config.uniV4Pools?.[`${outInfo.symbol}-${inInfo.symbol}`]
  if (!reverse) return undefined

  return {
    ...reverse,
    poolKeyPath: [...(reverse.poolKeyPath || [])].reverse(),
    chainId: config.id,
    chainIconSlug: config.iconSlug,
    isReverse: true,
  }
}
