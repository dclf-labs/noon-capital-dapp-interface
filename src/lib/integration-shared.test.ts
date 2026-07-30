import { describe, expect, it } from 'vitest'

import { API_QUERY_DEFAULTS } from '@/hooks/query/useApiQuery'
import { CHAIN_QUERY_DEFAULTS } from '@/hooks/query/useChainQuery'
import { TxnStatus } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'

describe('query envelopes', () => {
  it('keeps chain reads refetching while API reads stay quiet', () => {
    expect(CHAIN_QUERY_DEFAULTS.refetchOnWindowFocus).toBe(true)
    expect(API_QUERY_DEFAULTS.refetchOnWindowFocus).toBe(false)
    expect(API_QUERY_DEFAULTS.retry).toBe(2)
  })
})

describe('queryKeys coverage', () => {
  it('namespaces mint / redeem / stake / unstake previews distinctly', () => {
    expect(queryKeys.mint.preview(1)[0]).toBe('mint')
    expect(queryKeys.redeem.preview(1)[0]).toBe('redeem')
    expect(queryKeys.stake.preview(1)[0]).toBe('stake')
    expect(queryKeys.unstake.preview(1)[0]).toBe('unstake')
  })

  it('scopes user API keys by address', () => {
    expect(queryKeys.points.user('0x1')).toEqual(['points', 'user', '0x1'])
    expect(queryKeys.user.profile('0x1')).toEqual(['user', 'profile', '0x1'])
    expect(queryKeys.referral.code('0x1')).toEqual(['referral', 'code', '0x1'])
  })

  it('nests gas and withdraw keys', () => {
    expect(queryKeys.gas.fee('evm', '0x')[0]).toBe('gas')
    expect(queryKeys.withdraw.requests('0x')[0]).toBe('withdraw')
  })
})

describe('TxnStatus', () => {
  it('exposes a stable status enum for submit helpers', () => {
    expect(TxnStatus.IDLE).toBe(0)
    expect(TxnStatus.TXN_SUCCESS).toBeGreaterThan(TxnStatus.PROCESSING)
  })
})
