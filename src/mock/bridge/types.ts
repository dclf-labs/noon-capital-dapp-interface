import type { Token } from '@/config/token'
import type { StatusCalloutType } from '@/mock/bridge/StatusCallout'

export type BridgeNetworkOption = {
  id: number
  name: string
  /** When true, shown in the picker but not selectable for the current route. */
  disabled?: boolean
}

/** Status / warning notice shown between inputs and fees. */
export type BridgeStatusNotice = {
  title: string
  description?: string
  type?: StatusCalloutType
}

export type BridgePanelProps = {
  isConnected: boolean
  unsupported?: boolean
  connectedAddress?: string
  sourceNetworks: BridgeNetworkOption[]
  destinationNetworks: BridgeNetworkOption[]
  sourceChainId?: number
  destinationChainId?: number
  onSourceChange: (chainId: number) => void
  onDestinationChange: (chainId: number | undefined) => void
  onFlipNetworks?: () => void
  tokens?: Token[]
  token?: Token
  onTokenChange: (token: Token) => void
  amount?: number
  amountUsd: number
  balanceInLabel?: string
  balanceOutLabel?: string
  receiverLabel: string
  receiverValue: string
  receiverPlaceholder: string
  /** Opens the Change Address modal. */
  onOpenReceiverModal: () => void
  feeLabel?: string
  /** Source-chain submit gas in USD (Network fee row). */
  networkFeeLabel?: string
  /** Native-unit tip for the network fee USD value. */
  networkFeeNativeLabel?: string
  /** Cross-chain delivery quote in USD (Bridge fee row). */
  gasFeeLabel?: string
  /** Native-unit tip for the bridge fee USD value. */
  gasFeeNativeLabel?: string
  /** Always `$0` — Protocol fee row. */
  protocolFeeLabel?: string
  /** Native-unit tip for the protocol fee USD value. */
  protocolFeeNativeLabel?: string
  etaLabel?: string
  protocolLabel?: string
  /** Receiver / maintenance notice — rendered above fees. */
  warning?: string | BridgeStatusNotice
  isFetchingFee?: boolean
  isLoadingFee?: boolean
  isInsufficientBalance?: boolean
  primaryLabel: string
  primaryDisabled: boolean
  primaryLoading?: boolean
  presetsDisabled?: boolean
  onAmountChange: (amount: number | undefined) => void
  onHalf: () => void
  onMax: () => void
  onPrimary: () => void
}

export type BridgeConfirmPanelProps = {
  amount?: number
  token?: Token
  sourceName?: string
  destinationName?: string
  /** `/assets/chains/…` for the source network row. */
  sourceChainIconSrc?: string
  /** `/assets/chains/…` for the destination network row. */
  destinationChainIconSrc?: string
  /** Connected wallet on the source chain. */
  sourceAddress?: string
  receiverValue?: string
  /** Chain `addressExplorerUrl` bases for from/to explorer links. */
  sourceAddressExplorerUrl?: string
  destinationAddressExplorerUrl?: string
  networkFeeLabel?: string
  networkFeeNativeLabel?: string
  /** Cross-chain delivery quote in USD (Bridge fee row). */
  gasFeeLabel?: string
  /** Native-unit tip for the bridge fee USD value. */
  gasFeeNativeLabel?: string
  protocolFeeLabel?: string
  protocolFeeNativeLabel?: string
  bridgeFeeLabel?: string
  etaLabel?: string
  warning?: string | BridgeStatusNotice
  primaryLabel?: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  isLoadingFee?: boolean
  onPrimary: () => void
  onBack?: () => void
}

export type BridgeSuccessPanelProps = {
  amount?: number
  token?: Token
  txnUrl?: string
  onBridgeMore: () => void
}
