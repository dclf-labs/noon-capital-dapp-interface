import type { Call } from 'starknet'
import { type Abi, type ContractFunctionArgs } from 'viem'

import useEvmGasFee from '@/hooks/on-chain/evm/useGasFee'
import useStarknetGasFee from '@/hooks/on-chain/starknet/useGasFee'
import { type GasFeeQueryResult, IDLE_GAS_FEE_QUERY } from '@/hooks/on-chain/types'
import useChainFamily from '@/hooks/on-chain/useChainFamily'
import { type EvmAddress, type StarknetAddress } from '@/lib/address'
import {
  type Connection,
  EMPTY_EVM_CONNECTION,
  EMPTY_STARKNET_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
} from '@/lib/connection'

type EvmGasFeeParams = {
  connection: Connection & { chainFamily: 'evm' }
  address?: EvmAddress
  abi: Abi
  functionName: string
  args?: ContractFunctionArgs<Abi>
  configActionKey: string
  value?: number
  configActionKeyMultiplier?: number
}

type StarknetGasFeeParams = {
  connection: Connection & { chainFamily: 'starknet' }
  address: StarknetAddress | undefined
  functionName: string
  calls?: Call[]
  configActionKey: string
}

type GasFeeParams = EvmGasFeeParams | StarknetGasFeeParams

const useGasFee = (params: GasFeeParams): GasFeeQueryResult => {
  const isEvm = isActiveEvmConnection(params.connection)
  const isStarknet = isActiveStarknetConnection(params.connection)
  const evmParams = params as EvmGasFeeParams
  const starknetParams = params as StarknetGasFeeParams

  const evm = useEvmGasFee({
    // Ternary keeps a union unless narrowed; stubs are family-specific.
    connection: (isEvm ? params.connection : EMPTY_EVM_CONNECTION) as typeof EMPTY_EVM_CONNECTION,
    address: isEvm ? evmParams.address : undefined,
    abi: isEvm ? evmParams.abi : ([] as unknown as Abi),
    functionName: isEvm ? evmParams.functionName : '',
    args: isEvm ? evmParams.args : undefined,
    configActionKey: isEvm ? evmParams.configActionKey : '',
    value: isEvm ? evmParams.value : undefined,
    configActionKeyMultiplier: isEvm ? evmParams.configActionKeyMultiplier : undefined,
  })

  const starknet = useStarknetGasFee({
    connection: (isStarknet
      ? params.connection
      : EMPTY_STARKNET_CONNECTION) as typeof EMPTY_STARKNET_CONNECTION,
    address: isStarknet ? starknetParams.address : undefined,
    functionName: isStarknet ? starknetParams.functionName : '',
    calls: isStarknet ? starknetParams.calls : [],
    configActionKey: isStarknet ? starknetParams.configActionKey : '',
  })

  return useChainFamily({
    connection: params.connection,
    evm,
    starknet,
    fallback: IDLE_GAS_FEE_QUERY,
  })
}

export default useGasFee
