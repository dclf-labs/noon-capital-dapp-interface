import { useMemo } from 'react'

import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { useChainQuery } from '@/hooks/query/useChainQuery'
import StakingVault from '@/lib/abis/evm/staking-vault.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, strToBn, toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const usePreviewUnstake = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
) => {
  const enabled = useMemo(
    () => isEVMAddressValid(tokenIn?.contractAddress) && !!connection.config?.id,
    [connection.config?.id, tokenIn],
  )

  const queryKey = useMemo(
    () =>
      queryKeys.unstake.preview(
        tokenIn?.contractAddress,
        tokenOut?.contractAddress,
        amountIn,
        connection.config?.id,
      ),
    [tokenIn?.contractAddress, tokenOut?.contractAddress, amountIn, connection.config?.id],
  )

  return useChainQuery({
    queryKey,
    enabled,
    fallback: 0,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async () => {
      if (!amountIn) return 0
      if (!connection.config?.id || !tokenIn || !tokenOut) {
        throw new Error('Chains not synced')
      }

      const read = getPublicClient(wagmiConfig as Config, {
        chainId: connection.config.id as ProtocolChainId,
      })
      if (read?.chain?.id !== connection.config.id) {
        throw new Error('Chains not synced')
      }

      const amountOut = (await read.readContract({
        abi: StakingVault,
        args: [strToBn(amountIn, tokenIn.decimals)],
        functionName: 'previewRedeem',
        address: getAddressOrZeroAddress(connection.config.stakingVault),
      })) as bigint

      return toNum(bnToStr(amountOut, tokenOut.decimals))
    },
  })
}

export default usePreviewUnstake
