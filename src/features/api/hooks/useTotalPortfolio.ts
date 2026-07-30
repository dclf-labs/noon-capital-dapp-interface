import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { type Address } from '@/lib/address'
import { isAddressValid } from '@/lib/address'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type TotalPortfolioResponse = {
  user_address: string
  date: string
  protocols: {
    protocol: string
    chain: string
    usn_position: string
    susn_position: string
    usn_value_usd: string
    susn_value_usd: string
    total_value_usd: string
  }[]
  total_usn_value_usd: string
  total_susn_value_usd: string
  total_value_usd: string
}

const DEFAULT_TOTAL_PORTFOLIO: TotalPortfolioResponse = {
  user_address: '',
  date: '',
  protocols: [],
  total_usn_value_usd: '',
  total_susn_value_usd: '',
  total_value_usd: '',
}

const useTotalPortfolio = ({ address }: { address: Address | undefined }) => {
  const fetcher = async () => {
    if (!address) {
      return DEFAULT_TOTAL_PORTFOLIO
    }

    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/user/${address?.toLowerCase()}/position-values-by-protocol`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch total portfolio data.')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as TotalPortfolioResponse)
      .catch((err) => {
        console.error('Error fetching total portfolio data:', err)
        return DEFAULT_TOTAL_PORTFOLIO
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryFn: fetcher,
    queryKey: queryKeys.user.portfolio(address),
    placeholderData: DEFAULT_TOTAL_PORTFOLIO,
    initialData: () => DEFAULT_TOTAL_PORTFOLIO,
    enabled: isAddressValid(address),
    select: (data: TotalPortfolioResponse) => {
      return data || DEFAULT_TOTAL_PORTFOLIO
    },
  })

  return useMemo(
    () => ({
      data: data || DEFAULT_TOTAL_PORTFOLIO,
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useTotalPortfolio
