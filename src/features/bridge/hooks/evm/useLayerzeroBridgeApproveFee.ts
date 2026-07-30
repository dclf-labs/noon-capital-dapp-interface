import { type Token } from '@/config/token'
import useApproveGasFee from '@/hooks/on-chain/evm/useApproveFee'
import type { EVMConnection } from '@/lib/connection'

const useBridgeApproveFee = (connection: EVMConnection, token: Token | undefined) => {
  return useApproveGasFee(
    connection,
    token,
    connection.config?.layerzeroOftHelper || token?.layerzeroOftAddress,
  )
}

export default useBridgeApproveFee
