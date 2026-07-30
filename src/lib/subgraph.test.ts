import { describe, expect, it } from 'vitest'

import { ethereumConfig, sophonConfig, tacConfig, zksyncConfig } from '@/config'
import { createAppEnv, parseEnv } from '@/lib/env'
import { getEthMetaSubgraphUrl, getHoldingsSubgraphUrl } from '@/lib/subgraph'

describe('subgraph helpers', () => {
  it('maps protocol configs to holdings subgraph chains', () => {
    expect(ethereumConfig.holdingsSubgraphChain).toBe('ethereum')
    expect(sophonConfig.holdingsSubgraphChain).toBe('sophon')
    expect(zksyncConfig.holdingsSubgraphChain).toBe('zksync')
    expect(tacConfig.holdingsSubgraphChain).toBe('tac')
  })

  it('returns undefined when the chain has no holdings key', () => {
    expect(getHoldingsSubgraphUrl({} as never, 'usn')).toBeUndefined()
  })

  it('reads holdings URLs from appEnv', () => {
    const source = createAppEnv(
      parseEnv({
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
        BASE_URL: '/',
        VITE_APP_ENV: 'development',
        VITE_SUBGRAPH_USN_ETHEREUM_URL: 'https://goldsky.example/usn-mainnet',
        VITE_SUBGRAPH_ETH_META_URL: 'https://goldsky.example/meta',
      }),
    )

    expect(getHoldingsSubgraphUrl(ethereumConfig, 'usn', source)).toBe(
      'https://goldsky.example/usn-mainnet',
    )
    expect(getEthMetaSubgraphUrl(source)).toBe('https://goldsky.example/meta')
  })

  it('accepts legacy Goldsky env names via normalize', () => {
    const source = createAppEnv(
      parseEnv({
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
        BASE_URL: '/',
        VITE_APP_ENV: 'development',
        VITE_APP_GOLDSKY_USN_MAINNET_URL: 'https://goldsky.example/legacy-usn',
      }),
    )
    expect(getHoldingsSubgraphUrl(ethereumConfig, 'usn', source)).toBe(
      'https://goldsky.example/legacy-usn',
    )
  })
})
