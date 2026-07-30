import { useCallback, useMemo } from 'react'

import type { Signature } from 'starknet'

import type { Address } from '@/lib/address'
import { isEVMAddressValid } from '@/lib/address'
import type { Connection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { ApiRequestStatus } from '@/lib/types'

const sendLinkingOrder = async (
  signature: Signature,
  starknetAddress: Address,
  ethereumAddress: string | undefined,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    if (!ethereumAddress || !ethereumAddress?.length || !signature) {
      throw new Error('Invalid ethereum address')
    }

    return await fetch(`${appEnv.api.baseUrl}/api/link/starknet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature,
        starknetAddress,
        ethereumAddress,
      }),
    }).then(
      (res) => {
        if (res.ok) {
          setTxnStatus?.(ApiRequestStatus.API_CALL_SUCCESS)
          return true
        }
        throw new Error('Error occured when linking starknet with ethereum wallet.')
      },
      () => {
        throw new Error('Error occured when linking starknet with ethereum wallet.')
      },
    )
  } catch (error) {
    console.error('Error linking starknet with ethereum wallet', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const useLinkEthWallet = () => {
  const onSubmit = useCallback(
    async (
      connection: Connection,
      signature: Signature | null | undefined,
      starknetAddress: Address | undefined,
      ethereumAddress: string | undefined,
      callback?: () => void,
      setTxnStatus?: (status: ApiRequestStatus) => void,
    ) => {
      try {
        setTxnStatus?.(ApiRequestStatus.PROCESSING)

        if (
          !connection.config?.id ||
          !connection.address ||
          !signature ||
          !starknetAddress ||
          !ethereumAddress ||
          !isEVMAddressValid(ethereumAddress as Address | undefined)
        ) {
          throw new Error('Invalid parameters')
        }

        try {
          const success = await sendLinkingOrder(
            signature,
            starknetAddress,
            ethereumAddress,
            setTxnStatus,
          )

          if (success) {
            callback?.()
          } else {
            setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
          }
        } catch {
          setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
        }
      } catch (error) {
        console.error('Error linking starknet with ethereum wallet', error)
        setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useLinkEthWallet
