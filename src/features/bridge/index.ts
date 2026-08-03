// Public surface for the bridge feature.

export { default as EvmBridgeProvider } from './context/evm/BridgeProvider'
export { default as StarknetBridgeProvider } from './context/starknet/BridgeProvider'
export { default as SuiBridgeProvider } from './context/sui/BridgeProvider'
export { canFlipBridgeNetworks, isSameFamilyBridgeFlip, requestBridgeNetworkFlip } from './flip'
export { default as useEvmBridge } from './hooks/evm/useBridge'
export { default as useStarknetBridge } from './hooks/starknet/useBridge'
export { default as useSuiBridge } from './hooks/sui/useBridge'
export * from './lib/bridge'
export * from './lib/sui-oft'
export {
  type BridgePrimaryAction,
  type BridgePrimaryParams,
  getBridgePrimaryAction,
} from './primary'
export {
  type DestinationNetworkType,
  getDestinationNetworkType,
  type ReceiverAddressBundle,
  type ReceiverModalAutoOpenReason,
  shouldAutoOpenReceiverModal,
  syncReceiverForDestination,
} from './receiver-modal'
export {
  doesLayerzeroNeedApproval,
  getLayerzeroApproveSpender,
  isBridgePairAllowed,
  isHyperlaneBridgeRoute,
  isLayerzeroBridgeRouteDisabled,
  isSuiToEthBridgeDisabled,
} from './route'
