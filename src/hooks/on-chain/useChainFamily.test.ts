import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useChainFamily from '@/hooks/on-chain/useChainFamily'
import { getChainConfig, getStarknetChainId, getSuiChainId } from '@/lib/chain'
import {
  EMPTY_EVM_CONNECTION,
  EMPTY_STARKNET_CONNECTION,
  EMPTY_SUI_CONNECTION,
  type UnifiedConnection,
} from '@/lib/connection'

function asEvm(): UnifiedConnection {
  return {
    ...EMPTY_EVM_CONNECTION,
    chainFamily: 'evm',
    activeChainId: 1,
    config: getChainConfig(1),
  }
}

function asStarknet(): UnifiedConnection {
  const id = getStarknetChainId()!
  return {
    ...EMPTY_STARKNET_CONNECTION,
    chainFamily: 'starknet',
    activeChainId: id,
    config: getChainConfig(id),
  }
}

function asSui(): UnifiedConnection {
  const id = getSuiChainId()!
  return {
    ...EMPTY_SUI_CONNECTION,
    chainFamily: 'sui',
    activeChainId: id,
    config: getChainConfig(id),
  }
}

describe('useChainFamily', () => {
  it('returns fallback when connection is missing', () => {
    const { result } = renderHook(() =>
      useChainFamily({
        connection: undefined,
        evm: 'evm',
        starknet: 'starknet',
        sui: 'sui',
        fallback: 'fallback',
      }),
    )
    expect(result.current).toBe('fallback')
  })

  it('routes EVM / Starknet / Sui results', () => {
    const { result, rerender } = renderHook(
      ({ connection }: { connection: UnifiedConnection }) =>
        useChainFamily({
          connection,
          evm: 'evm',
          starknet: 'starknet',
          sui: 'sui',
          fallback: 'fallback',
        }),
      { initialProps: { connection: asEvm() } },
    )
    expect(result.current).toBe('evm')

    rerender({ connection: asStarknet() })
    expect(result.current).toBe('starknet')

    rerender({ connection: asSui() })
    expect(result.current).toBe('sui')
  })

  it('falls back for Sui when no sui branch is provided', () => {
    const { result } = renderHook(() =>
      useChainFamily({
        connection: asSui(),
        evm: 'evm',
        starknet: 'starknet',
        fallback: 'fallback',
      }),
    )
    expect(result.current).toBe('fallback')
  })
})
