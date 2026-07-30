import { useMemo } from 'react'

import type { Call } from 'starknet'
import { type Abi, type ContractFunctionArgs } from 'viem'

import useEvmGasFee from '@/hooks/on-chain/evm/useGasFee'
import useStarknetGasFee from '@/hooks/on-chain/starknet/useGasFee'
import { type EvmAddress, type StarknetAddress } from '@/lib/address'
import {
  type Connection,
  EMPTY_EVM_CONNECTION,
  EMPTY_STARKNET_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
} from '@/lib/connection'

type GasFeeHookResult = {
  data: number
  gasUsed: bigint | number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
}

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

const idleGasFee: GasFeeHookResult = {
  data: 0,
  gasUsed: 0n,
  isLoading: false,
  isFetching: false,
  isError: false,
}

const useGasFee = (params: GasFeeParams): GasFeeHookResult => {
  const evmConnection = isActiveEvmConnection(params.connection)
    ? params.connection
    : EMPTY_EVM_CONNECTION
  const starknetConnection = isActiveStarknetConnection(params.connection)
    ? params.connection
    : EMPTY_STARKNET_CONNECTION
  const isStarknet = isActiveStarknetConnection(params.connection)
  const isEvm = isActiveEvmConnection(params.connection)

  const evmResult = useEvmGasFee({
    connection: evmConnection,
    address: isEvm ? (params as EvmGasFeeParams).address : undefined,
    abi: isEvm ? (params as EvmGasFeeParams).abi : ([] as unknown as Abi),
    functionName: isEvm ? (params as EvmGasFeeParams).functionName : '',
    args: isEvm ? (params as EvmGasFeeParams).args : undefined,
    configActionKey: isEvm ? (params as EvmGasFeeParams).configActionKey : '',
    value: isEvm ? (params as EvmGasFeeParams).value : undefined,
    configActionKeyMultiplier: isEvm
      ? (params as EvmGasFeeParams).configActionKeyMultiplier
      : undefined,
  })

  const starknetResult = useStarknetGasFee({
    connection: starknetConnection,
    address: isStarknet ? (params as StarknetGasFeeParams).address : undefined,
    functionName: isStarknet ? (params as StarknetGasFeeParams).functionName : '',
    calls: isStarknet ? (params as StarknetGasFeeParams).calls : [],
    configActionKey: isStarknet ? (params as StarknetGasFeeParams).configActionKey : '',
  })

  return useMemo(() => {
    if (!params?.connection) return idleGasFee
    if (isStarknet) return starknetResult
    return evmResult
  }, [params?.connection, evmResult, isStarknet, starknetResult])
}

export default useGasFee
