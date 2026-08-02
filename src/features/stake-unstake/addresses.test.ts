import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import ethereum from '@/config/chains/ethereum'

describe('ethereum stake / unstake / withdraw addresses', () => {
  it('locks staking vault (= sUSN) and withdraw handler', () => {
    expect(ethereum.stakingVault).toBe(getAddress('0xE24a3DC889621612422A64E6388927901608B91D'))
    expect(ethereum.susn).toBe(ethereum.stakingVault)
    expect(ethereum.stakeWithdrawHandler).toBe(
      getAddress('0x0DaBc0D9B270c9B0C4C77AaCeAa712b56D0F9178'),
    )
  })

  it('keeps withdraw handler distinct from the vault', () => {
    expect(ethereum.stakeWithdrawHandler).not.toBe(ethereum.stakingVault)
  })
})
