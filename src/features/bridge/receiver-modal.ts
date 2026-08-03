import type { ChainId } from '@/config/chain-id'
import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'

export type DestinationNetworkType = 'evm' | 'starknet' | 'sui'

export type ReceiverModalAutoOpenReason =
  'destination-network-change' | 'missing-receiver-address' | 'wallet-address-change'

export type ReceiverAddressBundle = {
  evm?: string
  starknet?: string
  sui?: string
}

export function getDestinationNetworkType(
  destinationChainId: ChainId | undefined,
): DestinationNetworkType {
  if (destinationChainId == null) return 'evm'
  if (Number(destinationChainId) === Number(STARKNET_BRIDGE_DESTINATION?.id)) return 'starknet'
  if (Number(destinationChainId) === Number(SUI_BRIDGE_DESTINATION?.id)) return 'sui'
  return 'evm'
}

/**
 * Receiver modal is opened only by SET ADDRESS / CHANGE on the bridge panel.
 * Providers must not autopop for network switches, missing address, or wallet changes.
 */
export function shouldAutoOpenReceiverModal(_reason: ReceiverModalAutoOpenReason): boolean {
  return false
}

/**
 * Sync the active `receiverAddress` for the destination family and which
 * family-specific modals should be closed. Never requests an auto-open.
 */
export function syncReceiverForDestination(
  destinationType: DestinationNetworkType,
  addresses: ReceiverAddressBundle,
): {
  receiverAddress: string | undefined
  closeModals: DestinationNetworkType[]
  openModal: undefined
} {
  if (destinationType === 'starknet') {
    return {
      receiverAddress: addresses.starknet,
      closeModals: ['evm', 'sui'],
      openModal: undefined,
    }
  }
  if (destinationType === 'sui') {
    return {
      receiverAddress: addresses.sui,
      closeModals: ['evm', 'starknet'],
      openModal: undefined,
    }
  }
  return {
    receiverAddress: addresses.evm,
    closeModals: ['starknet', 'sui'],
    openModal: undefined,
  }
}
