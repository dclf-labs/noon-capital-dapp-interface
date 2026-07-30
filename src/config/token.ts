import type { Address } from '@/config/address'
import type { ProtocolChainId } from '@/config/chain-id'

export type Token = {
  name: string
  chainId?: ProtocolChainId
  decimals: number
  symbol: string
  iconSlug: string
  contractAddress: Address
  layerzeroOftAddress?: Address
  /** Sui OFT shared object ID (required for Sui → EVM sends). */
  layerzeroOftObjectId?: Address
  /** Sui OFT call-cap / package identity used by lz-sui-oft-sdk-v2. */
  layerzeroOftCallCapId?: Address
  /** Sui OApp shared object ID associated with the OFT. */
  layerzeroOappObjectId?: Address
  chainIconSlug?: string
  hyperlane?: Address
  isNative?: boolean
  isWrapped?: boolean
}
