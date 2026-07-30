import { type Token } from '@/config/token'
import { type StarknetConnection } from '@/lib/connection'
import { strToBn, toNum } from '@/lib/format'

const useSellApproveFee = (_: StarknetConnection, token: Token | undefined) => {
  return {
    isLoading: false,
    isError: false,
    isFetching: false,
    data: toNum(0),
    gasUsed: strToBn('0', token?.decimals),
  }
}

export default useSellApproveFee
