import { useCallback, useMemo } from 'react'

import type { Address } from '@/lib/address'
import { isAddressValid } from '@/lib/address'
import type { Connection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { ApiRequestStatus } from '@/lib/types'

const sendQuestCompleteOrder = async (
  address: Address,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    if (!isAddressValid(address)) {
      throw new Error('Invalid ethereum address')
    }

    return await fetch(`${appEnv.api.baseUrl}/api/v1/quests/${address}/share-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(
      (res) => {
        if (res.ok) {
          setTxnStatus?.(ApiRequestStatus.API_CALL_SUCCESS)
          return true
        }
        throw new Error('Error occured when sharing quest complete.')
      },
      () => {
        throw new Error('Error occured when sharing quest complete.')
      },
    )
  } catch (error) {
    console.error('Error sharing quest complete', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const useShareQuestComplete = () => {
  const onSubmit = useCallback(
    async (
      connection: Connection,
      address: Address | undefined,
      callback?: () => void,
      setTxnStatus?: (status: ApiRequestStatus) => void,
    ) => {
      try {
        setTxnStatus?.(ApiRequestStatus.PROCESSING)

        if (!connection.config?.id || !connection.address || !address || !isAddressValid(address)) {
          throw new Error('Invalid parameters')
        }

        try {
          const success = await sendQuestCompleteOrder(address, setTxnStatus)

          if (success) {
            callback?.()
          } else {
            setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
          }
        } catch {
          setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
        }
      } catch (error) {
        console.error('Error sharing quest complete', error)
        setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useShareQuestComplete
