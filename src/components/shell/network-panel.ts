/** Geometry for the portaled network dropdown, anchored under a trigger rect. */
export type NetworkPanelCoords = {
  top: number
  right: number
}

const PANEL_GAP_PX = 8
const VIEWPORT_EDGE_PAD_PX = 8

/** Map a trigger’s viewport rect → fixed panel `top` / `right`. */
export function computeNetworkPanelCoords(
  triggerRect: Pick<DOMRect, 'bottom' | 'right'>,
  viewportWidth: number,
): NetworkPanelCoords {
  return {
    top: triggerRect.bottom + PANEL_GAP_PX,
    right: Math.max(VIEWPORT_EDGE_PAD_PX, viewportWidth - triggerRect.right),
  }
}

/** True when `chainId` is one of the allowlisted header network options. */
export function isHeaderNetworkChainId(
  chainId: number | string | bigint | null | undefined,
  options: ReadonlyArray<{ chainId: number | string | bigint }>,
): boolean {
  if (chainId == null) return false
  return options.some((option) => {
    const a = Number(option.chainId)
    const b = Number(chainId)
    if (Number.isFinite(a) && Number.isFinite(b)) return a === b
    return String(option.chainId) === String(chainId)
  })
}
