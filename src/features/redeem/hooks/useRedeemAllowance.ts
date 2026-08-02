import { type Token } from '@/config/token'
import useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EVMConnection } from '@/lib/connection'

/** Allowance spender is DirectRedeemer (on-chain path used by the UI). */
const useRedeemAllowance = (connection: EVMConnection, token: Token | undefined) => {
  return useTokenAllowance(connection, connection.config?.directRedeemer, token)
}

export default useRedeemAllowance
