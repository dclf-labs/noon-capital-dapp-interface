import { Stage } from '@layerzerolabs/lz-definitions'
import { OFT, type SendParam } from '@layerzerolabs/lz-sui-oft-sdk-v2'
import { SDK } from '@layerzerolabs/lz-sui-sdk-v2'
import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { hexToBytes } from 'viem'

import type { Token } from '@/config/token'
import { getBridgeOptions } from '@/features/bridge/lib/bridge'
import { slippageAdjustedAmount } from '@/features/swap/lib/swap'
import { strToBn } from '@/lib/format'
import { getSuiCoinType } from '@/lib/sui-coin'

export { getSuiCoinType }

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

/**
 * Build Sui OFT `SendParam`. UI shows 1:1 amount / “Slippage 0%”, but on-chain
 * `minAmountLd` still applies the shared 1% haircut (`slippageAdjustedAmount`).
 */
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
    minAmountLd: slippageAdjustedAmount(amountLd, 1),
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
