import { describe, expect, it } from 'vitest'

import { STARKNET_MAINNET_CHAIN_ID, SUI_MAINNET_CHAIN_ID } from '@/config/chain-id'
import {
  asChainId,
  getActiveEvmChainIds,
  getChainConfig,
  getChainConfigWithoutFallback,
  getChainVaults,
  getDefaultChainId,
  getStarknetChainId,
  getSuiChainId,
  getSupportedChainIds,
  getTacChainId,
  getVaults,
  isBaseChain,
  isBaseEthereumIncompatiblePair,
  isBerachainChain,
  isBerachainEthereumIncompatiblePair,
  isCitreaChain,
  isCitreaEthereumIncompatiblePair,
  isEthereumMainnetChain,
  isEvmChainId,
  isHyperEvmChain,
  isHyperEvmStarknetIncompatiblePair,
  isStarknetChain,
  isSuiChain,
  isSuiEthereumIncompatiblePair,
  isTacChain,
  isTacStarknetIncompatiblePair,
  isValidChainId,
} from '@/lib/chain'

const ETH = 1
const BASE = 8453
const ZKSYNC = 324

function chainIdByIcon(iconSlug: string): number {
  const id = getSupportedChainIds().find((chainId) => getChainConfig(chainId).iconSlug === iconSlug)
  expect(id, `missing chain config for icon ${iconSlug}`).toBeDefined()
  return id!
}

describe('chain helpers', () => {
  it('lists supported and active EVM chain ids', () => {
    const supported = getSupportedChainIds()
    const active = getActiveEvmChainIds()
    expect(supported).toContain(ETH)
    expect(supported).toContain(STARKNET_MAINNET_CHAIN_ID)
    expect(supported).toContain(SUI_MAINNET_CHAIN_ID)
    expect(active).toContain(ETH)
    expect(active).not.toContain(STARKNET_MAINNET_CHAIN_ID)
    expect(active).not.toContain(SUI_MAINNET_CHAIN_ID)
  })

  it('validates chain ids and defaults to Ethereum', () => {
    expect(isValidChainId(ETH)).toBe(true)
    expect(isValidChainId(null)).toBe(false)
    expect(isValidChainId(undefined)).toBe(false)
    expect(isValidChainId(999999 as never)).toBe(false)
    expect(getDefaultChainId()).toBe(ETH)
    expect(getChainConfig(undefined).id).toBe(ETH)
    expect(getChainConfigWithoutFallback(ETH)?.id).toBe(ETH)
    expect(getChainConfigWithoutFallback(999999)).toBeUndefined()
  })

  it('detects family-specific chains', () => {
    const tac = chainIdByIcon('tac')
    const hyper = chainIdByIcon('hyperevm')
    const citrea = chainIdByIcon('citrea')
    const bera = chainIdByIcon('berachain')

    expect(isStarknetChain(getStarknetChainId())).toBe(true)
    expect(isSuiChain(getSuiChainId())).toBe(true)
    expect(isEthereumMainnetChain(ETH)).toBe(true)
    expect(isBaseChain(BASE)).toBe(true)
    expect(isTacChain(tac)).toBe(true)
    expect(isHyperEvmChain(hyper)).toBe(true)
    expect(isCitreaChain(citrea)).toBe(true)
    expect(isBerachainChain(bera)).toBe(true)
    expect(getTacChainId()).toBe(tac)
    expect(isEvmChainId(ETH)).toBe(true)
    expect(isEvmChainId(STARKNET_MAINNET_CHAIN_ID)).toBe(false)
    expect(isEvmChainId(SUI_MAINNET_CHAIN_ID)).toBe(false)
    expect(isEvmChainId(999999 as never)).toBe(false)
    expect(isEvmChainId(null)).toBe(false)
    expect(asChainId(ETH)).toBe(ETH)
    expect(asChainId(8453n)).toBe(BASE)
    expect(asChainId('324')).toBe(ZKSYNC)
    expect(asChainId(999999)).toBeUndefined()
    expect(asChainId(undefined)).toBeUndefined()
    expect(isStarknetChain(null)).toBe(false)
    expect(isSuiChain(undefined)).toBe(false)
    expect(isTacChain(null)).toBe(false)
    expect(isHyperEvmChain(undefined)).toBe(false)
    expect(isCitreaChain(null)).toBe(false)
    expect(isBerachainChain(undefined)).toBe(false)
    expect(isEthereumMainnetChain(null)).toBe(false)
    expect(isBaseChain(null)).toBe(false)
  })

  it('flags incompatible bridge pairs', () => {
    const starknet = getStarknetChainId()!
    const sui = getSuiChainId()!
    const tac = chainIdByIcon('tac')
    const hyper = chainIdByIcon('hyperevm')
    const citrea = chainIdByIcon('citrea')
    const bera = chainIdByIcon('berachain')

    expect(isTacStarknetIncompatiblePair(tac, starknet)).toBe(true)
    expect(isTacStarknetIncompatiblePair(ETH, starknet)).toBe(false)
    expect(isHyperEvmStarknetIncompatiblePair(hyper, starknet)).toBe(true)
    expect(isBaseEthereumIncompatiblePair(ZKSYNC, BASE)).toBe(true)
    expect(isBaseEthereumIncompatiblePair(ETH, BASE)).toBe(false)
    expect(isBaseEthereumIncompatiblePair(ETH, ETH)).toBe(false)
    expect(isCitreaEthereumIncompatiblePair(ZKSYNC, citrea)).toBe(true)
    expect(isBerachainEthereumIncompatiblePair(ZKSYNC, bera)).toBe(true)
    expect(isSuiEthereumIncompatiblePair(ZKSYNC, sui)).toBe(true)
    expect(isSuiEthereumIncompatiblePair(ETH, sui)).toBe(false)
    expect(isSuiEthereumIncompatiblePair(sui, ZKSYNC)).toBe(true)
    expect(isSuiEthereumIncompatiblePair(ETH, ETH)).toBe(false)
  })

  it('resolves vault listings for active EVM chains', () => {
    expect(getChainVaults(0)).toBeUndefined()
    expect(getChainVaults(ETH)).toBeUndefined()

    const tac = chainIdByIcon('tac')
    const tacVaults = getChainVaults(tac)
    expect(tacVaults?.length).toBeGreaterThan(0)
    expect(tacVaults?.[0]?.chain.chainId).toBe(tac)
    expect(tacVaults?.[0]?.asset?.symbol).toBeTruthy()

    const all = getVaults()
    expect(all.some((vault) => vault?.chain.chainId === tac)).toBe(true)
  })
})
