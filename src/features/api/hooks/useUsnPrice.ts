import { toNum } from '@/lib/format'

const useUsnPrice = () => {
  return { isLoading: false, isError: false, data: toNum(1), isFetching: false }
}

export default useUsnPrice
