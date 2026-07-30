import type { ProtocolChainId } from '@/config/chain-id'
import type useGasAndEthPrice from '@/features/api/hooks/useGasAndEthPrice'
import { bnToStr, toBn, toNum, toStr } from '@/lib/format'

export const GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN = BigInt(115)
export const GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN = BigInt(100)

export const GAS_FEE_MULTIPLIER = 1.5

export const evmGetGasFee = async (
  gasUsed: bigint | number | string | undefined,
  gasPriceInGwei: bigint | number | string | undefined,
  ethAndGasPrice: ReturnType<typeof useGasAndEthPrice>['data'],
  chainId: ProtocolChainId,
) => {
  const _gasUsed = toBn(gasUsed)
  const _gasPriceInGwei = toBn(
    gasPriceInGwei || ethAndGasPrice?.[toStr(chainId)]?.gasPrice || ethAndGasPrice?.['1']?.gasPrice,
  )
  const ethPriceInNum = toNum(
    ethAndGasPrice?.[toStr(chainId)]?.price || ethAndGasPrice?.['1']?.price,
  )

  const gasFeeInGwei = _gasUsed * _gasPriceInGwei
  const gasFeeInNum = toNum(bnToStr(gasFeeInGwei, 18)) * GAS_FEE_MULTIPLIER

  return toNum(gasFeeInNum * ethPriceInNum)
}
