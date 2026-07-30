import { apiAddressPath, apiFetch } from '@/features/api/lib/api-fetch'
import { useApiQuery } from '@/hooks/query/useApiQuery'
import { isAddressValid } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'

export type ReferralCodeResponse = {
  ownCode: string
}

const useReferralCode = (connection: EVMConnection) => {
  return useApiQuery({
    queryKey: queryKeys.referral.code(connection.address),
    enabled: isAddressValid(connection.address),
    queryFn: async () => {
      const json = await apiFetch<ReferralCodeResponse>(
        `/api/v1/referral-code/${apiAddressPath(connection.address)}`,
      )
      return (json.ownCode ?? '') as string
    },
  })
}

export default useReferralCode
