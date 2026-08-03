const PANEL_GAP_PX = 6
const VIEWPORT_EDGE_PAD_PX = 8
const DEFAULT_PANEL_WIDTH_PX = 180
const DEFAULT_PANEL_HEIGHT_PX = 200
const MIN_PANEL_MAX_HEIGHT_PX = 120

export type TokenDropdownCoords = {
  top: number
  left: number
  maxHeight: number
}

/**
 * Keep the portaled token menu fully inside the viewport.
 * Prefers below the trigger; flips above when there isn’t enough room.
 * Clamps horizontally so right-aligned triggers (e.g. “With” row) don’t overflow.
 */
export function computeTokenDropdownCoords(
  triggerRect: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>,
  viewport: { width: number; height: number },
  panelSize?: { width: number; height: number },
): TokenDropdownCoords {
  const panelWidth = Math.max(panelSize?.width ?? DEFAULT_PANEL_WIDTH_PX, DEFAULT_PANEL_WIDTH_PX)
  const panelHeight = panelSize?.height ?? DEFAULT_PANEL_HEIGHT_PX

  let left = triggerRect.left
  if (left + panelWidth > viewport.width - VIEWPORT_EDGE_PAD_PX) {
    left = triggerRect.right - panelWidth
  }
  left = Math.min(
    Math.max(VIEWPORT_EDGE_PAD_PX, left),
    Math.max(VIEWPORT_EDGE_PAD_PX, viewport.width - VIEWPORT_EDGE_PAD_PX - panelWidth),
  )

  const spaceBelow = viewport.height - triggerRect.bottom - PANEL_GAP_PX - VIEWPORT_EDGE_PAD_PX
  const spaceAbove = triggerRect.top - PANEL_GAP_PX - VIEWPORT_EDGE_PAD_PX
  const placeBelow =
    spaceBelow >= Math.min(panelHeight, MIN_PANEL_MAX_HEIGHT_PX) || spaceBelow >= spaceAbove

  if (placeBelow) {
    return {
      top: triggerRect.bottom + PANEL_GAP_PX,
      left,
      maxHeight: Math.max(MIN_PANEL_MAX_HEIGHT_PX, spaceBelow),
    }
  }

  const maxHeight = Math.max(MIN_PANEL_MAX_HEIGHT_PX, spaceAbove)
  const visibleHeight = Math.min(panelHeight, maxHeight)
  return {
    top: Math.max(VIEWPORT_EDGE_PAD_PX, triggerRect.top - PANEL_GAP_PX - visibleHeight),
    left,
    maxHeight,
  }
}
