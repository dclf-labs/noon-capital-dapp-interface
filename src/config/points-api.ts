/**
 * Custom chain IDs used by the points API (not network chain IDs).
 * Keys in `points.data.byChain` use these values.
 */
export enum PointsApiChain {
  NONE = 0,
  ETHEREUM = 1,
  POLYGON = 2,
  BASE = 3,
  ARBITRUM = 4,
  AVAX = 5,
  SOLANA = 6,
  OPTIMISM = 7,
  BNB = 8,
  ZKSYNC = 9,
  COSMOS = 10,
  SOPHON = 11,
  TAC = 12,
  STARKNET = 13,
  HYPEREVM = 14,
  CITREA = 15,
  BERA = 16,
}
