import { describe, expect, it } from 'vitest'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  getDestinationNetworkType,
  type ReceiverAddressBundle,
  type ReceiverModalAutoOpenReason,
  shouldAutoOpenReceiverModal,
  syncReceiverForDestination,
} from '@/features/bridge/receiver-modal'
import type { Address, StarknetAddress, SuiAddress } from '@/lib/address'

const AUTO_OPEN_REASONS: ReceiverModalAutoOpenReason[] = [
  'destination-network-change',
  'missing-receiver-address',
  'wallet-address-change',
]

describe('shouldAutoOpenReceiverModal', () => {
  it('never autopops — modal open is user-driven via SET ADDRESS / CHANGE', () => {
    for (const reason of AUTO_OPEN_REASONS) {
      expect(shouldAutoOpenReceiverModal(reason)).toBe(false)
    }
  })
})

describe('getDestinationNetworkType', () => {
  it('maps starknet / sui destination ids and defaults to evm', () => {
    expect(getDestinationNetworkType(undefined)).toBe('evm')
    expect(getDestinationNetworkType(1)).toBe('evm')
    expect(getDestinationNetworkType(STARKNET_BRIDGE_DESTINATION.id)).toBe('starknet')
    expect(getDestinationNetworkType(SUI_BRIDGE_DESTINATION.id)).toBe('sui')
  })
})

describe('syncReceiverForDestination', () => {
  const addresses: ReceiverAddressBundle = {
    evm: '0xevm' as Address,
    starknet: '0xstark' as StarknetAddress,
    sui: '0xsui' as SuiAddress,
  }

  it('selects the family receiver and closes unrelated modals without opening one', () => {
    expect(syncReceiverForDestination('starknet', addresses)).toEqual({
      receiverAddress: addresses.starknet,
      closeModals: ['evm', 'sui'],
      openModal: undefined,
    })
    expect(syncReceiverForDestination('sui', addresses)).toEqual({
      receiverAddress: addresses.sui,
      closeModals: ['evm', 'starknet'],
      openModal: undefined,
    })
    expect(syncReceiverForDestination('evm', addresses)).toEqual({
      receiverAddress: addresses.evm,
      closeModals: ['starknet', 'sui'],
      openModal: undefined,
    })
  })

  it('preserves undefined when the destination family has no stored address', () => {
    const evmOnly: ReceiverAddressBundle = { evm: addresses.evm }
    expect(syncReceiverForDestination('starknet', evmOnly).receiverAddress).toBeUndefined()
    expect(syncReceiverForDestination('starknet', evmOnly).openModal).toBeUndefined()
  })
})
