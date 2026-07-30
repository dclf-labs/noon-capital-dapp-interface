import { beforeEach, describe, expect, it, vi } from 'vitest'

const open = vi.fn()

describe('openEvmAppKit', () => {
  beforeEach(() => {
    open.mockReset()
    vi.resetModules()
  })

  it('opens AppKit on the eip155 Connect view', async () => {
    open.mockResolvedValue(undefined)
    vi.doMock('@/wallet/evm/config', () => ({
      appKit: { open },
    }))
    const { openEvmAppKit } = await import('@/wallet/evm/open-appkit')
    await openEvmAppKit()
    expect(open).toHaveBeenCalledWith({ view: 'Connect', namespace: 'eip155' })
  })

  it('throws when AppKit is not initialized', async () => {
    vi.doMock('@/wallet/evm/config', () => ({
      appKit: null,
    }))
    const { openEvmAppKit } = await import('@/wallet/evm/open-appkit')
    await expect(openEvmAppKit()).rejects.toThrow(/AppKit is not initialized/i)
  })
})
