import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'

vi.mock('@layerzerolabs/lz-sui-oft-sdk-v2', () => ({
  OFT: class {
    constructor(
      public sdk: unknown,
      public callCapId: string,
      public oftObjectId: string | undefined,
      public coinType: string | undefined,
      public oappObjectId: string | undefined,
    ) {}
  },
}))

vi.mock('@layerzerolabs/lz-sui-sdk-v2', () => ({
  SDK: class {
    constructor(_opts: unknown) {}
  },
}))

vi.mock('@layerzerolabs/lz-definitions', () => ({
  Stage: { MAINNET: 'mainnet' },
}))

import {
  buildSuiOftSendParam,
  createSuiOft,
  isSuiOftSourceConfigured,
} from '@/features/bridge/lib/sui-oft'

const configured: Token = {
  name: 'sUSN',
  symbol: 'sUSN',
  decimals: 6,
  iconSlug: 'susn',
  contractAddress: '0xcoin' as Token['contractAddress'],
  layerzeroOftAddress: '0xcap' as Token['layerzeroOftAddress'],
  layerzeroOftObjectId: '0xoft' as Token['layerzeroOftObjectId'],
  layerzeroOappObjectId: '0xoapp' as Token['layerzeroOappObjectId'],
}

describe('isSuiOftSourceConfigured', () => {
  it('requires call-cap/address + oft object + oapp object', () => {
    expect(isSuiOftSourceConfigured(undefined)).toBe(false)
    expect(isSuiOftSourceConfigured(configured)).toBe(true)
    expect(
      isSuiOftSourceConfigured({
        ...configured,
        layerzeroOftObjectId: undefined,
      }),
    ).toBe(false)
  })
})

describe('createSuiOft', () => {
  it('returns undefined without a call-cap identity', () => {
    expect(
      createSuiOft(
        {},
        { ...configured, layerzeroOftAddress: undefined, layerzeroOftCallCapId: undefined },
      ),
    ).toBeUndefined()
  })

  it('builds an OFT when source is configured', () => {
    const oft = createSuiOft({ fake: true }, configured)
    expect(oft).toBeTruthy()
  })
})

describe('buildSuiOftSendParam', () => {
  it('encodes dst eid, amountLD, and minAmountLD at source decimals', () => {
    const param = buildSuiOftSendParam(30101, '0x1111111111111111111111111111111111111111', 12.5, 6)
    expect(param.dstEid).toBe(30101)
    expect(param.amountLd).toBe(12_500_000n)
    // slippageAdjustedAmount(..., 1) applies 1% min-out haircut.
    expect(param.minAmountLd).toBe(12_375_000n)
    expect(param.to).toBeInstanceOf(Uint8Array)
    expect(param.extraOptions.byteLength).toBeGreaterThan(0)
  })
})
