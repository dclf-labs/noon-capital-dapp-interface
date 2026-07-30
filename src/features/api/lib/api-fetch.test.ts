import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as EnvModule from '@/lib/env'

vi.mock('@/lib/env', async (importOriginal) => {
  const actual = await importOriginal<typeof EnvModule>()
  return {
    ...actual,
    appEnv: {
      ...actual.appEnv,
      api: { baseUrl: 'https://api.example.test' },
    },
  }
})

import { apiAddressPath, ApiError, apiFetch } from '@/features/api/lib/api-fetch'

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prefixes paths with the configured API base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/v1/ping')

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/v1/ping', undefined)
  })

  it('throws ApiError on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    await expect(apiFetch('/api/v1/down')).rejects.toBeInstanceOf(ApiError)
  })

  it('normalizes address path segments', () => {
    expect(apiAddressPath('0xAbC')).toBe('0xabc')
    expect(apiAddressPath(undefined)).toBe('')
  })
})
