import { base, hyperEvm, mainnet, sophon, tac, zksync } from 'wagmi/chains'

import { PointsApiChain } from '@/config/points-api'
import type { ProtocolChainConfig } from '@/config/types'

export const config: ProtocolChainConfig = {
  id: base.id,
  name: base.name,
  iconSlug: 'base',
  hyperlaneDomain: 8453,
  pointsApiChainId: PointsApiChain.BASE,
  txnWaitTimeout: 2 * 60 * 1000, // 3 minutes
  nativeTokens: ['sUSN'],
  bridgeTokens: ['sUSN'],
  explorerUrl: 'https://basescan.org',
  contractExplorerUrl: 'https://basescan.org/address',
  tokenExplorerUrl: 'https://basescan.org/token',
  transactionExplorerUrl: 'https://basescan.org/tx',
  addressExplorerUrl: 'https://basescan.org/address',
  hyperlaneMailbox: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/vKhVSViaOGH5mEYDuMwAy',
  dataRefreshInterval: 10 * 60 * 1000,
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
    [hyperEvm.id]: true,
  },
  defaultGasToken: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    iconSlug: 'ethereum',
  },
  tokens: {
    sUSN: {
      decimals: 18,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      name: 'Staked USN',
      contractAddress: '0x34a2798D47b238A7CbA9D87D49618DEE6C4D999F',
      hyperlane: '0x34a2798D47b238A7CbA9D87D49618DEE6C4D999F',
    },
  },
}

export default config
