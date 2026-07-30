import { type Token } from '@/config/token'
import useEvmApproveGasFee from '@/hooks/on-chain/evm/useApproveFee'
import { type EVMConnection } from '@/lib/connection'

const useMintApproveFee = (connection: EVMConnection, token: Token | undefined) => {
  return useEvmApproveGasFee(connection, token, connection.config?.directMinter)
}

export default useMintApproveFee
