import { useCallback, useMemo } from 'react'

import { type Config, getWalletClient } from '@wagmi/core'
import { type WalletClient } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Address } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { secureRandomNonce } from '@/lib/secure-random'
import { ApiRequestStatus } from '@/lib/types'
import { wagmiConfig } from '@/wallet/evm/config'

const sendUsernameUpdate = async (
  address: Address,
  message: number,
  username: string,
  signature: string,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    return await fetch(`${appEnv.api.baseUrl}/api/v1/user/${address}/username`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        message: message,
        signature: signature,
      }),
    }).then(
      (res) => {
        if (res.ok) {
          setTxnStatus?.(ApiRequestStatus.API_CALL_SUCCESS)
          return true
        }
        throw new Error('Error occured when updating username.')
      },
      () => {
        throw new Error('Error occured when updating username.')
      },
    )
  } catch (error) {
    console.error('Error sending update username', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const signUsernameUpdateData = async (
  wallet: WalletClient,
  address: Address,
  username: string,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    setTxnStatus?.(ApiRequestStatus.PROCESSING)

    const message = secureRandomNonce()
    const MESSAGE = `Authentication ${address?.toLowerCase()}`

    return await wallet
      .signMessage({ message: MESSAGE, account: address })
      .then((signature) => sendUsernameUpdate(address, message, username, signature, setTxnStatus))
  } catch (error) {
    console.error('Error signing username update', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const useUsernameSubmit = () => {
  const onSubmit = useCallback(
    async (
      connection: EVMConnection,
      username: string,
      callback?: () => void,
      setTxnStatus?: (status: ApiRequestStatus) => void,
    ) => {
      try {
        setTxnStatus?.(ApiRequestStatus.IDLE)

        if (!connection.config?.id || !connection.address || !username || !username?.length) {
          throw new Error('Invalid parameters')
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: connection.config?.id as ProtocolChainId,
          account: connection.address,
        })

        if (write?.chain?.id !== connection.config?.id) {
          throw new Error('Invalid connection')
        }

        setTxnStatus?.(ApiRequestStatus.PROCESSING)

        try {
          const success = await signUsernameUpdateData(
            write,
            connection.address,
            username,
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
        console.error('Error submitting minting order', error)
        setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useUsernameSubmit
