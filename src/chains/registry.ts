import {
  base,
  berachain,
  citrea,
  hyperEvm,
  mainnet,
  monad,
  sophon,
  tac,
  zksync,
} from '@reown/appkit/networks'

import type {
  ChainDefinition,
  ChainFamily,
  ChainKey,
  EvmChainDefinition,
  EvmChainKey,
  StarknetChainDefinition,
  SuiChainDefinition,
} from '@/chains/types'
import { appEnv, DEFAULT_SUI_RPC_URL } from '@/lib/env'

/** AppKit / viem network objects for EVM wallet + RPC config (active product chains). */
export const evmAppKitNetworks = [
  mainnet,
  tac,
  zksync,
  hyperEvm,
  citrea,
  base,
  sophon,
  berachain,
] as const

/** Includes preview networks (e.g. Monad) that have protocol config but are not active in AppKit yet. */
export const allEvmAppKitNetworks = [...evmAppKitNetworks, monad] as const

const evmByKey = {
  ethereum: mainnet,
  tac,
  zksync,
  hyperevm: hyperEvm,
  citrea,
  base,
  sophon,
  berachain,
  monad,
} as const satisfies Record<EvmChainKey, (typeof allEvmAppKitNetworks)[number]>

function toEvmDefinition(
  key: EvmChainKey,
  network: (typeof evmByKey)[EvmChainKey],
): EvmChainDefinition {
  return {
    key,
    family: 'evm',
    name: network.name,
    shortName: key,
    chainId: network.id,
    nativeCurrency: {
      name: network.nativeCurrency.name,
      symbol: network.nativeCurrency.symbol,
      decimals: network.nativeCurrency.decimals,
    },
    rpcUrls: network.rpcUrls.default.http,
    explorerUrl: network.blockExplorers?.default.url,
    isTestnet: Boolean(network.testnet),
  }
}

export const starknetMainnet: StarknetChainDefinition = {
  key: 'starknet',
  family: 'starknet',
  name: 'Starknet',
  shortName: 'starknet',
  chainId: 'SN_MAIN',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: [appEnv.rpc.starknet],
  explorerUrl: 'https://voyager.online',
}

export const suiMainnet: SuiChainDefinition = {
  key: 'sui',
  family: 'sui',
  name: 'Sui',
  shortName: 'sui',
  network: 'mainnet',
  nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 },
  rpcUrls: [appEnv.rpc.sui || DEFAULT_SUI_RPC_URL],
  explorerUrl: 'https://suiscan.xyz',
}

export const chains = {
  ethereum: toEvmDefinition('ethereum', evmByKey.ethereum),
  tac: toEvmDefinition('tac', evmByKey.tac),
  zksync: toEvmDefinition('zksync', evmByKey.zksync),
  hyperevm: toEvmDefinition('hyperevm', evmByKey.hyperevm),
  citrea: toEvmDefinition('citrea', evmByKey.citrea),
  base: toEvmDefinition('base', evmByKey.base),
  sophon: toEvmDefinition('sophon', evmByKey.sophon),
  berachain: toEvmDefinition('berachain', evmByKey.berachain),
  monad: toEvmDefinition('monad', evmByKey.monad),
  starknet: starknetMainnet,
  sui: suiMainnet,
} as const satisfies Record<ChainKey, ChainDefinition>

export const chainList: ChainDefinition[] = Object.values(chains)

export const evmChains = chainList.filter(
  (chain): chain is EvmChainDefinition => chain.family === 'evm',
)

/** EVM chains currently wired into AppKit (excludes preview networks like Monad). */
export const activeEvmChainKeys = [
  'ethereum',
  'tac',
  'zksync',
  'hyperevm',
  'citrea',
  'base',
  'sophon',
  'berachain',
] as const satisfies readonly EvmChainKey[]

export function getChain(key: ChainKey): ChainDefinition {
  return chains[key]
}

export function getChainsByFamily(family: ChainFamily): ChainDefinition[] {
  return chainList.filter((chain) => chain.family === family)
}

export function getEvmChainByChainId(chainId: number): EvmChainDefinition | undefined {
  return evmChains.find((chain) => chain.chainId === chainId)
}

export function getEvmAppKitNetwork(key: EvmChainKey) {
  return evmByKey[key]
}
