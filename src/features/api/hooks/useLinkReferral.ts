import { useCallback, useMemo } from 'react'

import type { Config } from '@wagmi/core'
import { getWalletClient } from '@wagmi/core'
import type { WalletClient } from 'viem'

import type { Address } from '@/lib/address'
import { getAddressOrZeroAddress } from '@/lib/address'
import type { Connection } from '@/lib/connection'
import { appEnv } from '@/lib/env'
import { toNum } from '@/lib/format'
import { secureRandomNonce } from '@/lib/secure-random'
import { ApiRequestStatus } from '@/lib/types'
import { canWriteSession } from '@/lib/wallet-session'
import { wagmiConfig } from '@/wallet/evm/config'

const sendLinkReferral = async (
  address: Address,
  message: number,
  signature: string,
  referralCode: string,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    return await fetch(
      `${appEnv.api.baseUrl}/api/v1/user/register-code/${address?.toLowerCase()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: referralCode,
          message: message,
          signature,
        }),
      },
    ).then(
      (res) => {
        if (res.ok) {
          setTxnStatus?.(ApiRequestStatus.API_CALL_SUCCESS)
          return true
        }

        throw new Error('Error')
      },
      (err) => {
        throw new Error('Error' + err?.message)
      },
    )
  } catch (error) {
    console.error('Error sending minting order', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const signReferralLinking = async (
  wallet: WalletClient,
  address: Address,
  referralCode: string,
  setTxnStatus?: (status: ApiRequestStatus) => void,
) => {
  try {
    const message = secureRandomNonce()
    const MESSAGE = `Authentication ${address?.toLowerCase()}`

    setTxnStatus?.(ApiRequestStatus.PROCESSING)

    if (!address || !address?.length) {
      setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      return
    }

    return await wallet
      .signMessage({
        message: MESSAGE,
        account: getAddressOrZeroAddress(address),
      })
      .then((signature) =>
        sendLinkReferral(address, message, signature, referralCode, setTxnStatus),
      )
  } catch (error) {
    console.error('Error signing referral linking', error)
    setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
    return false
  }
}

const useLinkReferral = () => {
  const onSubmit = useCallback(
    async (
      connection: Connection,
      refferalCode: string,
      callback?: () => void,
      setTxnStatus?: (status: ApiRequestStatus) => void,
    ) => {
      try {
        setTxnStatus?.(ApiRequestStatus.IDLE)

        if (
          !canWriteSession(connection) ||
          !connection.config?.id ||
          !connection.address ||
          !refferalCode ||
          !refferalCode?.length
        ) {
          throw new Error('Invalid parameters')
        }

        const write = await getWalletClient(wagmiConfig as Config, {
          chainId: toNum(connection.config?.id),
          account: getAddressOrZeroAddress(connection.address),
        })

        if (write?.chain?.id !== connection.config?.id) {
          throw new Error('Invalid connection')
        }

        setTxnStatus?.(ApiRequestStatus.PROCESSING)

        try {
          const success = await signReferralLinking(
            write,
            connection.address,
            refferalCode,
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
        console.error('Error submitting referral linking order', error)
        setTxnStatus?.(ApiRequestStatus.API_CALL_FAILURE)
      }
    },
    [],
  )

  return useMemo(() => onSubmit, [onSubmit])
}

export default useLinkReferral
