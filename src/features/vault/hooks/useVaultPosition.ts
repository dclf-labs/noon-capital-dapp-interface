import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import LagoonVaultAbi from '@/lib/abis/evm/lagoon-vault.json'
import { type Address, getAddressOrZeroAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, down } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useVaultPosition = (
  connection: EVMConnection,
  vault: Address | undefined,
  shareToken: Token | undefined,
) => {
  const queryKey = useMemo(
    () =>
      queryKeys.vault.position(
        vault,
        shareToken?.contractAddress,
        connection.address,
        connection.config?.id,
      ),
    [vault, shareToken?.contractAddress, connection.address, connection.config?.id],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      isAddressValid(vault) &&
      isAddressValid(shareToken?.contractAddress) &&
      isAddressValid(connection.address) &&
      !!connection.config?.id,
    [
      connection.isConnected,
      connection.address,
      connection.config?.id,
      vault,
      shareToken?.contractAddress,
    ],
  )

  const fetcher = async (
    connection: EVMConnection,
    vault: Address | undefined,
    shareToken: Token | undefined,
  ) => {
    if (!connection.config?.id || !connection.address || !vault || !shareToken) {
      throw new Error('EVMConnection not found or invalid parameters')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const balance = await read
      .readContract({
        abi: LagoonVaultAbi,
        functionName: 'balanceOf',
        args: [getAddressOrZeroAddress(connection.address)],
        address: getAddressOrZeroAddress(vault),
      })
      .then((assets) => {
        return assets as bigint
      })

    const claimableBalance = await read
      .readContract({
        abi: LagoonVaultAbi,
        functionName: 'maxMint',
        args: [getAddressOrZeroAddress(connection.address)],
        address: getAddressOrZeroAddress(vault),
      })
      .then((assets) => {
        return assets as bigint
      })

    const pendingRedeemRequest = await read
      .readContract({
        abi: LagoonVaultAbi,
        functionName: 'pendingRedeemRequest',
        args: [0, getAddressOrZeroAddress(connection.address)],
        address: getAddressOrZeroAddress(vault),
      })
      .then((assets) => {
        return assets as bigint
      })

    const finalBalance = balance + claimableBalance + pendingRedeemRequest
    return down(bnToStr(finalBalance, shareToken?.decimals), 4)
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () => await fetcher(connection, vault, shareToken),
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
      isLoading,
      isError: isError,
      data: data || 0,
      isFetching: isFetching,
    }),
    [isLoading, isError, data, isFetching],
  )
}

export default useVaultPosition
