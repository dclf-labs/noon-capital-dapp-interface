import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config as WagmiConfig, getPublicClient } from '@wagmi/core'
import { erc20Abi, maxUint256 } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type EvmAddress, getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useTokenAllowance = (
  connection: EVMConnection,
  spender: EvmAddress | undefined,
  token: Token | undefined,
) => {
  const queryKey = useMemo(
    () =>
      queryKeys.token.allowance(
        'evm',
        token?.contractAddress,
        spender,
        connection.address,
        connection.config?.id,
        token?.isNative,
        token?.isWrapped,
      ),
    [
      token?.contractAddress,
      spender,
      connection.address,
      connection.config?.id,
      token?.isNative,
      token?.isWrapped,
    ],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      isEVMAddressValid(token?.contractAddress) &&
      isEVMAddressValid(connection.address) &&
      isEVMAddressValid(spender) &&
      !!connection.config?.id &&
      !connection.unsupported,
    [
      connection.isConnected,
      connection.unsupported,
      token?.contractAddress,
      spender,
      connection.address,
      connection.config?.id,
    ],
  )

  const fetcher = async (
    connection: EVMConnection,
    owner: EvmAddress | undefined,
    spender: EvmAddress | undefined,
    token: Token | undefined,
  ) => {
    if (!connection.config?.id || !owner || !spender || !token) {
      throw new Error('EVMConnection not found or invalid parameters')
    }

    const read = getPublicClient(wagmiConfig as WagmiConfig, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    if (token?.isNative) {
      return toNum(bnToStr(maxUint256, token?.decimals))
    }

    const allowance = await read.readContract({
      abi: erc20Abi,
      functionName: 'allowance',
      args: [getAddressOrZeroAddress(owner), getAddressOrZeroAddress(spender)],
      address: getAddressOrZeroAddress(token?.contractAddress),
    })

    return toNum(bnToStr(allowance, token?.decimals))
  }

  const {
    isLoading,
    isError,
    data,
    isFetching,
    refetch: refetchAllowance,
  } = useQuery({
    queryFn: async () => await fetcher(connection, connection.address, spender, token),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    queryKey: queryKey,
    refetchInterval: connection.config?.dataRefreshInterval,
    enabled: isEnabled,
  })

  return useMemo(
    () => ({
      isLoading: isEnabled ? isLoading : false,
      isError: isError,
      refetch: refetchAllowance,
      data: isEnabled ? data || 0 : 0,
      isFetching: isEnabled ? isFetching : false,
    }),
    [isLoading, isError, refetchAllowance, data, isFetching, isEnabled],
  )
}

export default useTokenAllowance
