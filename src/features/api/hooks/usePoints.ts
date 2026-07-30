import { apiAddressPath, apiFetch } from '@/features/api/lib/api-fetch'
import { useApiQuery } from '@/hooks/query/useApiQuery'
import { isAddressValid } from '@/lib/address'
import type { Connection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'

export type PointsResponse = {
  totalPoints: string
  byChain: {
    [id: string]: {
      total: string
      byProtocol: {
        [name: string]: {
          total: string
          last24h: string
          bySeasons: {
            [season: string]: {
              total: string
            }
          }
        }
      }
    }
  }
  referralPoints: {
    total: string
    earned: string
    fromReferrals: string
    referrerAddress: string
  }
}

export const DEFAULT_POINTS_RESPONSE: PointsResponse = {
  byChain: {},
  totalPoints: '0',
  referralPoints: {
    earned: '0',
    fromReferrals: '0',
    total: '0',
    referrerAddress: '',
  },
}

const usePoints = (connection: Connection) => {
  return useApiQuery({
    queryKey: queryKeys.points.user(connection.address),
    enabled: isAddressValid(connection.address),
    queryFn: async () => {
      try {
        return await apiFetch<PointsResponse>(
          `/api/v1/points/${apiAddressPath(connection.address)}`,
        )
      } catch {
        return DEFAULT_POINTS_RESPONSE
      }
    },
    select: (data) => data || DEFAULT_POINTS_RESPONSE,
  })
}

export default usePoints
