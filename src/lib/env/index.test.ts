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

  it('trims string env values', () => {
    const env = parseEnv({
      ...validEnv,
      VITE_API_BASE_URL: '  https://api.example.test/  ',
      VITE_STARKNET_INFURA_API_KEY: '  infura-key  ',
    })
    expect(env.VITE_API_BASE_URL).toBe('https://api.example.test/')
    expect(env.VITE_STARKNET_INFURA_API_KEY).toBe('infura-key')
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

  it('exposes the WalletConnect project id', () => {
    const app = createAppEnv(
      parseEnv({
        ...validEnv,
        VITE_WALLETCONNECT_PROJECT_ID: 'wc-project',
      }),
    )
    expect(app.walletConnect.projectId).toBe('wc-project')
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

  it('falls back to the public Blast Starknet endpoint', () => {
    expect(createAppEnv(parseEnv(validEnv)).rpc.starknet).toMatch(/blastapi\.io/)
    expect(createAppEnv(parseEnv(validEnv)).rpc.starknetInfuraApiKey).toBe('')
  })
})

describe('normalizeRawEnv', () => {
  it('trims known string keys', () => {
    const normalized = normalizeRawEnv({
      VITE_API_BASE_URL: '  https://api.example.test  ',
      VITE_WALLETCONNECT_PROJECT_ID: '  wc  ',
    })
    expect(normalized.VITE_API_BASE_URL).toBe('https://api.example.test')
    expect(normalized.VITE_WALLETCONNECT_PROJECT_ID).toBe('wc')
  })
})
