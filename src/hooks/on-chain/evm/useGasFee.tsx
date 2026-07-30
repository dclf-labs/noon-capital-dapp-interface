import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { type Config as WagmiConfig, getPublicClient } from '@wagmi/core'
import { type Abi, type ContractFunctionArgs, encodeFunctionData } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import useGasAndEthPrice, {
  DEFAULT_GAS_TRACKER_API_RESPONSE,
} from '@/features/api/hooks/useGasAndEthPrice'
import { type EvmAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { strToBn, toNum } from '@/lib/format'
import {
  evmGetGasFee,
  GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN,
  GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN,
} from '@/lib/gasFee'
import { queryKeys } from '@/lib/query-keys'
import { wagmiConfig } from '@/wallet/evm/config'

interface ContractActionParams {
  connection: EVMConnection
  address?: EvmAddress | undefined
  abi: Abi
  functionName: string
  args?: ContractFunctionArgs<Abi> | undefined
  configActionKey: string
  value?: number | undefined
  configActionKeyMultiplier?: number
}

interface GasFeeResult {
  gasFee: number
  gasUsed: bigint
}

export function useGasFee({
  connection,
  address,
  abi,
  functionName,
  args,
  configActionKey,
  value,
  configActionKeyMultiplier = 1,
}: ContractActionParams) {
  const { data: ethAndGasPrice } = useGasAndEthPrice()
  const isQueryEnabled = useMemo(() => {
    return !!args && !!functionName && !!connection.config?.id && !!address
  }, [connection, address, args, functionName])

  const queryKey = useMemo(() => {
    return queryKeys.gas.fee(
      'evm',
      address,
      functionName,
      args,
      connection.config?.id,
      configActionKey,
      value,
      configActionKeyMultiplier,
    )
  }, [
    address,
    functionName,
    args,
    connection.config?.id,
    configActionKey,
    value,
    configActionKeyMultiplier,
  ])

  const fetcher = async (
    connection: EVMConnection,
    address: EvmAddress | undefined,
    abi: Abi,
    functionName: string,
    args: ContractFunctionArgs<Abi> | undefined,
    configActionKey: string,
    value: number | undefined,
    configActionKeyMultiplier: number,
  ): Promise<GasFeeResult> => {
    if (!connection.config?.id) {
      throw new Error('EVMConnection not found')
    }

    const read = getPublicClient(wagmiConfig as WagmiConfig, {
      chainId: connection.config?.id as ProtocolChainId,
    })
    if (read?.chain?.id !== connection.config?.id) {
      throw new Error('Chains not synced')
    }

    let gasUsed = BigInt(0)
    const configGasLimit =
      BigInt(connection.config?.gasLimits?.[String(configActionKey)] || '0') *
      BigInt(configActionKeyMultiplier || 1)
    const gasPriceInGwei = await read?.getGasPrice()
    const _decimals =
      connection?.config?.defaultGasToken?.decimals || read?.chain?.nativeCurrency?.decimals
    try {
      const data = encodeFunctionData({
        abi,
        functionName,
        args: args || [],
      })

      gasUsed = await read?.estimateGas({
        to: address,
        data: data,
        account: connection.address,
        ...(toNum(value) ? { value: strToBn(value, _decimals) } : {}),
      })

      if (configGasLimit > BigInt(0)) {
        gasUsed = gasUsed > configGasLimit ? gasUsed : configGasLimit
      }
    } catch (err) {
      console.error(`Error estimating gas for ${functionName}:`, err)
      gasUsed = configGasLimit
    } finally {
      gasUsed =
        (gasUsed * GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN) / GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN
    }

    const gasFee = await evmGetGasFee(
      gasUsed,
      gasPriceInGwei,
      ethAndGasPrice || DEFAULT_GAS_TRACKER_API_RESPONSE,
      (connection?.config?.id || 1) as ProtocolChainId,
    ).catch(() => 0)

    return { gasFee, gasUsed }
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: queryKey,
    enabled: isQueryEnabled,
    placeholderData: (prev) => prev,
    queryFn: async () =>
      fetcher(
        connection,
        address,
        abi,
        functionName,
        args,
        configActionKey,
        value,
        configActionKeyMultiplier,
      ),
    refetchInterval: connection.config?.dataRefreshInterval,
  })

  return useMemo(
    () => ({
      data: data?.gasFee || 0,
      gasUsed: data?.gasUsed || BigInt(0),
      isLoading: isLoading,
      isFetching: isFetching,
      isError: isError,
    }),
    [data, isLoading, isError, isFetching],
  )
}

export default useGasFee
