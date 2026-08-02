import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import { type Abi } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import type { Token } from '@/config/token'
import type { WithdrawRequestView } from '@/features/stake-unstake/withdraw-claim'
import WithdrawHandler from '@/lib/abis/evm/withdraw-handler.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

type OnChainWithdrawRequest = {
  amount: bigint
  timestamp: bigint
  claimed: boolean
}

function mapWithdrawRequest(
  result: OnChainWithdrawRequest,
  requestId: number,
  decimals: number,
): WithdrawRequestView {
  return {
    amount: toNum(bnToStr(result.amount || 0n, decimals)),
    timestamp: toNum(result.timestamp || 0n) * 1000,
    claimed: Boolean(result.claimed),
    requestId,
  }
}

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

  const { isLoading, isError, data, isFetching, refetch } = useQuery({
    queryKey,
    enabled: isEnabled,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async (): Promise<WithdrawRequestView[]> => {
      if (!connection.config?.id || !connection.address || !token) {
        throw new Error('Connection not found')
      }

      const read = getPublicClient(wagmiConfig as Config, {
        chainId: connection.config.id as ProtocolChainId,
      })
      if (read?.chain?.id !== connection.config.id) {
        throw new Error('Chains not synced')
      }

      const nextRequestIdBn = await read.readContract({
        abi: WithdrawHandler as Abi,
        functionName: 'nextRequestId',
        args: [getAddressOrZeroAddress(connection.address)],
        address: getAddressOrZeroAddress(connection.config.stakeWithdrawHandler),
      })

      const nextRequestId = toNum((nextRequestIdBn || 0n) as bigint)
      if (nextRequestId <= 0) {
        return []
      }

      const requests = await read.multicall({
        contracts: Array.from({ length: nextRequestId }, (_, i) => ({
          abi: WithdrawHandler as Abi,
          functionName: 'getWithdrawalRequest',
          args: [getAddressOrZeroAddress(connection.address), i],
          address: getAddressOrZeroAddress(connection.config?.stakeWithdrawHandler),
        })),
      })

      return requests
        .flatMap((request, i) => {
          if (request.status !== 'success' || !request.result) return []
          return [mapWithdrawRequest(request.result as OnChainWithdrawRequest, i, token.decimals)]
        })
        .reverse()
    },
  })

  return useMemo(
    () => ({
      isLoading,
      isError,
      data: data || [],
      isFetching,
      refetch,
    }),
    [isLoading, isError, data, isFetching, refetch],
  )
}

export default useWithdrawRequests
