import type { Token } from '@/config/token'
import type { BuyPoweredBy } from '@/mock/buy/powered-by'

export type BuyTokenOption = {
  symbol: string
  iconSrc: string
  iconBg?: string
}

export type BuyPageViewProps = {
  /** Pay amount in tokenIn units (With row). */
  amountIn?: number
  /** Buy amount in tokenOut units (large center field). */
  amountOut?: number
  amountInUsd?: number
  /** USD price of the buy token — used for $100 / $300 / $1000 presets. */
  buyTokenUsdPrice?: number
  /**
   * tokenOut received per 1 tokenIn (unit quote).
   * Used to derive pay amount from the typed buy-token amount.
   */
  unitOutPerIn?: number
  tokenIn?: Token
  tokenOut?: Token
  tokensIn?: Token[]
  tokensOut?: Token[]
  balanceInLabel?: string
  networkFeeLabel?: string
  /** Native gas-token fee for the network-fee hover card. */
  networkFeeNativeLabel?: string
  /** DEX brand under the card (Uniswap / Syncswap / Ekubo). */
  poweredBy?: BuyPoweredBy
  primaryLabel?: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  isConnected?: boolean
  unsupported?: boolean
  presetsDisabled?: boolean
  isFetchingQuote?: boolean
  /** True while the submit gas estimate / USD price is still resolving. */
  isLoadingFee?: boolean
  /** User edited the buy-token amount (center field). */
  onBuyAmountChange?: (amount: number | undefined) => void
  /** USD preset → buy that many dollars of the buy token. */
  onUsdPreset?: (usd: number) => void
  onTokenInChange?: (token: Token) => void
  onTokenOutChange?: (token: Token) => void
  onPrimary?: () => void
}

export type BuyConfirmPanelProps = {
  amountIn?: number
  amountOut?: number
  tokenIn?: Token
  tokenOut?: Token
  networkFeeLabel?: string
  networkFeeNativeLabel?: string
  primaryLabel?: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  /** True while the submit gas estimate is still resolving. */
  isLoadingFee?: boolean
  onPrimary?: () => void
  onBack?: () => void
}

export type BuySuccessPanelProps = {
  amountOut?: number
  tokenOut?: Token
  txnUrl?: string
  onBuyMore?: () => void
}
