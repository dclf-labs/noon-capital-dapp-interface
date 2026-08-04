import type { BridgeStatusNotice } from '@/mock/bridge/types'

export const BRIDGE_HERO_SUBTITLE =
  'Secure environments built to isolate, protect, and control critical systems.'

export const BRIDGE_ETA_LABEL = '10–15 mins'

export const BRIDGE_SUCCESS_NOTE =
  'Please allow 10–15 mins after transaction confirmation for your tokens to land in your receiving wallet.'

export const DEFAULT_BRIDGE_FEE_LABEL = '—'

/**
 * Fee-breakdown info tips (`BridgingFeesCollapsible` labels only).
 * Same tone as buy `NETWORK_FEE_TIP`: what it pays for + estimate caveat.
 */
export const BRIDGE_FEE_TIP =
  'Pays for cross-chain delivery of your tokens to the receiving network, in the source chain’s gas token. This is an estimate and can change with the route and network conditions.'

/** Source-chain submit gas — mirrors buy `NETWORK_FEE_TIP` for bridge context. */
export const BRIDGE_NETWORK_FEE_TIP =
  'Source-chain gas to submit your bridge transaction, paid in that network’s gas token. This is an estimate and can change with network conditions.'

/** Noon does not take a cut on supported bridge routes. */
export const PROTOCOL_FEE_TIP =
  'Noon does not charge a protocol fee on this bridge — this line stays at $0.'

/** Default receiver-access notice (neutral). */
export const BRIDGE_RECEIVER_NOTICE: BridgeStatusNotice = {
  type: 'neutral',
  title:
    'Before proceeding, please ensure that you can access the wallet address on the receiving chain.',
  description:
    'This is especially important if you use wallets like Gnosis Safe. If you cannot access this address, change the receiving wallet address to avoid any issues.',
}
