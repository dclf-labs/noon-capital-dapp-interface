import { citrea, mainnet } from '@reown/appkit/networks'

import { PointsApiChain } from '@/config/points-api'
import type { ProtocolChainConfig } from '@/config/types'

export const config: ProtocolChainConfig = {
  id: citrea.id,
  name: citrea.name,
  iconSlug: 'citrea',
  hyperlaneDomain: 4114,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  pointsApiChainId: PointsApiChain.CITREA,
  txnWaitTimeout: 2 * 60 * 1000, // 3 minutes
  nativeTokens: ['sUSN'],
  bridgeTokens: ['sUSN'],
  explorerUrl: 'https://explorer.mainnet.citrea.xyz',
  rpcUrl: 'https://rpc.mainnet.citrea.xyz',
  contractExplorerUrl: 'https://explorer.mainnet.citrea.xyz/address',
  tokenExplorerUrl: 'https://explorer.mainnet.citrea.xyz/token',
  transactionExplorerUrl: 'https://explorer.mainnet.citrea.xyz/tx',
  addressExplorerUrl: 'https://explorer.mainnet.citrea.xyz/address',
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
    name: 'cBTC',
    symbol: 'cBTC',
    decimals: 18,
    iconSlug: 'cBTC',
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
