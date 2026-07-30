import { type Token } from '@/config/token'
import { getSwapSpender } from '@/features/swap/lib/spender'
import useApproveGasFee from '@/hooks/on-chain/evm/useApproveFee'
import { type EVMConnection } from '@/lib/connection'

const useSellApproveFee = (connection: EVMConnection, token: Token | undefined) =>
  useApproveGasFee(connection, token, getSwapSpender(connection.config))

export default useSellApproveFee
