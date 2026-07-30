import { maxUint256 } from 'viem'

import { type Token } from '@/config/token'
import { type SuiConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'

/** Sui OFT send spends coins directly in the PTB — no ERC-20 style allowance. */
const useLayerzeroBridgeAllowance = (_: SuiConnection, token: Token | undefined) => {
  return {
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: () => Promise.resolve(),
    data: toNum(bnToStr(maxUint256, token?.decimals)),
  }
}

export default useLayerzeroBridgeAllowance
