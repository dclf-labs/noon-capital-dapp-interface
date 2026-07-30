import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import WithdrawHandler from '@/lib/abis/evm/withdraw-handler.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useWithdrawPeriod = (connection: EVMConnection) => {
  const queryKey = useMemo(
    () => queryKeys.withdraw.period(connection.config?.id, connection.config?.stakeWithdrawHandler),
    [connection.config?.id, connection.config?.stakeWithdrawHandler],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      isEVMAddressValid(connection.address) &&
      isEVMAddressValid(connection.config?.stakeWithdrawHandler) &&
      !!connection.config?.id,
    [
      connection.isConnected,
      connection.address,
      connection.config?.stakeWithdrawHandler,
      connection.config?.id,
    ],
  )

  const fetcher = async (connection: EVMConnection) => {
    if (!connection.config?.id || !connection.address) {
      throw new Error('Connection not found')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const period = await read.readContract({
      abi: WithdrawHandler,
      functionName: 'withdrawPeriod',
      address: getAddressOrZeroAddress(connection?.config?.stakeWithdrawHandler),
    })

    return toNum((period || BigInt(0)) as bigint) * 1000
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
      data: data || 0,
      isFetching: isFetching,
    }),
    [isLoading, isError, data, isFetching],
  )
}

export default useWithdrawPeriod
