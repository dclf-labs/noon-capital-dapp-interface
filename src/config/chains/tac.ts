import { hyperEvm, mainnet, sophon, tac, zksync } from 'wagmi/chains'

import { PointsApiChain } from '@/config/points-api'
import type { ProtocolChainConfig } from '@/config/types'
import { DEFAULT_VAULT_CURATOR } from '@/config/vault'
import { appEnv } from '@/lib/env'

export const config: ProtocolChainConfig = {
  id: tac.id,
  name: tac.name,
  iconSlug: 'tac',
  useCurvePools: true,
  hyperlaneDomain: 239,
  pointsApiChainId: PointsApiChain.TAC,
  txnWaitTimeout: 2 * 60 * 1000, // 3 minutes
  sellTokens: ['USDT'],
  buyTokens: ['USN', 'sUSN'],
  nativeTokens: ['USN', 'sUSN'],
  bridgeTokens: ['USN', 'sUSN'],
  explorerUrl: 'https://explorer.tac.build',
  contractExplorerUrl: 'https://explorer.tac.build/address',
  tokenExplorerUrl: 'https://explorer.tac.build/contract',
  transactionExplorerUrl: 'https://explorer.tac.build/tx',
  addressExplorerUrl: 'https://explorer.tac.build/address',
  rpcUrl: appEnv.rpc.tac || 'https://rpc.tac.build',
  useHyperlane: {
    [mainnet.id]: true,
    [zksync.id]: true,
    [sophon.id]: true,
    [hyperEvm.id]: true,
  },
  dataRefreshInterval: 10 * 60 * 1000,
  hyperlaneMailbox: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  usn: '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6',
  susn: '0x5Ced7F73B76A555CCB372cc0F0137bEc5665F81E',
  curveRouter: '0x3F5A41B922a76759b9C77D36b3d337E88cD1dc5e',
  curvePools: {
    'USN-USDT': {
      route: [
        '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6', // USN
        '0x24894F0c4f80837d61CA21730A75Fa216FED7200', // Pool
        '0xAF988C3f7CB2AceAbB15f96b19388a259b6C438f', // USDT
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
      swapParams: [
        [0, 1, 1, 10],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
    'USDT-USN': {
      route: [
        '0xAF988C3f7CB2AceAbB15f96b19388a259b6C438f', // USDT
        '0x24894F0c4f80837d61CA21730A75Fa216FED7200', // Pool
        '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6', // USN
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
      swapParams: [
        [1, 0, 1, 10],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
    'USDT-sUSN': {
      route: [
        '0xAF988C3f7CB2AceAbB15f96b19388a259b6C438f', // USDT
        '0x24894F0c4f80837d61CA21730A75Fa216FED7200', // Pool
        '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6', // USN
        '0x1436e4Ca2c687335b7c5E1b446AE532b9e287160', // Pool
        '0x5Ced7F73B76A555CCB372cc0F0137bEc5665F81E', // sUSN
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
      swapParams: [
        [1, 0, 1, 10],
        [1, 0, 1, 10],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
    'sUSN-USDT': {
      route: [
        '0x5Ced7F73B76A555CCB372cc0F0137bEc5665F81E', // sUSN
        '0x1436e4Ca2c687335b7c5E1b446AE532b9e287160', // Pool
        '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6', // USN
        '0x24894F0c4f80837d61CA21730A75Fa216FED7200', // Pool
        '0xAF988C3f7CB2AceAbB15f96b19388a259b6C438f', // USDT
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
      swapParams: [
        [0, 1, 1, 10],
        [0, 1, 1, 10],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
  },
  gasLimits: {
    mint: 0,
    redeem: 0,
    swap: 210682,
    bridge: 90246,
    stake: 125148,
    approve: 85066,
    unstake: 70197,
    withdraw: 76942,
    swapUniv4: 1649404,
    claimAndStake: 673567,
    swapCurve: 210682,
  },
  defaultGasToken: {
    name: 'Tac',
    symbol: 'TAC',
    decimals: 18,
    iconSlug: 'tac',
  },
  tokens: {
    USN: {
      name: 'USN',
      decimals: 18,
      symbol: 'USN',
      iconSlug: 'USN',
      contractAddress: '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6',
      hyperlane: '0x51A30E647D33A044967FA3DBb04d6ED6F45455F6',
    },
    sUSN: {
      decimals: 18,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      name: 'Staked USN',
      contractAddress: '0x5Ced7F73B76A555CCB372cc0F0137bEc5665F81E',
      hyperlane: '0x5Ced7F73B76A555CCB372cc0F0137bEc5665F81E',
    },
    USDT: {
      decimals: 6,
      symbol: 'USDT',
      iconSlug: 'USDT',
      name: 'Tether USD',
      contractAddress: '0xAF988C3f7CB2AceAbB15f96b19388a259b6C438f',
    },
  },
  vaults: [
    {
      name: 'Noon USN',
      vaultUrl: 'https://app.lagoon.finance/vault/239/0x279385C180f5d01C4a4bDfF040F17B8957304762',
      nameTooltip:
        "The Noon TAC pre-deposit vault gives you access to the best combination of yield mechanics available today.\nNoon's sUSN yields (50% to 75% greater than sUSDe or USR) form the base of this vault, with yields boosted through Noon's governance token points (up to 80% airdrop to users), delta-neutral strategies from Tulipa (leveraged looping, etc.), and, of course, over 20% additional APY via TAC tokens.",
      curators: [
        DEFAULT_VAULT_CURATOR,
        {
          name: 'Tulipa Capital',
          iconSlug: 'tulipa-capital',
          url: 'https://www.tulipa.capital/',
        },
      ],
      vaultAssetName: 'tacUSN',
      vaultAssetSymbol: 'tacUSN',
      vaultAssetDecimals: 18,
      isStablecoinAsset: true,
      assetSymbol: 'USN',
      chainTooltip: 'This is the chain where deposits can be made.',
      fees: {
        performance: '10%',
        maintenance: '0.5%',
      },
      feesTooltip:
        'The vault curator will charge these fees. The first is the management fee and the second is the performance fee. Both are calculated on an annual basis, but fees are distributed every time deposits or withdrawals are settled.',
      settlementFrequency: 'Max 7D',
      settlementFrequencyTooltip: "This is the frequency that the vault's TVL and APY is updated.",
      getAssetUrl: '/get/buy',
      requireTAndCSignature: false,
      isRedirectable: true,
      assetLightBgSlug: 'usn-vault-asset-bg',
      assetDarkBgSlug: 'usn-vault-asset-bg-dark',
      vault: '0x279385C180f5d01C4a4bDfF040F17B8957304762',
      subgraph:
        'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-tac-vault/prod/gn',
    },
  ],
}

export default config
