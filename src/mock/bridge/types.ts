import type { Token } from '@/config/token'
import type { StatusCalloutType } from '@/mock/bridge/StatusCallout'

export type BridgeNetworkOption = {
  id: number
  name: string
}

/** Status / warning notice shown between inputs and fees (old-dapp Info). */
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
  onReceiverChange: (value: string) => void
  feeLabel?: string
  feeNativeLabel?: string
  gasLabel?: string
  etaLabel?: string
  protocolLabel?: string
  /** Receiver / maintenance notice — rendered above fees like old-dapp Info. */
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
  /** Connected wallet on the source chain (old-dapp SubmitTxnInfo `address`). */
  sourceAddress?: string
  receiverValue?: string
  /** Chain `addressExplorerUrl` bases for from/to explorer links. */
  sourceAddressExplorerUrl?: string
  destinationAddressExplorerUrl?: string
  networkFeeLabel?: string
  networkFeeNativeLabel?: string
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
