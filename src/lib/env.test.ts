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

  it('throws on invalid configuration', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => parseEnv({ ...validEnv, MODE: 'nope' })).toThrow(/Invalid environment/i)
    spy.mockRestore()
  })
})
