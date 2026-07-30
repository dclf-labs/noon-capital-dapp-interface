import { type Token } from '@/config/token'
import useCollateralPrice from '@/features/api/hooks/useCollateralPrice'
import useSusnPrice from '@/features/api/hooks/useSusnPrice'
import useUsnPrice from '@/features/api/hooks/useUsnPrice'
import { toNum } from '@/lib/format'

const useTokenPrice = (token: Token | undefined) => {
  const usnPrice = useUsnPrice()
  const susnPrice = useSusnPrice()
  const collateralPrice = useCollateralPrice(token)

  if (!token || !token?.symbol) {
    return { isLoading: false, isError: false, data: toNum(undefined), isFetching: false }
  }

  if (token.symbol.toUpperCase() === 'SUSN') {
    return susnPrice
  }

  if (token.symbol.toUpperCase() === 'USN') {
    return usnPrice
  }

  return collateralPrice
}

export default useTokenPrice
