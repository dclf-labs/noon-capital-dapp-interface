import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import {
  getDirectMintCallArgs,
  getDirectRedeemCallArgs,
  stringifyCallArgs,
} from '@/features/mint-redeem/submit-args'
import { strToBn } from '@/lib/format'

const usdc = {
  contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
  decimals: 6,
}

const usn = {
  contractAddress: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD' as const,
  decimals: 18,
}

describe('directMint calldata args', () => {
  it('orders [collateral, collateralAmount, minUsnAmount] with correct decimals', () => {
    const args = getDirectMintCallArgs(usdc, usn, 12.345678, 12.345678901234567)
    expect(args).toBeDefined()
    expect(args?.[0]).toBe(getAddress(usdc.contractAddress))
    expect(args?.[1]).toBe(strToBn(12.345678, 6))
    // Fractional digits are capped at 12 before unit conversion (float-dust guard).
    expect(args?.[2]).toBe(strToBn('12.345678901234', 18))
  })

  it('returns undefined when required fields are missing', () => {
    expect(getDirectMintCallArgs(undefined, usn, 1, 1)).toBeUndefined()
    expect(getDirectMintCallArgs(usdc, usn, undefined, 1)).toBeUndefined()
  })

  it('truncates float-noisy min amounts so they cannot inflate', () => {
    // Classic float dust from multiplication; must not raise min above the true value.
    const noisy = 0.1 * 3
    const args = getDirectMintCallArgs(usdc, usn, 1, noisy)
    expect(noisy).toBeGreaterThan(0.3)
    expect(args?.[2]).toBe(strToBn('0.3', 18))
  })

  it('falls back for scientific-notation amounts without throwing', () => {
    const tiny = 1e-7
    const args = getDirectMintCallArgs(usdc, usn, 1, tiny)
    expect(args?.[2]).toBe(strToBn(tiny, 18))
  })
})

describe('directRedeem calldata args', () => {
  it('orders [collateral, usnAmount, minCollateralAmount] with correct decimals', () => {
    const args = getDirectRedeemCallArgs(usn, usdc, 100, 99.123456)
    expect(args).toBeDefined()
    expect(args?.[0]).toBe(getAddress(usdc.contractAddress))
    expect(args?.[1]).toBe(strToBn(100, 18))
    expect(args?.[2]).toBe(strToBn(99.123456, 6))
  })

  it('uses tokenOut address (not USN) as collateralAddress', () => {
    const args = getDirectRedeemCallArgs(usn, usdc, 1, 1)
    expect(args?.[0]).toBe(getAddress(usdc.contractAddress))
    expect(args?.[0]).not.toBe(getAddress(usn.contractAddress))
  })
})

describe('stringifyCallArgs', () => {
  it('stringifies bigint args for gas estimation fallbacks', () => {
    const args = getDirectMintCallArgs(usdc, usn, 1, 1)
    const asStrings = stringifyCallArgs(args, [
      '0x0000000000000000000000000000000000000000',
      '1',
      '1',
    ])
    expect(asStrings[1]).toBe(args?.[1].toString())
    expect(asStrings[2]).toBe(args?.[2].toString())
  })
})
