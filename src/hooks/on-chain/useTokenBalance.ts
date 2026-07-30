import { useMemo } from 'react'

import { type Token } from '@/config/token'
import useEvmTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import useStarknetTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'
import {
  type Connection,
  EMPTY_EVM_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
} from '@/lib/connection'

type TokenBalanceHookResult = {
  data: number
  isLoading: boolean
  isError: boolean
  isFetching: boolean
}

const idleBalance: TokenBalanceHookResult = {
  data: 0,
  isLoading: false,
  isError: false,
  isFetching: false,
}

/**
 * Family-aware token balance. Sui is not routed here — use Sui-specific balance hooks.
 */
const useTokenBalance = (
  connection: Connection | undefined,
  token: Token | undefined,
): TokenBalanceHookResult => {
  const evmResult = useEvmTokenBalance(
    isActiveEvmConnection(connection) ? connection : EMPTY_EVM_CONNECTION,
    token,
  )

  const starknetResult = useStarknetTokenBalance(
    isActiveStarknetConnection(connection) ? connection : undefined,
    token,
  )

  return useMemo(() => {
    if (!connection) return idleBalance
    if (connection.chainFamily === 'starknet') return starknetResult
    if (connection.chainFamily === 'sui') return idleBalance
    return evmResult
  }, [connection, evmResult, starknetResult])
}

export default useTokenBalance
