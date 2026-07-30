import { useMemo } from 'react'

import { useReadContract } from '@starknet-react/core'
import { type Abi } from 'starknet'

import { type Token } from '@/config/token'
import ABI from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import type { StarknetAddress } from '@/lib/address'
import { isAddressValid } from '@/lib/address'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'
import { bnToStr, toNum } from '@/lib/format'

/**
 * Starknet token balance for a wallet or typed receiver address.
 * Does **not** require `connection.isConnected` — destination reads use read-only sessions.
 */
const useStarknetTokenBalance = (
  connection: EVMConnection | StarknetConnection | undefined,
  token: Token | undefined,
  userAddress: StarknetAddress | undefined,
) => {
  const owner = (connection?.address || userAddress) as StarknetAddress | undefined
  const enabled =
    isAddressValid(owner) && isAddressValid(token?.contractAddress as string | undefined)

  const { data, isLoading, isError, isFetching } = useReadContract({
    watch: true,
    functionName: 'balance_of',
    address: token?.contractAddress as StarknetAddress,
    args: [owner as StarknetAddress],
    enabled,
    abi: ABI as Abi,
  })

  return useMemo(
    () => ({
      data: enabled ? toNum(bnToStr(data, token?.decimals)) || 0 : 0,
      isLoading: enabled ? isLoading : false,
      isError,
      isFetching: enabled ? isFetching : false,
    }),
    [data, enabled, isError, isFetching, isLoading, token?.decimals],
  )
}

export default useStarknetTokenBalance
