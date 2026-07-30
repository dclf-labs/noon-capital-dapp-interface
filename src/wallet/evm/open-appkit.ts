import { appKit } from '@/wallet/evm/config'

/**
 * Open Reown AppKit to the EVM wallet list.
 * Call this from a click handler when possible (keeps the user-gesture context).
 */
export async function openEvmAppKit() {
  if (!appKit) {
    throw new Error('[wallet] AppKit is not initialized (window missing?)')
  }

  // Prefer Connect + eip155 — matches Reown docs for Ethereum wallets.
  await appKit.open({ view: 'Connect', namespace: 'eip155' })
}
