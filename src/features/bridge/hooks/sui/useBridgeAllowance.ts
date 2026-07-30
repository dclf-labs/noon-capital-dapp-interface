import { type Token } from '@/config/token'
import useLayerzeroBridgeAllowance from '@/features/bridge/hooks/sui/useLayerzeroBridgeAllowance'
import { type SuiConnection } from '@/lib/connection'

const useBridgeAllowance = (connection: SuiConnection, token: Token | undefined) => {
  return useLayerzeroBridgeAllowance(connection, token)
}

export default useBridgeAllowance
