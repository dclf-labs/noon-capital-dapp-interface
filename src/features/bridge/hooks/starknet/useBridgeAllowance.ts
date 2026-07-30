import { type Token } from '@/config/token'
import useHyperlaneBridgeAllowance from '@/features/bridge/hooks/starknet/useHyperlaneBridgeAllowance'
import { type StarknetConnection } from '@/lib/connection'

const useBridgeAllowance = (connection: StarknetConnection, token: Token | undefined) => {
  const hyperlaneAllowance = useHyperlaneBridgeAllowance(connection, token)
  return hyperlaneAllowance
}

export default useBridgeAllowance
