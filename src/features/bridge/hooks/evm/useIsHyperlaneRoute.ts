import { useMemo } from 'react'

import { isHyperlaneBridgeRoute } from '@/features/bridge/route'
import type { EVMConnection } from '@/lib/connection'

const useIsHyperlaneRoute = (
  connection: EVMConnection,
  destinationConnection: EVMConnection | undefined,
) => {
  return useMemo(
    () =>
      isHyperlaneBridgeRoute(connection.config?.useHyperlane, destinationConnection?.config?.id),
    [connection.config?.useHyperlane, destinationConnection?.config?.id],
  )
}

export default useIsHyperlaneRoute
