import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import { type Abi } from 'viem'

import type { ProtocolChainId, WithdrawRequest } from '@/config/chain-id'
import type { Token } from '@/config/token'
import WithdrawHandler from '@/lib/abis/evm/withdraw-handler.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useWithdrawRequests = (connection: EVMConnection, token: Token | undefined) => {
  const queryKey = useMemo(
    () =>
      queryKeys.withdraw.requests(
        connection.address,
        token?.contractAddress,
        connection.config?.id,
        connection.config?.stakeWithdrawHandler,
      ),
    [
      connection.address,
      connection.config?.id,
      connection.config?.stakeWithdrawHandler,
      token?.contractAddress,
    ],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      isEVMAddressValid(token?.contractAddress) &&
      isEVMAddressValid(connection.address) &&
      isEVMAddressValid(connection.config?.stakeWithdrawHandler) &&
      !!connection.config?.id,
    [
      connection.isConnected,
      token?.contractAddress,
      connection.address,
      connection.config?.stakeWithdrawHandler,
      connection.config?.id,
    ],
  )

  const fetcher = async (connection: EVMConnection) => {
    if (!connection.config?.id || !connection.address || !token) {
      throw new Error('Connection not found')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const nextRequestIdBn = await read.readContract({
      abi: WithdrawHandler as Abi,
      functionName: 'nextRequestId',
      args: [getAddressOrZeroAddress(connection?.address)],
      address: getAddressOrZeroAddress(connection?.config?.stakeWithdrawHandler),
    })

    const nextRequestId = toNum((nextRequestIdBn || BigInt(0)) as bigint)
    if (nextRequestId <= 0) {
      return []
    }

    const requests = await read?.multicall({
      contracts: Array.from({ length: nextRequestId }, (_, i) => ({
        abi: WithdrawHandler as Abi,
        functionName: 'getWithdrawalRequest',
        args: [getAddressOrZeroAddress(connection?.address), i],
        address: getAddressOrZeroAddress(connection?.config?.stakeWithdrawHandler),
      })),
    })

    return requests
      .map(
        (
          request:
            | { error?: undefined; result: unknown; status: 'success' }
            | { error: Error; result?: undefined; status: 'failure' },
          i,
        ) => {
          const result = request.result as WithdrawRequest
          return {
            amount: toNum(bnToStr((result?.amount || BigInt(0)) as bigint, token.decimals)),
            timestamp: toNum((result?.timestamp || BigInt(0)) as bigint) * 1000,
            status: result?.status,
            requestId: i,
            claimed: result?.claimed,
          }
        },
      )
      .reverse()
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => await fetcher(connection),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    queryKey: queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isEnabled,
  })

  return useMemo(
    () => ({
      isLoading,
      isError: isError,
      data: data || [],
      isFetching: isFetching,
    }),
    [isLoading, isError, data, isFetching],
  )
}

export default useWithdrawRequests
