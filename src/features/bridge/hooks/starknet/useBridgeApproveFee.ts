import { type Token } from '@/config/token'
import useHyperlaneBridgeApproveFee from '@/features/bridge/hooks/starknet/useHyperlaneBridgeApproveFee'
import { type StarknetConnection } from '@/lib/connection'

const useBridgeApproveFee = (connection: StarknetConnection, token: Token | undefined) => {
  const hyperlaneApproveFee = useHyperlaneBridgeApproveFee(connection, token)
  return hyperlaneApproveFee
}

export default useBridgeApproveFee
