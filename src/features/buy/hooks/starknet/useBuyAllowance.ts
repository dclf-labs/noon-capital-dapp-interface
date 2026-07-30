import { maxUint256 } from 'viem'

import { type Token } from '@/config/token'
import { type StarknetConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'

const useBuyAllowance = (_: StarknetConnection, token: Token | undefined) => {
  return {
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: () => Promise.resolve(),
    data: toNum(bnToStr(maxUint256, token?.decimals)),
  }
}

export default useBuyAllowance
