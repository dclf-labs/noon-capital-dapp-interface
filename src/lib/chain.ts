import { mainnet as evmMainnet } from 'wagmi/chains'

import {
  getActiveEvmChainIds as getActiveEvmChainIdsFromConfig,
  getToken,
  type ProtocolChainConfig,
  type ProtocolChainId,
  protocolConfigs,
} from '@/config'

export type ChainId = ProtocolChainId

export const CHAIN_CONFIGS: Record<number, ProtocolChainConfig> = protocolConfigs as Record<
  number,
  ProtocolChainConfig
>

const DEFAULT_CHAIN_ID = evmMainnet.id as ChainId

const chainIds = Object.keys(CHAIN_CONFIGS).map((id) => Number(id))
const uniqueChainIds = new Set(chainIds)
if (chainIds.length !== uniqueChainIds.size) {
  throw new Error('Duplicate chain IDs detected in CHAIN_CONFIGS')
}
if (!CHAIN_CONFIGS[Number(DEFAULT_CHAIN_ID)]) {
  throw new Error('Default chain config missing in CHAIN_CONFIGS')
}

function findChainIdByIcon(iconSlug: string): ChainId | undefined {
  const entry = Object.values(CHAIN_CONFIGS).find((c) => c.iconSlug === iconSlug)
  return entry?.id as ChainId | undefined
}

const STARKNET_CHAIN_ID = findChainIdByIcon('starknet')
const SUI_CHAIN_ID = findChainIdByIcon('sui')
const TAC_CHAIN_ID = findChainIdByIcon('tac')
const HYPEREVM_CHAIN_ID = findChainIdByIcon('hyperevm')
const BASE_CHAIN_ID = findChainIdByIcon('base')
const CITREA_CHAIN_ID = findChainIdByIcon('citrea')
const BERACHAIN_CHAIN_ID = findChainIdByIcon('berachain')

export const getSupportedChainIds = (): ChainId[] =>
  Object.keys(CHAIN_CONFIGS).map((id) => Number(id) as ChainId)

/** Active EVM protocol chain ids (re-exported from config — single source of truth). */
export const getActiveEvmChainIds = (): ChainId[] => getActiveEvmChainIdsFromConfig() as ChainId[]

export const isValidChainId = (chainId: ChainId | null | undefined): chainId is ChainId => {
  if (chainId === null || chainId === undefined) return false
  const num = Number(chainId)
  return Number.isFinite(num) && !!CHAIN_CONFIGS[num]
}

export const isStarknetChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || STARKNET_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(STARKNET_CHAIN_ID)
}

export const isSuiChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || SUI_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(SUI_CHAIN_ID)
}

export const isTacChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || TAC_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(TAC_CHAIN_ID)
}

export const isHyperEvmChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || HYPEREVM_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(HYPEREVM_CHAIN_ID)
}

export const isBaseChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || BASE_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(BASE_CHAIN_ID)
}

export const isCitreaChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || CITREA_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(CITREA_CHAIN_ID)
}

export const isBerachainChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined || BERACHAIN_CHAIN_ID === undefined) return false
  return Number(chainId) === Number(BERACHAIN_CHAIN_ID)
}

export const isEthereumMainnetChain = (chainId: ChainId | null | undefined): boolean => {
  if (chainId === null || chainId === undefined) return false
  return Number(chainId) === Number(DEFAULT_CHAIN_ID)
}

/**
 * True only for known protocol EVM chains.
 * Unknown / invalid ids are **not** treated as EVM (unlike a naive `!starknet && !sui`).
 */
export const isEvmChainId = (chainId: ChainId | null | undefined): boolean => {
  if (!isValidChainId(chainId)) return false
  return !isStarknetChain(chainId) && !isSuiChain(chainId)
}

/**
 * Narrow an unknown SDK / wallet chain id to a known protocol id.
 * Accepts `number` | `bigint` | numeric string; returns `undefined` when invalid.
 */
export const asChainId = (chainId: unknown): ChainId | undefined => {
  if (chainId === null || chainId === undefined) return undefined
  const num = typeof chainId === 'bigint' ? Number(chainId) : Number(chainId)
  if (!Number.isFinite(num)) return undefined
  return isValidChainId(num) ? num : undefined
}

export const getDefaultChainId = (): ChainId => DEFAULT_CHAIN_ID

export const getChainConfig = (chainId: ChainId | null | undefined): ProtocolChainConfig => {
  const id = isValidChainId(chainId) ? Number(chainId) : Number(DEFAULT_CHAIN_ID)
  return CHAIN_CONFIGS[id] ?? CHAIN_CONFIGS[Number(DEFAULT_CHAIN_ID)]
}

export const getChainConfigWithoutFallback = (
  chainId: ChainId | null | undefined,
): ProtocolChainConfig | undefined => CHAIN_CONFIGS[Number(chainId)]

export const getStarknetChainId = (): ChainId | undefined => STARKNET_CHAIN_ID
export const getSuiChainId = (): ChainId | undefined => SUI_CHAIN_ID
export const getTacChainId = (): ChainId | undefined => TAC_CHAIN_ID

export const isTacStarknetIncompatiblePair = (
  a: ChainId | null | undefined,
  b: ChainId | null | undefined,
): boolean => (isTacChain(a) && isStarknetChain(b)) || (isStarknetChain(a) && isTacChain(b))

export const isHyperEvmStarknetIncompatiblePair = (
  a: ChainId | null | undefined,
  b: ChainId | null | undefined,
): boolean =>
  (isStarknetChain(a) && isHyperEvmChain(b)) || (isHyperEvmChain(a) && isStarknetChain(b))

export const isBaseEthereumIncompatiblePair = (
  candidate: ChainId | null | undefined,
  opposite: ChainId | null | undefined,
): boolean => {
  if (!isBaseChain(opposite)) return false
  return !isEthereumMainnetChain(candidate)
}

export const isCitreaEthereumIncompatiblePair = (
  candidate: ChainId | null | undefined,
  opposite: ChainId | null | undefined,
): boolean => {
  if (!isCitreaChain(opposite)) return false
  return !isEthereumMainnetChain(candidate)
}

export const isBerachainEthereumIncompatiblePair = (
  candidate: ChainId | null | undefined,
  opposite: ChainId | null | undefined,
): boolean => {
  if (!isBerachainChain(opposite)) return false
  return !isEthereumMainnetChain(candidate)
}

export const isSuiEthereumIncompatiblePair = (
  candidate: ChainId | null | undefined,
  opposite: ChainId | null | undefined,
): boolean => {
  if (isSuiChain(opposite)) return !isEthereumMainnetChain(candidate)
  if (isSuiChain(candidate)) return opposite != null && !isEthereumMainnetChain(opposite)
  return false
}

export const getChainVaults = (chainId: number) => {
  if (!chainId) return undefined

  const config = getChainConfig(chainId)
  if (!config?.vaults || !config.id) return undefined

  return (
    config.vaults
      ?.map((vault) => {
        if (!vault?.assetSymbol) return undefined
        const token = getToken(config, vault.assetSymbol)
        if (!token) return undefined
        return {
          ...vault,
          chain: {
            name: config.name,
            chainId: config.id,
            iconSlug: config.iconSlug,
          },
          asset: token,
        }
      })
      ?.filter((vault) => !!vault) || []
  )
}

export const getVaults = () => {
  const ids = getActiveEvmChainIds()
  if (!ids.length) return []
  return ids
    .map((chainId) => getChainVaults(chainId))
    .flat()
    .filter((vault) => !!vault)
}
