import type { BridgeStatusNotice } from '@/mock/bridge/types'

export const BRIDGE_HERO_SUBTITLE =
  'Secure environments built to isolate, protect, and control critical systems.'

export const BRIDGE_ETA_LABEL = '10–15 mins'

export const BRIDGE_SUCCESS_NOTE =
  'Please allow 10–15 mins after transaction confirmation for your tokens to land in your receiving wallet.'

export const DEFAULT_BRIDGE_FEE_LABEL = '—'

/** Default receiver-access notice — same role as old-dapp bridge `Info` (neutral). */
export const BRIDGE_RECEIVER_NOTICE: BridgeStatusNotice = {
  type: 'neutral',
  title:
    'Before proceeding, please ensure that you can access the wallet address on the receiving chain.',
  description:
    'This is especially important if you use wallets like Gnosis Safe. If you cannot access this address, change the receiving wallet address to avoid any issues.',
}
