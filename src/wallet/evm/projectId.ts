/** Dev/test-only placeholder so AppKit can boot without a real Reown project id. */
export const DEV_PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000'

export interface ResolveWalletConnectProjectIdOptions {
  projectId: string
  isProd: boolean
  isDev: boolean
}

/**
 * Resolve the Reown / WalletConnect project id for AppKit.
 * Production fails closed when unset; local/CI may use a placeholder.
 */
export function resolveWalletConnectProjectId({
  projectId,
  isProd,
  isDev,
}: ResolveWalletConnectProjectIdOptions): string {
  const trimmed = projectId.trim()
  if (trimmed) return trimmed

  if (isProd) {
    throw new Error(
      '[evm] VITE_WALLETCONNECT_PROJECT_ID is required in production. Get one at https://dashboard.reown.com',
    )
  }

  if (isDev) {
    console.warn(
      '[evm] VITE_WALLETCONNECT_PROJECT_ID is empty. Set it in .env (https://dashboard.reown.com).',
    )
  }

  return DEV_PLACEHOLDER_PROJECT_ID
}
