import { type Token } from '@/config/token'
import useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EVMConnection } from '@/lib/connection'

const useStakeAllowance = (connection: EVMConnection, token: Token | undefined) => {
  return useTokenAllowance(connection, connection.config?.stakingVault, token)
}

export default useStakeAllowance
