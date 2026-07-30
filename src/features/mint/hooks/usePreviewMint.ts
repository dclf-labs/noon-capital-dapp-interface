import { useMemo } from 'react'

import { type Config, getPublicClient } from '@wagmi/core'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { useChainQuery } from '@/hooks/query/useChainQuery'
import { isEVMAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

const usePreviewMint = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  amountIn: number | undefined,
  tokenPrice: number | undefined,
) => {
  const enabled = useMemo(
    () => isEVMAddressValid(tokenIn?.contractAddress) && !!connection.config?.id,
    [connection.config?.id, tokenIn],
  )

  const queryKey = useMemo(
    () =>
      queryKeys.mint.preview(
        tokenIn?.contractAddress,
        'USN',
        amountIn,
        tokenPrice,
        connection.config?.id,
      ),
    [tokenIn?.contractAddress, amountIn, tokenPrice, connection.config?.id],
  )

  return useChainQuery({
    queryKey,
    enabled,
    fallback: 0,
    refetchInterval: connection.config?.dataRefreshInterval,
    queryFn: async () => {
      if (!amountIn) return 0
      if (!connection.config?.id || !tokenIn) throw new Error('Chains not synced')

      const read = getPublicClient(wagmiConfig as Config, {
        chainId: connection.config.id as ProtocolChainId,
      })
      if (read?.chain?.id !== connection.config.id) {
        throw new Error('Chains not synced')
      }

      return toNum(toNum(tokenPrice) * toNum(amountIn))
    },
  })
}

export default usePreviewMint
