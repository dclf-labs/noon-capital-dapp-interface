import { describe, expect, it, vi } from 'vitest'

import { createAppEnv, normalizeRawEnv, parseEnv } from '@/lib/env'

const validEnv = {
  MODE: 'test' as const,
  DEV: true,
  PROD: false,
  SSR: false,
  BASE_URL: '/',
}

describe('parseEnv', () => {
  it('parses a valid environment object', () => {
    const env = parseEnv(validEnv)
    expect(env.MODE).toBe('test')
    expect(env.BASE_URL).toBe('/')
    expect(env.VITE_WALLETCONNECT_PROJECT_ID).toBe('')
    expect(env.VITE_API_BASE_URL).toBe('')
  })

  it('defaults optional Vite vars when omitted', () => {
    const env = parseEnv(validEnv)
    expect(env.VITE_WALLETCONNECT_PROJECT_ID).toBe('')
    expect(env.VITE_GA_MEASUREMENT_ID).toBe('')
    expect(env.VITE_STARKNET_RPC_URL).toBe('')
    expect(env.VITE_SUI_RPC_URL).toBe('')
    expect(env.VITE_API_BASE_URL).toBe('')
  })

  it('defaults MODE when omitted', () => {
    const { MODE: _mode, ...rest } = validEnv
    const env = parseEnv(rest)
    expect(env.MODE).toBe('development')
  })

  it('throws on invalid MODE', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => parseEnv({ ...validEnv, MODE: 'nope' })).toThrow(/Invalid environment/i)
    spy.mockRestore()
  })

  it('normalizes alternate VITE_APP_* names into canonical keys', () => {
    const env = parseEnv({
      ...validEnv,
      VITE_APP_API_BASE_URL: 'https://legacy.api/',
      VITE_APP_WALLET_CONNECT_PROJECT_ID: 'legacy-wc',
      VITE_APP_STARKNET_ALCHEMY_API_KEY: 'legacy-starknet',
    })
    expect(env.VITE_API_BASE_URL).toBe('https://legacy.api/')
    expect(env.VITE_WALLETCONNECT_PROJECT_ID).toBe('legacy-wc')
    expect(env.VITE_STARKNET_INFURA_API_KEY).toBe('legacy-starknet')
    expect(env.VITE_STARKNET_ALCHEMY_API_KEY).toBe('legacy-starknet')
  })
})

describe('createAppEnv', () => {
  it('groups config and strips trailing slash from API base', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_API_BASE_URL: 'https://api.example.test/',
      }),
    )
    expect(app.api.baseUrl).toBe('https://api.example.test')
  })

  it('prefers the canonical WalletConnect project id', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_WALLETCONNECT_PROJECT_ID: 'canonical',
        VITE_APP_WALLET_CONNECT_PROJECT_ID: 'legacy',
      }),
    )
    expect(app.walletConnect.projectId).toBe('canonical')
  })

  it('falls back to the alternate WalletConnect project id', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_WALLETCONNECT_PROJECT_ID: '',
        VITE_APP_WALLET_CONNECT_PROJECT_ID: 'legacy-id',
      }),
    )
    expect(app.walletConnect.projectId).toBe('legacy-id')
  })

  it('prefers an explicit Starknet RPC URL', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_STARKNET_RPC_URL: 'https://custom.rpc/starknet',
        VITE_STARKNET_INFURA_API_KEY: 'infura-key',
      }),
    )
    expect(app.rpc.starknet).toBe('https://custom.rpc/starknet')
  })

  it('builds a Starknet Infura URL from the API key', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_STARKNET_INFURA_API_KEY: 'infura-key',
      }),
    )
    expect(app.rpc.starknet).toBe('https://starknet-mainnet.infura.io/v3/infura-key')
    expect(app.rpc.starknetInfuraApiKey).toBe('infura-key')
  })

  it('accepts the legacy Alchemy-named Starknet key as Infura', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_APP_STARKNET_ALCHEMY_API_KEY: 'legacy-key',
      }),
    )
    expect(app.rpc.starknet).toBe('https://starknet-mainnet.infura.io/v3/legacy-key')
    expect(app.rpc.starknetInfuraApiKey).toBe('legacy-key')
  })

  it('falls back to the public Blast Starknet endpoint', () => {
    expect(createAppEnv(parseEnv(validEnv)).rpc.starknet).toMatch(/blastapi\.io/)
  })
})

describe('normalizeRawEnv', () => {
  it('prefers canonical keys over alternate names', () => {
    const normalized = normalizeRawEnv({
      VITE_API_BASE_URL: 'canonical',
      VITE_APP_API_BASE_URL: 'legacy',
    })
    expect(normalized.VITE_API_BASE_URL).toBe('canonical')
  })
})
