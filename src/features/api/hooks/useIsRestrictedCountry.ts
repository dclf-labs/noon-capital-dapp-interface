import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { PROHIBITED_COUNTRY_ALPHA2, PROHIBITED_COUNTRY_NUMERIC } from '@/constants/api'
import { appEnv } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'

export type RestrictedCountryResponse = {
  country: string
  countryCode: {
    country: string
    alpha2: string
    alpha3: string
    numeric: string
  }
  region: string
  city: string
  timezone: string
}

export const DEFAULT_RESTRICTED_COUNTRY_RESPONSE: RestrictedCountryResponse = {
  country: '',
  countryCode: { alpha2: '', alpha3: '', numeric: '0' },
  region: '',
  city: '',
  timezone: '',
} as RestrictedCountryResponse

const useIsRestrictedCountry = () => {
  const fetcher = async () => {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/country`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }

          throw new Error('Failed to fetch user country')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then((json) => json as RestrictedCountryResponse)
      .catch(() => {
        return DEFAULT_RESTRICTED_COUNTRY_RESPONSE
      })
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    enabled: true,
    queryFn: fetcher,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    refetchIntervalInBackground: false,
    queryKey: queryKeys.user.restrictedCountry(),
    select: (data) => {
      const country = data || DEFAULT_RESTRICTED_COUNTRY_RESPONSE
      return (
        PROHIBITED_COUNTRY_ALPHA2?.includes?.(country.countryCode.alpha2) ||
        PROHIBITED_COUNTRY_NUMERIC?.includes?.(country.countryCode.numeric)
      )
    },
  })

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      isFetching,
    }),
    [data, isError, isLoading, isFetching],
  )
}

export default useIsRestrictedCountry
