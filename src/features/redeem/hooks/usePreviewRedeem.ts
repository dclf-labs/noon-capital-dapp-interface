import { useMemo } from 'react'

import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { computeRedeemPreviewAmountOut } from '@/features/mint-redeem/preview'
import { useChainQuery } from '@/hooks/query/useChainQuery'
import { isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

/**
 * Preview redeem quote for USN → collateral.
 * `tokenOut` is the collateral identity used for cache keys when collaterals expand.
 */
const usePreviewRedeem = (
  connection: EVMConnection,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
  tokenOutPrice: number | undefined,
) => {
  const hasPrice = toNum(tokenOutPrice) > 0
  const enabled = useMemo(
    () =>
      isAddressValid(tokenOut?.contractAddress) &&
      !!connection.config?.id &&
      (!amountIn || hasPrice),
    [amountIn, connection.config?.id, hasPrice, tokenOut],
  )

  const queryKey = useMemo(
    () =>
      queryKeys.redeem.preview(
        'USN',
        tokenOut?.contractAddress,
        amountIn,
        tokenOutPrice,
        connection.config?.id,
      ),
    [tokenOut?.contractAddress, amountIn, tokenOutPrice, connection.config?.id],
  )

  return useChainQuery({
    queryKey,
    enabled,
    fallback: 0,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async () => {
      if (!connection.config?.id || !tokenOut) throw new Error('Chains not synced')

      const read = getPublicClient(wagmiConfig as Config, {
        chainId: connection.config.id as ProtocolChainId,
      })
      if (read?.chain?.id !== connection.config.id) {
        throw new Error('Chains not synced')
      }

      return computeRedeemPreviewAmountOut(amountIn, tokenOutPrice)
    },
  })
}

export default usePreviewRedeem
