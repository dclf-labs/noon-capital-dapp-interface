import { mainnet } from '@starknet-react/chains'

import type { Address } from '@/config/address'
import { STARKNET_MAINNET_CHAIN_ID } from '@/config/chain-id'
import { PointsApiChain } from '@/config/points-api'
import type { ProtocolChainConfig } from '@/config/types'
import { appEnv } from '@/lib/env'

export const config: ProtocolChainConfig = {
  id: STARKNET_MAINNET_CHAIN_ID,
  name: mainnet.name,
  iconSlug: 'starknet',
  hyperlaneDomain: 358974494,
  pointsApiChainId: PointsApiChain.STARKNET,
  txnWaitTimeout: 2 * 60 * 1000, // 2 minutes
  sellTokens: ['USDC', 'USDT', 'ETH', 'WBTC', 'STRK', 'wstETH', 'tBTC'],
  buyTokens: ['USN', 'sUSN'],
  nativeTokens: ['USN', 'sUSN'],
  bridgeTokens: ['USN', 'sUSN'],
  explorerUrl: 'https://voyager.online',
  rpcUrl: appEnv.rpc.starknet,
  dataRefreshInterval: 10 * 60 * 1000,
  hyperlaneMailbox: '0x05520a179658bd81e19d4e41abce2bc397bab5af302dadea70d8918c3cbdcea8',
  usn: '0x01e6545cab7ba4ac866768ba5e1bd540893762286ed3fea7f9c02bfa147e135b',
  susn: '0x02411565ef1a14decfbe83d2e987cced918cd752508a3d9c55deb67148d14d17',
  ekuboRouter: '0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066',
  contractExplorerUrl: 'https://voyager.online/contract',
  tokenExplorerUrl: 'https://voyager.online/contract',
  transactionExplorerUrl: 'https://voyager.online/tx',
  addressExplorerUrl: 'https://voyager.online/contract',
  gasLimits: {
    mint: 0,
    redeem: 0,
    swap: 113132000000000000,
    bridge: 113132000000000000,
    stake: 125148,
    approve: 85066,
    unstake: 70197,
    withdraw: 76942,
    swapUniv4: 1649404,
    claimAndStake: 673567,
  },
  defaultGasToken: {
    name: 'Stark',
    symbol: 'STRK',
    decimals: 18,
    iconSlug: 'starknet',
    contractAddress: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' as Address,
  },
  tokens: {
    USDC: {
      decimals: 6,
      name: 'USDC',
      symbol: 'USDC',
      iconSlug: 'USDC',
      contractAddress:
        '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8' as Address,
    },
    STRK: {
      decimals: 18,
      name: 'Stark',
      symbol: 'STRK',
      iconSlug: 'STRK',
      contractAddress:
        '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' as Address,
    },
    USDT: {
      decimals: 6,
      name: 'USDT',
      symbol: 'USDT',
      iconSlug: 'USDT',
      contractAddress:
        '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8' as Address,
    },
    USN: {
      name: 'USN',
      decimals: 18,
      symbol: 'USN',
      iconSlug: 'USN',
      contractAddress:
        '0x01e6545cab7ba4ac866768ba5e1bd540893762286ed3fea7f9c02bfa147e135b' as Address,
      hyperlane: '0x01e6545cab7ba4ac866768ba5e1bd540893762286ed3fea7f9c02bfa147e135b' as Address,
    },
    sUSN: {
      decimals: 18,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      name: 'Staked USN',
      contractAddress:
        '0x02411565ef1a14decfbe83d2e987cced918cd752508a3d9c55deb67148d14d17' as Address,
      hyperlane: '0x02411565ef1a14decfbe83d2e987cced918cd752508a3d9c55deb67148d14d17' as Address,
    },
    ETH: {
      decimals: 18,
      symbol: 'ETH',
      iconSlug: 'ETH',
      name: 'Ethereum',
      contractAddress:
        '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' as Address,
    },
    WBTC: {
      decimals: 8,
      symbol: 'WBTC',
      iconSlug: 'WBTC',
      name: 'Wrapped Bitcoin',
      contractAddress:
        '0x03Fe2b97C1Fd336E750087D68B9b867997Fd64a2661fF3ca5A7C771641e8e7AC' as Address,
    },
    wstETH: {
      decimals: 18,
      symbol: 'wstETH',
      iconSlug: 'wstETH',
      name: 'Wrapped Staked Ether',
      contractAddress:
        '0x0057912720381Af14B0E5C87aa4718ED5E527eaB60B3801ebF702AB09139E38b' as Address,
    },
    tBTC: {
      decimals: 18,
      symbol: 'tBTC',
      iconSlug: 'tBTC',
      name: 'tBTC',
      contractAddress:
        '0x04daa17763b286d1e59b97c283C0b8C949994C361e426A28F743c67bDfE9a32f' as Address,
    },
  },
}

export default config
