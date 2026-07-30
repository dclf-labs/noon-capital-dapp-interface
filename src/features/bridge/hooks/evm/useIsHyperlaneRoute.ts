import { useMemo } from 'react'

import { STARKNET_BRIDGE_DESTINATION } from '@/constants/common'
import type { EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

const useIsHyperlaneRoute = (
  connection: EVMConnection,
  destinationConnection: EVMConnection | undefined,
) => {
  return useMemo(() => {
    const destinationId = destinationConnection?.config?.id

    if (!destinationId) {
      return true
    }

    if (destinationId === STARKNET_BRIDGE_DESTINATION?.id) {
      return true
    }

    return !!connection.config?.useHyperlane?.[toNum(destinationId)]
  }, [connection.config?.useHyperlane, destinationConnection?.config?.id])
}

export default useIsHyperlaneRoute
