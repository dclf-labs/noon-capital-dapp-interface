import { Stage } from '@layerzerolabs/lz-definitions'
import { OFT, type SendParam } from '@layerzerolabs/lz-sui-oft-sdk-v2'
import { SDK } from '@layerzerolabs/lz-sui-sdk-v2'
import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { hexToBytes } from 'viem'

import { SUI_SUSN_COIN_TYPE } from '@/config/chains/sui'
import type { Token } from '@/config/token'
import { getBridgeOptions } from '@/features/bridge/lib/bridge'
import { strToBn } from '@/lib/format'

export const getSuiCoinType = (token: Token | undefined): string | undefined => {
  if (!token) return undefined
  if (token.symbol === 'sUSN') return SUI_SUSN_COIN_TYPE
  return undefined
}

// LayerZero Sui SDK pins an older @mysten/sui; accept any JSON-RPC-compatible client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSuiOft = (client: any, token: Token | undefined): OFT | undefined => {
  const callCapId = token?.layerzeroOftCallCapId || token?.layerzeroOftAddress
  if (!callCapId) return undefined

  const sdk = new SDK({ client, stage: Stage.MAINNET })
  return new OFT(
    sdk,
    callCapId,
    token?.layerzeroOftObjectId,
    getSuiCoinType(token),
    token?.layerzeroOappObjectId,
  )
}

export const buildSuiOftSendParam = (
  dstEid: number,
  receiverAddress: string,
  amount: number,
  tokenDecimals: number,
): SendParam => {
  const amountLd = strToBn(amount, tokenDecimals)
  const optionsHex = getBridgeOptions()
  const optionsBytes = hexToBytes(
    (optionsHex.startsWith('0x') ? optionsHex : `0x${optionsHex}`) as `0x${string}`,
  )

  const toRaw = addressToBytes32(receiverAddress)
  const to: Uint8Array =
    toRaw instanceof Uint8Array
      ? toRaw
      : hexToBytes(`0x${String(toRaw).replace(/^0x/, '')}` as `0x${string}`)

  return {
    dstEid,
    to,
    amountLd,
    minAmountLd: amountLd,
    extraOptions: optionsBytes,
    composeMsg: new Uint8Array(0),
    oftCmd: new Uint8Array(0),
  }
}

export const isSuiOftSourceConfigured = (token: Token | undefined): boolean => {
  return !!(
    (token?.layerzeroOftCallCapId || token?.layerzeroOftAddress) &&
    token?.layerzeroOftObjectId &&
    token?.layerzeroOappObjectId
  )
}
