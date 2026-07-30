import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import type useTokenPrice from '@/features/api/hooks/useTokenPrice'
import LagoonVaultAbi from '@/lib/abis/evm/lagoon-vault.json'
import { type Address, getAddressOrZeroAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, down, strToBn, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const useVaultShareToAsset = (
  connection: EVMConnection,
  vault: Address | undefined,
  shareToken: Token | undefined,
  assetToken: Token | undefined,
  share: number | string,
  assetPrice: ReturnType<typeof useTokenPrice> | undefined,
) => {
  const queryKey = useMemo(
    () =>
      queryKeys.vault.shareToAsset(
        vault,
        shareToken?.contractAddress,
        assetToken?.contractAddress,
        connection.address,
        connection.config?.id,
        share,
      ),
    [
      vault,
      shareToken?.contractAddress,
      assetToken?.contractAddress,
      connection.address,
      share,
      connection.config?.id,
    ],
  )

  const isEnabled = useMemo(
    () =>
      connection.isConnected &&
      isAddressValid(vault) &&
      isAddressValid(shareToken?.contractAddress) &&
      isAddressValid(assetToken?.contractAddress) &&
      isAddressValid(connection.address) &&
      !!toNum(share) &&
      !!connection.config?.id,
    [
      connection.isConnected,
      connection.address,
      connection.config?.id,
      vault,
      shareToken?.contractAddress,
      assetToken?.contractAddress,
      share,
    ],
  )

  const fetcher = async (
    connection: EVMConnection,
    vault: Address | undefined,
    shareToken: Token | undefined,
    assetToken: Token | undefined,
    share: number | string,
    assetPrice: ReturnType<typeof useTokenPrice> | undefined,
  ) => {
    if (!connection.config?.id || !connection.address || !vault || !shareToken || !assetToken) {
      throw new Error('EVMConnection not found or invalid parameters')
    }

    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    const assets = await read
      .readContract({
        abi: LagoonVaultAbi,
        functionName: 'convertToAssets',
        args: [strToBn(share, shareToken?.decimals)],
        address: getAddressOrZeroAddress(vault),
      })
      .then((assets) => {
        return assets as bigint
      })

    const assetsInNum = down(bnToStr(assets, assetToken?.decimals), 4)
    return {
      value: assetsInNum,
      usdValue: assetsInNum ? assetsInNum * (assetPrice?.data || 0) : 0,
    }
  }

  const { isLoading, isError, data, isFetching } = useQuery({
    queryFn: async () =>
      await fetcher(connection, vault, shareToken, assetToken, share, assetPrice),
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
      data: data || { value: 0, usdValue: 0 },
      isFetching: isFetching,
    }),
    [isLoading, isError, data, isFetching],
  )
}

export default useVaultShareToAsset
