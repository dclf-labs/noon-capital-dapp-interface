import { type Token } from '@/config/token'
import useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EVMConnection } from '@/lib/connection'

const useGovernanceOpenStakeAllowance = (connection: EVMConnection, token: Token | undefined) => {
  return useTokenAllowance(connection, connection.config?.sNoon, token)
}

export default useGovernanceOpenStakeAllowance
