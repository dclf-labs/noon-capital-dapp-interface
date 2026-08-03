import { describe, expect, it } from 'vitest'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import {
  getDestinationNetworkType,
  type ReceiverModalAutoOpenReason,
  shouldAutoOpenReceiverModal,
  syncReceiverForDestination,
} from '@/features/bridge/receiver-modal'

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
  const addresses = {
    evm: '0xevm',
    starknet: '0xstark',
    sui: '0xsui',
  }

  it('selects the family receiver and closes unrelated modals without opening one', () => {
    expect(syncReceiverForDestination('starknet', addresses)).toEqual({
      receiverAddress: '0xstark',
      closeModals: ['evm', 'sui'],
      openModal: undefined,
    })
    expect(syncReceiverForDestination('sui', addresses)).toEqual({
      receiverAddress: '0xsui',
      closeModals: ['evm', 'starknet'],
      openModal: undefined,
    })
    expect(syncReceiverForDestination('evm', addresses)).toEqual({
      receiverAddress: '0xevm',
      closeModals: ['starknet', 'sui'],
      openModal: undefined,
    })
  })

  it('preserves undefined when the destination family has no stored address', () => {
    expect(syncReceiverForDestination('starknet', { evm: '0xevm' }).receiverAddress).toBeUndefined()
    expect(syncReceiverForDestination('starknet', { evm: '0xevm' }).openModal).toBeUndefined()
  })
})
