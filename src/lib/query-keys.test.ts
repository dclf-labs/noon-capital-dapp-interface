import { describe, expect, it } from 'vitest'

import { queryKeys } from '@/lib/query-keys'

describe('queryKeys', () => {
  it('keeps buy and sell preview caches distinct', () => {
    const buy = queryKeys.buy.preview('0x1', '0x2', 1)
    const sell = queryKeys.sell.preview('0x1', '0x2', 1)
    expect(buy[0]).toBe('buy')
    expect(sell[0]).toBe('sell')
    expect(buy).not.toEqual(sell)
  })

  it('nests bridge fee quotes by protocol and family', () => {
    expect(queryKeys.bridge.feeQuote('layerzero', 'evm', 1)[0]).toBe('bridge')
    expect(queryKeys.bridge.feeQuote('hyperlane', 'sui')[2]).toBe('hyperlane')
  })

  it('scopes token balances by chain family', () => {
    expect(queryKeys.token.balance('evm', '0xabc')[2]).toBe('evm')
    expect(queryKeys.token.balance('starknet', '0xabc')[2]).toBe('starknet')
  })
})
