import { getAddress, isAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import ethereum from '@/config/chains/ethereum'

/**
 * Lock production DirectMinter / DirectRedeemer addresses.
 * Note: an older staging snapshot briefly pointed redeemer at 0xCee62… (no mainnet code).
 * Live mainnet bytecode is on the addresses below.
 */
describe('ethereum direct mint/redeem addresses', () => {
  it('locks DirectMinter and DirectRedeemer to known mainnet deployments', () => {
    expect(ethereum.directMinter).toBe(getAddress('0xB91b361ebE4022Bb62dF0651bDD09b21209ac058'))
    expect(ethereum.directRedeemer).toBe(getAddress('0x3Db3260fFf8f5f97c96Ae2fE871A9359D46eB566'))
  })

  it('keeps DirectRedeemer distinct from legacy redeemHandler', () => {
    expect(ethereum.directRedeemer).toBeTruthy()
    expect(isAddress(ethereum.directRedeemer!)).toBe(true)
    expect(ethereum.directRedeemer).not.toBe(ethereum.redeemHandler)
    expect(ethereum.directMinter).not.toBe(ethereum.mintHandler)
  })

  it('seeds mint/redeem collateral lists used by providers', () => {
    expect(ethereum.mintCollaterals).toEqual(expect.arrayContaining(['USDT', 'USDC']))
    expect(ethereum.redeemCollaterals).toEqual(['USDC'])
  })
})
