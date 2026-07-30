import { type Token } from '@/config/token'
import { getSwapSpender } from '@/features/swap/lib/spender'
import useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { type EVMConnection } from '@/lib/connection'

const useBuyAllowance = (connection: EVMConnection, token: Token | undefined) =>
  useTokenAllowance(connection, getSwapSpender(connection.config), token)

export default useBuyAllowance
