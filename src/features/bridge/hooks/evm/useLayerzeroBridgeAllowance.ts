import { useMemo } from 'react'

import { maxUint256 } from 'viem'

import { type Token } from '@/config/token'
import useTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'

const useLayerzeroBridgeAllowance = (connection: EVMConnection, token: Token | undefined) => {
  const isAllowanceNotNeeded = useMemo(() => {
    return (
      !connection.config?.layerzeroOftHelper &&
      token?.contractAddress &&
      token?.layerzeroOftAddress?.toLowerCase() === token?.contractAddress?.toLowerCase()
    )
  }, [connection.config?.layerzeroOftHelper, token?.contractAddress, token?.layerzeroOftAddress])

  const allowance = useTokenAllowance(
    connection,
    getAddressOrZeroAddress(connection.config?.layerzeroOftHelper || token?.layerzeroOftAddress),
    token,
  )

  if (isAllowanceNotNeeded) {
    return {
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: () => Promise.resolve(),
      data: toNum(bnToStr(maxUint256, token?.decimals)),
    }
  }

  return allowance
}

export default useLayerzeroBridgeAllowance
