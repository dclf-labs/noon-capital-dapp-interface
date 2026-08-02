import { type Token } from '@/config/token'
import useEvmTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import useStarknetTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'
import useSuiTokenBalance from '@/hooks/on-chain/sui/useTokenBalance'
import { IDLE_TOKEN_QUERY, type TokenQueryResult } from '@/hooks/on-chain/types'
import useChainFamily from '@/hooks/on-chain/useChainFamily'
import {
  type Connection,
  EMPTY_EVM_CONNECTION,
  EMPTY_SUI_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
  isActiveSuiConnection,
} from '@/lib/connection'

/**
 * Family-aware connected-wallet token balance.
 */
const useTokenBalance = (
  connection: Connection | undefined,
  token: Token | undefined,
): TokenQueryResult => {
  const evm = useEvmTokenBalance(
    isActiveEvmConnection(connection) ? connection : EMPTY_EVM_CONNECTION,
    token,
  )
  const starknet = useStarknetTokenBalance(
    isActiveStarknetConnection(connection) ? connection : undefined,
    token,
  )
  const sui = useSuiTokenBalance(
    isActiveSuiConnection(connection) ? connection : EMPTY_SUI_CONNECTION,
    token,
  )

  return useChainFamily({
    connection,
    evm,
    starknet,
    sui,
    fallback: IDLE_TOKEN_QUERY,
  })
}

export default useTokenBalance
