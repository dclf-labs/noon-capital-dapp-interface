import { useCallback, useState } from 'react'

import { useCurrentClient, useDAppKit, useWalletConnection } from '@mysten/dapp-kit-react'

/**
 * Compatibility shims for the legacy `@mysten/dapp-kit` hook names used by
 * ported Noon hooks. Prefer `useCurrentClient` / `useDAppKit` in new code.
 */

export function useSuiClient() {
  return useCurrentClient()
}

/**
 * Thin wrapper around dApp Kit `signAndExecuteTransaction`.
 * Matches the mutateAsync-style API of the previous `useSignAndExecuteTransaction`.
 */
export function useSignAndExecuteTransaction() {
  const dAppKit = useDAppKit()
  const connection = useWalletConnection()
  const [isPending, setIsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutateAsync = useCallback(
    async (args: {
      transaction: Parameters<typeof dAppKit.signAndExecuteTransaction>[0]['transaction']
    }) => {
      if (!connection.isConnected) {
        throw new Error('No Sui wallet is connected.')
      }
      setIsPending(true)
      setIsError(false)
      setIsSuccess(false)
      try {
        const result = await dAppKit.signAndExecuteTransaction({ transaction: args.transaction })
        setIsSuccess(true)
        const digest =
          result.$kind === 'Transaction'
            ? result.Transaction.digest
            : result.FailedTransaction.digest
        return { ...result, digest }
      } catch (error) {
        setIsError(true)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [connection.isConnected, dAppKit],
  )

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  }
}
