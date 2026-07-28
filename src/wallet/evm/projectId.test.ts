import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEV_PLACEHOLDER_PROJECT_ID, resolveWalletConnectProjectId } from '@/wallet/evm/projectId'

describe('resolveWalletConnectProjectId', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a trimmed real project id', () => {
    expect(
      resolveWalletConnectProjectId({
        projectId: '  abcdefabcdefabcdefabcdefabcdef12  ',
        isProd: true,
        isDev: false,
      }),
    ).toBe('abcdefabcdefabcdefabcdefabcdef12')
  })

  it('throws in production when unset', () => {
    expect(() =>
      resolveWalletConnectProjectId({
        projectId: '   ',
        isProd: true,
        isDev: false,
      }),
    ).toThrow(/VITE_WALLETCONNECT_PROJECT_ID is required in production/i)
  })

  it('warns in development and returns the placeholder', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(
      resolveWalletConnectProjectId({
        projectId: '',
        isProd: false,
        isDev: true,
      }),
    ).toBe(DEV_PLACEHOLDER_PROJECT_ID)

    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/VITE_WALLETCONNECT_PROJECT_ID is empty/i)
  })

  it('returns the placeholder in non-prod without warning when not in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(
      resolveWalletConnectProjectId({
        projectId: '',
        isProd: false,
        isDev: false,
      }),
    ).toBe(DEV_PLACEHOLDER_PROJECT_ID)

    expect(warn).not.toHaveBeenCalled()
  })
})
