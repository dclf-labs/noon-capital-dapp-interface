import { describe, expect, it } from 'vitest'

import { getChainConfig, getDefaultChainId, getStarknetChainId, getSuiChainId } from '@/lib/chain'
import {
  EMPTY_EVM_CONNECTION,
  EMPTY_STARKNET_CONNECTION,
  EMPTY_SUI_CONNECTION,
  isActiveEvmConnection,
  isActiveStarknetConnection,
  isActiveSuiConnection,
  type UnifiedConnection,
} from '@/lib/connection'
import { buildEvmConnection, toUnifiedConnection } from '@/lib/wallet-session'

const ETH = 1
const VALID = '0x1111111111111111111111111111111111111111' as const

describe('connection stubs', () => {
  it('EMPTY_* stubs are disconnected, unsupported, and use a real protocol config', () => {
    for (const stub of [EMPTY_EVM_CONNECTION, EMPTY_STARKNET_CONNECTION, EMPTY_SUI_CONNECTION]) {
      expect(stub.isConnected).toBe(false)
      expect(stub.unsupported).toBe(true)
      expect(stub.address).toBeUndefined()
      expect(stub.config.id).toBe(getDefaultChainId())
      expect(stub.config).toEqual(getChainConfig(getDefaultChainId()))
    }
  })
})

describe('UnifiedConnection type guards', () => {
  it('narrows EVM / Starknet / Sui active sessions', () => {
    const family = buildEvmConnection({
      isConnected: true,
      address: VALID,
      connector: undefined,
      connectedChainId: ETH,
      targetChainId: ETH,
    })
    const evm = toUnifiedConnection(
      family,
      { chainId: ETH, chainFamily: 'evm', config: family.config },
      { walletConnected: true, walletChainId: ETH },
    )

    expect(isActiveEvmConnection(evm)).toBe(true)
    expect(isActiveStarknetConnection(evm)).toBe(false)
    expect(isActiveSuiConnection(evm)).toBe(false)

    const starknetId = getStarknetChainId()!
    const starknet: UnifiedConnection = {
      ...EMPTY_STARKNET_CONNECTION,
      chainFamily: 'starknet',
      activeChainId: starknetId,
      config: getChainConfig(starknetId),
    }
    expect(isActiveStarknetConnection(starknet)).toBe(true)
    expect(isActiveEvmConnection(starknet)).toBe(false)

    const suiId = getSuiChainId()!
    const sui: UnifiedConnection = {
      ...EMPTY_SUI_CONNECTION,
      chainFamily: 'sui',
      activeChainId: suiId,
      config: getChainConfig(suiId),
    }
    expect(isActiveSuiConnection(sui)).toBe(true)
    expect(isActiveEvmConnection(sui)).toBe(false)

    expect(isActiveEvmConnection(undefined)).toBe(false)
  })
})
