import { toNum } from '@/lib/format'

const useRedeemSubmitFee = () => ({
  isLoading: false,
  data: toNum(0),
  isError: false,
  gasUsed: BigInt(0),
  isFetching: false,
})

export default useRedeemSubmitFee
