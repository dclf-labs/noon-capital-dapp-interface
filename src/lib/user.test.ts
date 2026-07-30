import { describe, expect, it } from 'vitest'

import { DEFAULT_AVATAR, DEFAULT_USERNAME } from '@/constants/api'
import { getAvatar, getName } from '@/lib/user'

describe('user display helpers', () => {
  it('returns the username when present', () => {
    expect(getName('alice')).toBe('alice')
  })

  it('falls back to the default username', () => {
    expect(getName(undefined)).toBe(DEFAULT_USERNAME)
    expect(getName('')).toBe(DEFAULT_USERNAME)
  })

  it('returns the default avatar', () => {
    expect(getAvatar()).toBe(DEFAULT_AVATAR)
  })
})
