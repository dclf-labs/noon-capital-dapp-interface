import { hyperEvm, mainnet, sophon, tac, zksync } from 'wagmi/chains'

import { PointsApiChain } from '@/config/points-api'
import type { ProtocolChainConfig } from '@/config/types'

export const config: ProtocolChainConfig = {
  id: hyperEvm.id,
  name: hyperEvm.name,
  iconSlug: 'hyperevm',
  hyperlaneDomain: 999,
  pointsApiChainId: PointsApiChain.HYPEREVM,
  txnWaitTimeout: 2 * 60 * 1000, // 3 minutes
  bridgeTokens: ['sUSN'],
  explorerUrl: 'https://hyperevmscan.io',
  contractExplorerUrl: 'https://hyperevmscan.io/address',
  tokenExplorerUrl: 'https://hyperevmscan.io/token',
  transactionExplorerUrl: 'https://hyperevmscan.io/tx',
  addressExplorerUrl: 'https://hyperevmscan.io/address',
  rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
  dataRefreshInterval: 10 * 60 * 1000,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  susn: '0x34a2798D47b238A7CbA9D87D49618DEE6C4D999F',
  gasLimits: {
    mint: 125148,
    redeem: 0,
    swap: 210682,
    bridge: 90246,
    stake: 125148,
    approve: 85066,
    unstake: 70197,
    withdraw: 76942,
    swapUniv4: 1649404,
    claimAndStake: 673567,
    createStake: 464805,
    claimVesting: 461325,
  },
  useHyperlane: {
    [mainnet.id]: true,
    [sophon.id]: true,
    [zksync.id]: true,
    [tac.id]: true,
  },
  defaultGasToken: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
    iconSlug: 'HYPE',
  },
  tokens: {
    sUSN: {
      decimals: 18,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      name: 'Staked USN',
      contractAddress: '0x34a2798D47b238A7CbA9D87D49618DEE6C4D999F',
      layerzeroOftAddress: '0x34a2798D47b238A7CbA9D87D49618DEE6C4D999F',
      hyperlane: '0x34a2798D47b238A7CbA9D87D49618DEE6C4D999F',
    },
  },
}

export default config
