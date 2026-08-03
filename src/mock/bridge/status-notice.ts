import type { BridgeStatusNotice } from '@/mock/bridge/types'

/** Normalize a string or structured notice for `StatusCallout`. */
export function resolveBridgeStatusNotice(
  warning?: string | BridgeStatusNotice,
): BridgeStatusNotice | undefined {
  if (!warning) return undefined
  if (typeof warning !== 'string') {
    return { type: 'neutral', ...warning }
  }

  const isAlert = /disabled|maintenance|unavailable|not configured/i.test(warning)
  return {
    title: warning,
    type: isAlert ? 'warning' : 'neutral',
  }
}
