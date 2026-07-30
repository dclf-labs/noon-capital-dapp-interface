import { type Token } from '@/config/token'
import useApproveGasFee from '@/hooks/on-chain/evm/useApproveFee'
import { type EVMConnection } from '@/lib/connection'

const useStakeApproveFee = (connection: EVMConnection, token: Token | undefined) => {
  return useApproveGasFee(connection, token, connection.config?.stakingVault)
}

export default useStakeApproveFee
