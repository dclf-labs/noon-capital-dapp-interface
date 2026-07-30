import { useMemo } from 'react'

import { useEstimateFees } from '@starknet-react/core'
import type { Call } from 'starknet'

import useGasAndEthPrice from '@/features/api/hooks/useGasAndEthPrice'
import type { StarknetAddress } from '@/lib/address'
import type { StarknetConnection } from '@/lib/connection'
import { bnToStr, toNum, toStr } from '@/lib/format'
import { GAS_FEE_MULTIPLIER } from '@/lib/gasFee'

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
  const { data: ethAndGasPrice } = useGasAndEthPrice()

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
    const baseFeeInNative =
      toNum(bnToStr(fee?.overall_fee, connection?.config?.defaultGasToken?.decimals)) ||
      toNum(
        bnToStr(
          connection?.config?.gasLimits?.[toStr(configActionKey)],
          connection?.config?.defaultGasToken?.decimals,
        ),
      ) ||
      0

    const gasFeeInNative = baseFeeInNative * GAS_FEE_MULTIPLIER

    return {
      isLoading,
      isError,
      isFetching,
      gasUsed: gasFeeInNative,
      data:
        gasFeeInNative * toNum(ethAndGasPrice?.['starknet']?.price || ethAndGasPrice?.['1']?.price),
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
  ])
}

export default useGasFee
