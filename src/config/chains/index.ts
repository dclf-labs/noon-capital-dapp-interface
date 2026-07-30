import type { ProtocolChainId } from '@/config/chain-id'
import { config as base } from '@/config/chains/base'
import { config as berachain } from '@/config/chains/berachain'
import { config as citrea } from '@/config/chains/citrea'
import { config as ethereum } from '@/config/chains/ethereum'
import { config as hyperevm } from '@/config/chains/hyperevm'
import { config as monad } from '@/config/chains/monad'
import { config as sophon } from '@/config/chains/sophon'
import { config as starknet } from '@/config/chains/starknet'
import { config as sui } from '@/config/chains/sui'
import { config as tac } from '@/config/chains/tac'
import { config as zksync } from '@/config/chains/zksync'
import type { ProtocolChainConfig } from '@/config/types'

export { config as baseConfig } from '@/config/chains/base'
export { config as berachainConfig } from '@/config/chains/berachain'
export { config as citreaConfig } from '@/config/chains/citrea'
export { config as ethereumConfig } from '@/config/chains/ethereum'
export { config as hyperevmConfig } from '@/config/chains/hyperevm'
export { config as monadConfig } from '@/config/chains/monad'
export { config as sophonConfig } from '@/config/chains/sophon'
export { config as starknetConfig } from '@/config/chains/starknet'
export { SUI_SUSN_COIN_TYPE, config as suiConfig } from '@/config/chains/sui'
export { config as tacConfig } from '@/config/chains/tac'
export { config as zksyncConfig } from '@/config/chains/zksync'

type ConfigMap = Partial<Record<ProtocolChainId, ProtocolChainConfig>>

/** All known protocol deployments (including inactive / preview chains). */
export const protocolConfigs: ConfigMap = {
  [ethereum.id]: ethereum,
  [sophon.id]: sophon,
  [zksync.id]: zksync,
  [tac.id]: tac,
  [monad.id]: monad,
  [starknet.id]: starknet,
  [sui.id]: sui,
  [hyperevm.id]: hyperevm,
  [citrea.id]: citrea,
  [base.id]: base,
  [berachain.id]: berachain,
}

/**
 * Chains currently offered in the product UI / wallet network list.
 * Monad is defined in `protocolConfigs` but not active yet.
 */
export const activeProtocolConfigs: ConfigMap = {
  [ethereum.id]: ethereum,
  [sophon.id]: sophon,
  [zksync.id]: zksync,
  [tac.id]: tac,
  [starknet.id]: starknet,
  [sui.id]: sui,
  [hyperevm.id]: hyperevm,
  [base.id]: base,
  [citrea.id]: citrea,
  [berachain.id]: berachain,
}

export const evmProtocolConfigs: ConfigMap = {
  [ethereum.id]: ethereum,
  [sophon.id]: sophon,
  [zksync.id]: zksync,
  [tac.id]: tac,
  [monad.id]: monad,
  [hyperevm.id]: hyperevm,
  [citrea.id]: citrea,
  [base.id]: base,
  [berachain.id]: berachain,
}

export const activeEvmProtocolConfigs: ConfigMap = {
  [ethereum.id]: ethereum,
  [sophon.id]: sophon,
  [zksync.id]: zksync,
  [tac.id]: tac,
  [hyperevm.id]: hyperevm,
  [base.id]: base,
  [citrea.id]: citrea,
  [berachain.id]: berachain,
}

export const starknetProtocolConfigs: ConfigMap = {
  [starknet.id]: starknet,
}

export const suiProtocolConfigs: ConfigMap = {
  [sui.id]: sui,
}

export function getProtocolConfig(chainId: ProtocolChainId): ProtocolChainConfig | undefined {
  return protocolConfigs[chainId]
}

export function getActiveProtocolConfig(chainId: ProtocolChainId): ProtocolChainConfig | undefined {
  return activeProtocolConfigs[chainId]
}

export function getProtocolChainIds(): ProtocolChainId[] {
  return Object.keys(protocolConfigs).map(Number)
}

export function getActiveEvmChainIds(): ProtocolChainId[] {
  return Object.keys(activeEvmProtocolConfigs).map(Number)
}
