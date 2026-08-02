import type { Address } from '@/config/address'
import { SUI_MAINNET_CHAIN_ID } from '@/config/chain-id'
import type { ProtocolChainConfig } from '@/config/types'
import { appEnv, DEFAULT_SUI_RPC_URL } from '@/lib/env'

/** Coin package (Move type lives here). */
const SUI_SUSN_PACKAGE_ID =
  '0x0a672389b7b73df60d40666ac9545433d59d3128086b9e3a425a66bbffdf4dc5' as Address

/** LayerZero OFT package — peer address on remote chains / SDK call-cap identity. */
const SUI_SUSN_OFT_PACKAGE_ID =
  '0xa356ca2010fcdf44d6cecfcecf18b73c32188d361e39dff3a96ac8de0dec7b1b' as Address

const SUI_SUSN_OFT_OBJECT_ID =
  '0xab496ed0068cba592901b15cf0192ad366c2634fae3a75eb9632cfa5bdaf567e' as Address

const SUI_SUSN_OAPP_OBJECT_ID =
  '0xe8a26b0ba4f665eb7f1bc1996ed9b93892bc9ed67013321b5b71de1f89b7029f' as Address

/** Move coin type on Sui (package::module::STRUCT). */
export const SUI_SUSN_COIN_TYPE = `${SUI_SUSN_PACKAGE_ID}::susn::SUSN`

/**
 * Sui mainnet config for bidirectional LayerZero bridging (sUSN only).
 * LayerZero peers use the OFT package ID (not object ID / coin type).
 * Sui → ETH needs OFT object + OApp object IDs.
 */
export const config: ProtocolChainConfig = {
  id: SUI_MAINNET_CHAIN_ID,
  name: 'Sui',
  iconSlug: 'sui',
  layerzeroOftEid: 30378,
  pointsApiChainId: 30378,
  txnWaitTimeout: 2 * 60 * 1000,
  bridgeTokens: ['sUSN'],
  nativeTokens: ['sUSN'],
  buyTokens: ['sUSN'],
  explorerUrl: 'https://suiscan.xyz/mainnet',
  rpcUrl: appEnv.rpc.sui || DEFAULT_SUI_RPC_URL,
  contractExplorerUrl: 'https://suiscan.xyz/mainnet/object',
  tokenExplorerUrl: 'https://suiscan.xyz/mainnet/coin',
  transactionExplorerUrl: 'https://suiscan.xyz/mainnet/tx',
  addressExplorerUrl: 'https://suiscan.xyz/mainnet/account',
  dataRefreshInterval: 10 * 60 * 1000,
  gasLimits: {
    mint: 0,
    redeem: 0,
    swap: 0,
    bridge: 0,
    stake: 0,
    approve: 0,
    unstake: 0,
    withdraw: 0,
    swapUniv4: 0,
    claimAndStake: 0,
  },
  defaultGasToken: {
    name: 'Sui',
    symbol: 'SUI',
    decimals: 9,
    iconSlug: 'sui',
  },
  tokens: {
    sUSN: {
      decimals: 6,
      symbol: 'sUSN',
      iconSlug: 'sUSN',
      name: 'Staked USN',
      contractAddress: SUI_SUSN_PACKAGE_ID,
      layerzeroOftAddress: SUI_SUSN_OFT_PACKAGE_ID,
      layerzeroOftCallCapId: SUI_SUSN_OFT_PACKAGE_ID,
      layerzeroOftObjectId: SUI_SUSN_OFT_OBJECT_ID,
      layerzeroOappObjectId: SUI_SUSN_OAPP_OBJECT_ID,
    },
  },
}

export default config
