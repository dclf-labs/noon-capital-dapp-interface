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
  evmGetGasFeeNative,
  GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN,
  GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN,
  resolveNativeGasUsdPrice,
  toGasFeeUsd,
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

interface GasFeeNativeResult {
  gasFeeNative: number
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
  const { data: ethAndGasPrice, isLoading: isPriceLoading } = useGasAndEthPrice()
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
    priceMap: typeof ethAndGasPrice,
  ): Promise<GasFeeNativeResult> => {
    if (!connection.config?.id) {
      throw new Error('EVMConnection not found')
    }

    const chainId = connection.config.id as ProtocolChainId
    const configGasLimit =
      BigInt(connection.config?.gasLimits?.[String(configActionKey)] || '0') *
      BigInt(configActionKeyMultiplier || 1)

    const read = getPublicClient(wagmiConfig as WagmiConfig, { chainId })
    const clientReady = !!read && read.chain?.id === chainId

    let gasPriceWei: bigint | undefined
    let gasUsed: bigint

    if (clientReady) {
      try {
        gasPriceWei = await read.getGasPrice()
      } catch (err) {
        console.error(`Error fetching gas price for ${functionName}:`, err)
      }

      try {
        const data = encodeFunctionData({
          abi,
          functionName,
          args: args || [],
        })
        const _decimals =
          connection?.config?.defaultGasToken?.decimals || read.chain?.nativeCurrency?.decimals

        const estimated = await read.estimateGas({
          to: address,
          data: data,
          account: connection.address,
          ...(toNum(value) ? { value: strToBn(value, _decimals) } : {}),
        })

        gasUsed =
          configGasLimit > BigInt(0) && configGasLimit > estimated ? configGasLimit : estimated
      } catch (err) {
        console.error(`Error estimating gas for ${functionName}:`, err)
        gasUsed = configGasLimit
      }
    } else {
      // Public client unavailable / wrong chain — still price from config gas limit + API gas.
      gasUsed = configGasLimit
    }

    gasUsed =
      (gasUsed * GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN) / GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN

    const gasFeeNative = evmGetGasFeeNative(
      gasUsed,
      gasPriceWei,
      priceMap || DEFAULT_GAS_TRACKER_API_RESPONSE,
      chainId,
    )

    return { gasFeeNative, gasUsed }
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
        ethAndGasPrice || DEFAULT_GAS_TRACKER_API_RESPONSE,
      ),
    refetchInterval: connection.config?.dataRefreshInterval,
  })

  return useMemo(() => {
    const native = data?.gasFeeNative || 0
    const chainId = (connection.config?.id || 1) as ProtocolChainId
    const paysGasInEth =
      (connection.config?.defaultGasToken?.symbol || 'ETH').toUpperCase() === 'ETH'
    const usdPrice = resolveNativeGasUsdPrice(
      ethAndGasPrice || DEFAULT_GAS_TRACKER_API_RESPONSE,
      chainId,
      { allowMainnetEthFallback: paysGasInEth },
    )
    const usd = toGasFeeUsd(native, usdPrice)
    const isReady = native > 0 && usdPrice > 0

    return {
      /** USD notional — recomputed when native gas-token USD price updates. */
      data: usd,
      native,
      gasUsed: data?.gasUsed || BigInt(0),
      /** True once we have a positive native estimate and a usable USD price. */
      isReady,
      isLoading: isLoading || (isPriceLoading && !isReady),
      isFetching: isFetching || isPriceLoading,
      isError: isError,
    }
  }, [
    connection.config?.defaultGasToken?.symbol,
    connection.config?.id,
    data,
    ethAndGasPrice,
    isError,
    isFetching,
    isLoading,
    isPriceLoading,
  ])
}

export default useGasFee
