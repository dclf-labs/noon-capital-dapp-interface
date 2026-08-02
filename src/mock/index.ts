/** Presentational product UI (panels, switchers, local styles). Wired by `src/pages/*`. */

export { BridgeNetworkSwitcher } from '@/mock/bridge/BridgeNetworkSwitcher'
export {
  type BridgeNetworkOption,
  BridgePanel,
  type BridgePanelProps,
} from '@/mock/bridge/BridgePanel'
export { MintRedeemPanel, type MintRedeemPanelProps } from '@/mock/mint-redeem/MintRedeemPanel'
export {
  StakeUnstakePanel,
  type StakeUnstakePanelProps,
} from '@/mock/stake-unstake/StakeUnstakePanel'
export { WithdrawClaimsPanel } from '@/mock/stake-unstake/WithdrawClaimsPanel'
export { NetworkSwitcher } from '@/mock/swap/NetworkSwitcher'
export { TradePanelView, type TradePanelViewProps } from '@/mock/swap/TradePanelView'
export {
  DEMO_VAULTS,
  type VaultListItem,
  VaultsPageView,
  type VaultsPageViewProps,
} from '@/mock/vaults'
