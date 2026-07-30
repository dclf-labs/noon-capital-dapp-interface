import { berachain, mainnet } from 'wagmi/chains'

import { PointsApiChain } from '@/config/points-api'
import type { ProtocolChainConfig } from '@/config/types'

export const config: ProtocolChainConfig = {
  id: berachain.id,
  name: berachain.name,
  iconSlug: 'berachain',
  hyperlaneDomain: 80094,
  hyperlaneMailbox: '0x7f50C5776722630a0024fAE05fDe8b47571D7B39',
  pointsApiChainId: PointsApiChain.BERA,
  txnWaitTimeout: 2 * 60 * 1000, // 3 minutes
  nativeTokens: ['sUSN'],
  bridgeTokens: ['sUSN'],
  explorerUrl: 'https://berascan.com/',
  rpcUrl: 'https://rpc.berachain.com',
  contractExplorerUrl: 'https://berascan.com/address',
  tokenExplorerUrl: 'https://berascan.com/token',
  transactionExplorerUrl: 'https://berascan.com/tx',
  addressExplorerUrl: 'https://berascan.com/address',
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
  },
  defaultGasToken: {
    name: 'BERA',
    symbol: 'BERA',
    decimals: 18,
    iconSlug: 'BERA',
  },
  tokens: {
    sUSN: {
      decimals: 18,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      name: 'Staked USN',
      contractAddress: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD',
      hyperlane: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD',
    },
  },
}

export default config
