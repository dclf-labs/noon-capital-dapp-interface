import { useMemo } from 'react'

import { type Token } from '@/config/token'
import useEvmTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import useStarknetTokenAllowance from '@/hooks/on-chain/starknet/useTokenAllowance'
import { type Address, type EvmAddress, type StarknetAddress } from '@/lib/address'
import {
  type Connection,
  EMPTY_EVM_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
} from '@/lib/connection'

type TokenAllowanceHookResult = {
  data: number
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  refetch?: () => void
}

type TokenAllowanceParams = {
  connection: Connection | undefined
  spender: Address | undefined
  token: Token | undefined
}

const idleAllowance: TokenAllowanceHookResult = {
  data: 0,
  isError: false,
  isLoading: false,
  isFetching: false,
}

/**
 * Family-aware token allowance. Sui is not routed here — use Sui-specific hooks.
 */
const useTokenAllowance = ({
  connection,
  spender,
  token,
}: TokenAllowanceParams): TokenAllowanceHookResult => {
  const evmResult = useEvmTokenAllowance(
    isActiveEvmConnection(connection) ? connection : EMPTY_EVM_CONNECTION,
    spender as EvmAddress | undefined,
    token,
  )

  const starknetResult = useStarknetTokenAllowance(
    isActiveStarknetConnection(connection) ? connection : undefined,
    spender as StarknetAddress | undefined,
    token,
  )

  return useMemo(() => {
    if (!connection) return idleAllowance
    if (connection.chainFamily === 'starknet') return starknetResult
    if (connection.chainFamily === 'sui') return idleAllowance
    return evmResult
  }, [connection, evmResult, starknetResult])
}

export default useTokenAllowance
