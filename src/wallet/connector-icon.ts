import type { ChainFamily } from '@/lib/wallet-session'

/** EVM-only local brand marks. Never applied on Starknet / Sui. */
const EVM_WALLET_ICON_BY_ID: Record<string, string> = {
  metaMask: '/assets/shell/metamask.svg',
  metamask: '/assets/shell/metamask.svg',
  'io.metamask': '/assets/shell/metamask.svg',
  'io.metamask.mobile': '/assets/shell/metamask.svg',
}

/** Starknet-only local brand marks. */
const STARKNET_WALLET_ICON_BY_ID: Record<string, string> = {
  argentX: '/assets/wallets/ready.png',
  ready: '/assets/wallets/ready.png',
}

type ConnectorIcon = string | { light?: string; dark?: string } | undefined

export type ConnectorIconSource = {
  id?: string
  name?: string
  icon?: ConnectorIcon
} | null

/**
 * Safely snapshot a wagmi / starknet-react / Sui connector.
 * Starknet `icon` getters call `ensureWallet()` and can throw — never let that break chrome.
 */
export function normalizeConnectorIconSource(connector: unknown): ConnectorIconSource {
  if (connector == null || typeof connector !== 'object') return null

  let id: string | undefined
  let name: string | undefined
  let icon: ConnectorIcon

  try {
    const rawId = (connector as { id?: unknown }).id
    if (typeof rawId === 'string' && rawId) id = rawId
  } catch {
    /* ignore */
  }

  try {
    const rawName = (connector as { name?: unknown }).name
    if (typeof rawName === 'string' && rawName) name = rawName
  } catch {
    /* ignore */
  }

  try {
    icon = (connector as { icon?: ConnectorIcon }).icon
  } catch {
    icon = undefined
  }

  if (!id && !name && !icon) return null
  return { id, name, icon }
}

function iconFromConnector(icon: ConnectorIcon): string | undefined {
  if (!icon) return undefined
  if (typeof icon === 'string') return icon || undefined
  return icon.light || icon.dark || undefined
}

function iconFromFamilyId(id: string | undefined, chainFamily: ChainFamily): string | undefined {
  if (!id) return undefined
  if (chainFamily === 'evm') return EVM_WALLET_ICON_BY_ID[id]
  if (chainFamily === 'starknet') return STARKNET_WALLET_ICON_BY_ID[id]
  return undefined
}

function iconFromFamilyName(
  id: string | undefined,
  name: string | undefined,
  chainFamily: ChainFamily,
): string | undefined {
  const key = `${id ?? ''} ${name ?? ''}`.toLowerCase()
  if (chainFamily === 'evm' && key.includes('metamask')) {
    return '/assets/shell/metamask.svg'
  }
  if (
    chainFamily === 'starknet' &&
    (key.includes('argent') || key.includes('ready') || key.includes('braavos'))
  ) {
    // Braavos ships its own data-URI via `icon`; Ready/Argent use the local mark.
    if (key.includes('braavos')) return undefined
    return '/assets/wallets/ready.png'
  }
  return undefined
}

/**
 * Resolve a wallet badge for the **active product family** connector only.
 *
 * 1. Active chain family (caller must pass the product family)
 * 2. That family's connector id / icon / name
 * 3. `undefined` → UI shows the generic wallet mark (never a cross-family icon)
 *
 * MetaMask marks are never returned outside the EVM family.
 */
export function resolveConnectorIconSrc(
  connector: unknown,
  chainFamily: ChainFamily,
): string | undefined {
  const snap = normalizeConnectorIconSource(connector)
  if (!snap) return undefined

  return (
    iconFromConnector(snap.icon) ??
    iconFromFamilyId(snap.id, chainFamily) ??
    iconFromFamilyName(snap.id, snap.name, chainFamily)
  )
}
