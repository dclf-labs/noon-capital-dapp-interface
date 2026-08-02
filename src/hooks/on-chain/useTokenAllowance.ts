import { type Token } from '@/config/token'
import useEvmTokenAllowance from '@/hooks/on-chain/evm/useTokenAllowance'
import useStarknetTokenAllowance from '@/hooks/on-chain/starknet/useTokenAllowance'
import { IDLE_TOKEN_QUERY, type TokenQueryResult } from '@/hooks/on-chain/types'
import useChainFamily from '@/hooks/on-chain/useChainFamily'
import { type Address, type EvmAddress, type StarknetAddress } from '@/lib/address'
import {
  type Connection,
  EMPTY_EVM_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
} from '@/lib/connection'

type TokenAllowanceParams = {
  connection: Connection | undefined
  spender: Address | undefined
  token: Token | undefined
}

/**
 * Family-aware token allowance. Sui coin objects do not use ERC-20 allowances.
 */
const useTokenAllowance = ({
  connection,
  spender,
  token,
}: TokenAllowanceParams): TokenQueryResult => {
  const evm = useEvmTokenAllowance(
    isActiveEvmConnection(connection) ? connection : EMPTY_EVM_CONNECTION,
    spender as EvmAddress | undefined,
    token,
  )
  const starknet = useStarknetTokenAllowance(
    isActiveStarknetConnection(connection) ? connection : undefined,
    spender as StarknetAddress | undefined,
    token,
  )

  return useChainFamily({
    connection,
    evm,
    starknet,
    fallback: IDLE_TOKEN_QUERY,
  })
}

export default useTokenAllowance
