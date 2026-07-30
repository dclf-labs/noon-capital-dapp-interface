import { type Token } from '@/config/token'
import useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EVMConnection } from '@/lib/connection'

const useRedeemAllowance = (connection: EVMConnection, token: Token | undefined) => {
  return useTokenAllowance(connection, connection.config?.redeemHandler, token)
}

export default useRedeemAllowance
