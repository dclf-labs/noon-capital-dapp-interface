import { describe, expect, it, vi } from 'vitest'

import { parseEnv } from '@/lib/env'

const validEnv = {
  MODE: 'test' as const,
  DEV: true,
  PROD: false,
  SSR: false,
  BASE_URL: '/',
  VITE_APP_ENV: 'development' as const,
  VITE_WALLETCONNECT_PROJECT_ID: '',
  VITE_GA_MEASUREMENT_ID: '',
}

describe('parseEnv', () => {
  it('parses a valid environment object', () => {
    const env = parseEnv(validEnv)
    expect(env.MODE).toBe('test')
    expect(env.BASE_URL).toBe('/')
    expect(env.VITE_WALLETCONNECT_PROJECT_ID).toBe('')
    expect(env.VITE_GA_MEASUREMENT_ID).toBe('')
  })

  it('defaults optional Vite vars when omitted', () => {
    const { VITE_WALLETCONNECT_PROJECT_ID: _wc, VITE_GA_MEASUREMENT_ID: _ga, ...rest } = validEnv
    const env = parseEnv(rest)
    expect(env.VITE_WALLETCONNECT_PROJECT_ID).toBe('')
    expect(env.VITE_GA_MEASUREMENT_ID).toBe('')
  })

  it('defaults MODE and VITE_APP_ENV when omitted', () => {
    const { MODE: _mode, VITE_APP_ENV: _appEnv, ...rest } = validEnv
    const env = parseEnv(rest)
    expect(env.MODE).toBe('development')
    expect(env.VITE_APP_ENV).toBe('development')
  })

  it('accepts staging and production app envs', () => {
    expect(parseEnv({ ...validEnv, VITE_APP_ENV: 'staging' }).VITE_APP_ENV).toBe('staging')
    expect(parseEnv({ ...validEnv, VITE_APP_ENV: 'production' }).VITE_APP_ENV).toBe('production')
  })

  it('throws on invalid MODE', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => parseEnv({ ...validEnv, MODE: 'nope' })).toThrow(/Invalid environment/i)
    spy.mockRestore()
  })

  it('throws on invalid VITE_APP_ENV', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => parseEnv({ ...validEnv, VITE_APP_ENV: 'local' })).toThrow(/Invalid environment/i)
    spy.mockRestore()
  })
})
