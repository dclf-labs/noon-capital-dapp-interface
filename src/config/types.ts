import type { Address } from '@/config/address'
import type { ProtocolChainId } from '@/config/chain-id'
import type { CurvePool, UniV3Pool, UniV4Pool } from '@/config/pools'
import type { Token } from '@/config/token'
import type { VaultConfig } from '@/config/vault'

/**
 * Per-chain Noon protocol deployment config (contracts, tokens, pools, explorers).
 * Distinct from `src/chains` wallet/network metadata.
 */
export type ProtocolChainConfig = {
  id: ProtocolChainId
  name: string
  iconSlug: string
  rpcUrl: string
  directRedeemer?: Address
  noon?: Address
  sNoonRewarder?: Address
  directMinter?: Address
  useHyperlane?: Partial<Record<ProtocolChainId, boolean>>
  txnWaitTimeout?: number
  pointsApiChainId?: number | string
  syncswapV3Router?: Address
  layerzeroOftEid?: number
  hyperlaneDomain?: number
  explorerUrl?: string
  sellTokens?: string[]
  sNoon?: Address
  buyTokens?: string[]
  nativeTokens?: string[]
  bridgeTokens?: string[]
  mintCollaterals?: string[]
  redeemCollaterals?: string[]
  dataRefreshInterval?: number
  usn?: Address
  susn?: Address
  paymaster?: Address
  uniV3Quoter?: Address
  uniV3Factory?: Address
  uniV3SwapRouter?: Address
  layerzeroOftHelper?: Address
  mintHandler?: Address
  redeemHandler?: Address
  stakeWithdrawHandler?: Address
  stakingVault?: Address
  hyperlaneMailbox?: Address
  univ4Quoter?: Address
  univ4PositionManager?: Address
  uniUniversalRouter?: Address
  permit2?: Address
  contractExplorerUrl?: string
  tokenExplorerUrl?: string
  transactionExplorerUrl?: string
  addressExplorerUrl?: string
  defaultGasToken?: {
    name: string
    symbol: string
    decimals: number
    iconSlug: string
    contractAddress?: Address
  }
  ekuboRouter?: Address
  useCurvePools?: boolean
  useUniv4Pools?: boolean
  curveRouter?: Address
  curvePools?: Record<string, CurvePool>
  uniV4Pools?: Record<string, UniV4Pool>
  gasLimits?: Record<string, number>
  uniV3Pools?: Record<string, UniV3Pool>
  tokens?: Record<string, Token>
  vaults?: VaultConfig[]
}
