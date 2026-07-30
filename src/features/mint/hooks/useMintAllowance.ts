import { type Token } from '@/config/token'
import useEvmTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EVMConnection } from '@/lib/connection'

const useMintAllowance = (connection: EVMConnection, token: Token | undefined) => {
  return useEvmTokenAllowance(connection, connection.config?.directMinter, token)
}

export default useMintAllowance
