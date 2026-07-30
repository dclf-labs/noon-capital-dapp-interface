import type { Account, Chain } from 'viem'
import { describe, expect, it } from 'vitest'

import { ethereumConfig } from '@/config'
import { getTxnPayload } from '@/lib/evmTxn'

const chain = { id: 1 } as Chain
const account = {
  address: '0x1111111111111111111111111111111111111111',
} as unknown as Account
const abi = [
  { type: 'function', name: 'transfer', inputs: [], outputs: [], stateMutability: 'nonpayable' },
] as const
const to = '0x2222222222222222222222222222222222222222' as const

describe('getTxnPayload', () => {
  it('builds a base write-contract payload', () => {
    const payload = getTxnPayload(ethereumConfig, chain, account, abi as never, 'transfer', to, [])
    expect(payload).toMatchObject({
      functionName: 'transfer',
      address: to,
      chain,
      account,
      args: [],
    })
    expect(payload).not.toHaveProperty('value')
    expect(payload).not.toHaveProperty('gas')
  })

  it('includes value when positive', () => {
    const payload = getTxnPayload(
      ethereumConfig,
      chain,
      account,
      abi as never,
      'transfer',
      to,
      [],
      10n,
    )
    expect(payload.value).toBe(10n)
  })

  it('omits zero value', () => {
    const payload = getTxnPayload(
      ethereumConfig,
      chain,
      account,
      abi as never,
      'transfer',
      to,
      [],
      0n,
    )
    expect(payload).not.toHaveProperty('value')
  })

  it('attaches an explicit gas limit', () => {
    const payload = getTxnPayload(
      ethereumConfig,
      chain,
      account,
      abi as never,
      'transfer',
      to,
      [],
      undefined,
      21000n,
    )
    expect(payload.gas).toBe(21000n)
  })

  it('supports value and gas together', () => {
    const payload = getTxnPayload(
      ethereumConfig,
      chain,
      account,
      abi as never,
      'transfer',
      to,
      [],
      1n,
      50_000n,
    )
    expect(payload.value).toBe(1n)
    expect(payload.gas).toBe(50_000n)
  })
})
