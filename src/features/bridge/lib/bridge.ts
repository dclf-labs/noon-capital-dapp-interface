import { Options } from '@layerzerolabs/lz-v2-utilities'

import type { ChainId } from '@/config/chain-id'
import {
  EXECUTOR_LZ_RECEIVE_OPTION_GAS_LIMIT,
  EXECUTOR_LZ_RECEIVE_OPTION_MAX_GAS,
  EXECUTOR_LZ_RECEIVE_OPTION_MAX_GAS_SUI,
  SUI_BRIDGE_DESTINATION,
} from '@/constants/common'
import { toBn } from '@/lib/format'

/** LayerZero executor options hex for `lzReceive` gas. */
export const getBridgeOptions = (
  executorLzReceiveOptionMaxGas?: number,
  executorLzReceiveOptionGasLimit?: number,
) =>
  Options.newOptions()
    .addExecutorLzReceiveOption(
      toBn(executorLzReceiveOptionMaxGas || EXECUTOR_LZ_RECEIVE_OPTION_MAX_GAS),
      toBn(executorLzReceiveOptionGasLimit || EXECUTOR_LZ_RECEIVE_OPTION_GAS_LIMIT),
    )
    .toHex()

/** Sui destinations need a higher max-gas option than EVM/Starknet. */
export const getBridgeOptionsForDestination = (destinationChainId: ChainId | undefined) => {
  const isSuiDestination = Number(destinationChainId) === Number(SUI_BRIDGE_DESTINATION.id)
  return getBridgeOptions(isSuiDestination ? EXECUTOR_LZ_RECEIVE_OPTION_MAX_GAS_SUI : undefined)
}
