import { type Token } from '@/config/token'
import useApproveGasFee from '@/hooks/on-chain/evm/useApproveFee'
import { type EVMConnection } from '@/lib/connection'

const useGovernanceOpenStakeApproveFee = (connection: EVMConnection, token: Token | undefined) => {
  return useApproveGasFee(connection, token, connection.config?.sNoon)
}

export default useGovernanceOpenStakeApproveFee
