/**
 * Contract ABIs for Noon Capital.
 *
 * - `evm/` — Solidity JSON ABIs (viem / wagmi / ethers)
 * - `starknet/` — Cairo ABIs (starknet.js / starknet-react)
 *
 * Import from `@/lib/abis` rather than deep JSON paths.
 */
import curveRouter from '@/lib/abis/evm/curve-router.json'
import directMinter from '@/lib/abis/evm/direct-minter.json'
import directRedeemer from '@/lib/abis/evm/direct-redeemer.json'
import hyperlaneMailbox from '@/lib/abis/evm/hyperlane-mailbox.json'
import lagoonVault from '@/lib/abis/evm/lagoon-vault.json'
import layerzeroHyperlaneToken from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import layerzeroOft from '@/lib/abis/evm/layerzero-oft.json'
import layerzeroOftHelper from '@/lib/abis/evm/layerzero-oft-helper.json'
import mintHandler from '@/lib/abis/evm/mint-handler.json'
import permit2 from '@/lib/abis/evm/permit2.json'
import snoon from '@/lib/abis/evm/snoon.json'
import snoonPermanentStake from '@/lib/abis/evm/snoon-permanent-stake.json'
import snoonRewarder from '@/lib/abis/evm/snoon-rewarder.json'
import stakingVault from '@/lib/abis/evm/staking-vault.json'
import syncswapV3QuoterV2 from '@/lib/abis/evm/syncswap-v3-quoter-v2.json'
import syncswapV3Router from '@/lib/abis/evm/syncswap-v3-router.json'
import uniswapUniversalRouter from '@/lib/abis/evm/uniswap-universal-router.json'
import uniswapV3QuoterV2 from '@/lib/abis/evm/uniswap-v3-quoter-v2.json'
import uniswapV3SwapRouter01 from '@/lib/abis/evm/uniswap-v3-swap-router-01.json'
import uniswapV4Quoter from '@/lib/abis/evm/uniswap-v4-quoter.json'
import withdrawHandler from '@/lib/abis/evm/withdraw-handler.json'
import ekuboRouter from '@/lib/abis/starknet/ekubo-router.json'
import starknetHyperlaneMailbox from '@/lib/abis/starknet/hyperlane-mailbox.json'
import starknetLayerzeroHyperlaneToken from '@/lib/abis/starknet/layerzero-hyperlane-token.json'

/** EVM / Solidity ABIs keyed by contract role. */
export const evmAbis = {
  curveRouter,
  directMinter,
  directRedeemer,
  hyperlaneMailbox,
  lagoonVault,
  layerzeroHyperlaneToken,
  layerzeroOft,
  layerzeroOftHelper,
  mintHandler,
  permit2,
  /** sNOON staking NFT (withdrawal-reward variant). */
  snoon,
  /** sNOON staking NFT (permanent / extendable-stake variant). */
  snoonPermanentStake,
  snoonRewarder,
  stakingVault,
  syncswapV3QuoterV2,
  syncswapV3Router,
  uniswapUniversalRouter,
  uniswapV3QuoterV2,
  uniswapV3SwapRouter01,
  uniswapV4Quoter,
  withdrawHandler,
} as const

/** Starknet / Cairo ABIs keyed by contract role. */
export const starknetAbis = {
  ekuboRouter,
  hyperlaneMailbox: starknetHyperlaneMailbox,
  layerzeroHyperlaneToken: starknetLayerzeroHyperlaneToken,
} as const

export type EvmAbiName = keyof typeof evmAbis
export type StarknetAbiName = keyof typeof starknetAbis
