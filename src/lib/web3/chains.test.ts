import { describe, expect, it } from 'vitest'

import { getChainMeta } from '@/lib/web3/chains'
import { isSupportedChainId, supportedChains } from '@/lib/web3/config'

describe('web3 chains', () => {
  it('exposes multiple supported networks', () => {
    expect(supportedChains.length).toBeGreaterThanOrEqual(5)
  })

  it('returns metadata for ethereum mainnet', () => {
    const meta = getChainMeta(1)
    expect(meta.name).toBe('Ethereum')
    expect(meta.shortName).toBe('ETH')
    expect(meta.key).toBe('ethereum')
  })

  it('falls back for unknown chain ids without pretending ethereum', () => {
    const meta = getChainMeta(999999)
    expect(meta.key).toBe('unknown')
    expect(meta.name).toContain('999999')
  })

  it('type-guards supported chain ids', () => {
    expect(isSupportedChainId(1)).toBe(true)
    expect(isSupportedChainId(999999)).toBe(false)
  })
})
