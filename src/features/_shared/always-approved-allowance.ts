import { maxUint256 } from 'viem'

import { type Token } from '@/config/token'
import type { TokenQueryResult } from '@/hooks/on-chain/types'
import { rawUnitsToNumber } from '@/lib/format'

/**
 * Stub allowance for flows that transfer directly (no ERC-20 approve),
 * e.g. Starknet buy/sell via router. Always reports max so the UI skips approve.
 */
export const createAlwaysApprovedAllowance = (token: Token | undefined): TokenQueryResult => ({
  isLoading: false,
  isError: false,
  isFetching: false,
  refetch: () => Promise.resolve(),
  data: rawUnitsToNumber(maxUint256, token?.decimals),
})
