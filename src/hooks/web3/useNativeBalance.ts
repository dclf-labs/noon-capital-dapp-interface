import { formatUnits } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import { isSupportedChainId, type SupportedChainId } from '@/lib/web3/config'

interface UseNativeBalanceOptions {
  chainId?: SupportedChainId
  enabled?: boolean
}

export function useNativeBalance(options: UseNativeBalanceOptions = {}) {
  const { address, chainId: connectedChainId } = useAccount()

  const chainId =
    options.chainId ??
    (connectedChainId != null && isSupportedChainId(connectedChainId)
      ? connectedChainId
      : undefined)

  const query = useBalance({
    address,
    chainId,
    query: {
      enabled: Boolean(address) && chainId != null && (options.enabled ?? true),
    },
  })

  const formatted =
    query.data != null ? formatUnits(query.data.value, query.data.decimals) : undefined

  return {
    ...query,
    formatted,
    symbol: query.data?.symbol,
  }
}
