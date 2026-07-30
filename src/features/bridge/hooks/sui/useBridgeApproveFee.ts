import { type Token } from '@/config/token'
import useLayerzeroBridgeApproveFee from '@/features/bridge/hooks/sui/useLayerzeroBridgeApproveFee'
import { type SuiConnection } from '@/lib/connection'

const useBridgeApproveFee = (connection: SuiConnection, token: Token | undefined) => {
  return useLayerzeroBridgeApproveFee(connection, token)
}

export default useBridgeApproveFee
