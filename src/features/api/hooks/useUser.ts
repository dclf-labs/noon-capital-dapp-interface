import { apiAddressPath, apiFetch } from '@/features/api/lib/api-fetch'
import { useApiQuery } from '@/hooks/query/useApiQuery'
import { isAddressValid } from '@/lib/address'
import type { Connection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'

export type UserResponse = {
  badges: {
    id: number
    code: string
    name: string
    description: string
    icon_url: string
    rarity: string
    earned_at: string
  }[]
}

export const DEFAULT_USER_RESPONSE: UserResponse = {
  badges: [],
}

const useUser = (connection: Connection) => {
  return useApiQuery({
    queryKey: queryKeys.user.profile(connection.address),
    enabled: isAddressValid(connection.address),
    queryFn: async () => {
      try {
        return await apiFetch<UserResponse>(`/api/v1/user/${apiAddressPath(connection.address)}`)
      } catch {
        return DEFAULT_USER_RESPONSE
      }
    },
    select: (data) => data || DEFAULT_USER_RESPONSE,
  })
}

export default useUser
