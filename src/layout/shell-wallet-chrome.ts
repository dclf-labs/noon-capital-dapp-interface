import { DEFAULT_USERNAME } from '@/constants/api'
import type { UnifiedConnection } from '@/lib/connection'

function shortenAddress(address?: string) {
  if (!address) return undefined
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export type ShellWalletChrome = {
  /** True only when the *selected product network's* family wallet is live. */
  isConnected: boolean
  /** Label for the connected chip; undefined while disconnected. */
  walletLabel: string | undefined
  chainFamily: UnifiedConnection['chainFamily']
}

/**
 * Navbar Connect vs account chip — keyed off the active product family only.
 * An EVM connection must not keep the chip visible while Starknet/Sui is selected
 * (and vice versa).
 */
export function getShellWalletChrome(session: UnifiedConnection): ShellWalletChrome {
  const isConnected = Boolean(session.isConnected && session.address)
  const realName = session.name && session.name !== DEFAULT_USERNAME ? session.name : undefined

  return {
    isConnected,
    walletLabel: isConnected
      ? realName || shortenAddress(session.address) || 'Connected'
      : undefined,
    chainFamily: session.chainFamily,
  }
}
