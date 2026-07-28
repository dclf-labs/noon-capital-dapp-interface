import { describe, expect, it } from 'vitest'

import { queryClient } from '@/lib/query'

describe('queryClient', () => {
  it('uses shared defaults suitable for chain reads', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30_000)
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false)
  })
})
