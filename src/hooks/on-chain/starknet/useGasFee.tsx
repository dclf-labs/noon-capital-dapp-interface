import { useMemo } from 'react'

import { useEstimateFees } from '@starknet-react/core'
import type { Call } from 'starknet'

import useGasAndEthPrice, {
  DEFAULT_GAS_TRACKER_API_RESPONSE,
} from '@/features/api/hooks/useGasAndEthPrice'
import type { StarknetAddress } from '@/lib/address'
import type { StarknetConnection } from '@/lib/connection'
import { bnToStr, toNum, toStr } from '@/lib/format'
import { GAS_FEE_MULTIPLIER, resolveNativeGasUsdPrice, toGasFeeUsd } from '@/lib/gasFee'

interface ContractActionParams {
  connection: StarknetConnection
  address: StarknetAddress | undefined
  functionName: string
  calls?: Call[]
  configActionKey: string
}

export function useGasFee({
  connection,
  address,
  functionName,
  calls,
  configActionKey,
}: ContractActionParams) {
  const { data: ethAndGasPrice, isLoading: isPriceLoading } = useGasAndEthPrice()

  const {
    data: fee,
    isLoading,
    isError,
    isFetching,
  } = useEstimateFees({
    watch: true,
    calls: calls || [],
    enabled: !!address && !!functionName && !!connection.config?.id,
  })

  return useMemo(() => {
    const decimals = connection?.config?.defaultGasToken?.decimals
    const baseFeeInNative =
      toNum(bnToStr(fee?.overall_fee, decimals)) ||
      toNum(bnToStr(connection?.config?.gasLimits?.[toStr(configActionKey)], decimals)) ||
      0

    const native = baseFeeInNative * GAS_FEE_MULTIPLIER
    // Starknet pays gas in STRK — never fall back to mainnet ETH USD.
    const usdPrice = resolveNativeGasUsdPrice(
      ethAndGasPrice || DEFAULT_GAS_TRACKER_API_RESPONSE,
      'starknet',
      { allowMainnetEthFallback: false },
    )
    const usd = toGasFeeUsd(native, usdPrice)
    const isReady = native > 0 && usdPrice > 0

    return {
      isLoading: isLoading || (isPriceLoading && !isReady),
      isError,
      isFetching: isFetching || isPriceLoading,
      /** Legacy field: Starknet submit path historically stored native fee here. */
      gasUsed: native,
      native,
      data: usd,
      isReady,
    }
  }, [
    fee?.overall_fee,
    connection?.config?.defaultGasToken?.decimals,
    isLoading,
    configActionKey,
    connection?.config?.gasLimits,
    isError,
    isFetching,
    ethAndGasPrice,
    isPriceLoading,
  ])
}

export default useGasFee
