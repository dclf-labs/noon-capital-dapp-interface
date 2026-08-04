import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type FamilyPanel = {
  id: string
  node: ReactNode
}

type KeepMountedFamilyStackProps = {
  activeId: string
  panels: FamilyPanel[]
}

/**
 * Keep every chain-family tree mounted and stacked in one grid cell.
 * Inactive panels stay `invisible` (not unmounted / not `display:none`) so
 * network switches update values in place without a remount flash — same goal
 * as in-family form updates, with cross-family keep-alive on top.
 */
export function KeepMountedFamilyStack({ activeId, panels }: KeepMountedFamilyStackProps) {
  return (
    <div className="grid w-full justify-items-center [grid-template-areas:'stack']">
      {panels.map((panel) => {
        const active = panel.id === activeId
        return (
          <div
            key={panel.id}
            className={cn(
              'flex w-full justify-center [grid-area:stack]',
              !active && 'pointer-events-none invisible',
            )}
            aria-hidden={!active}
          >
            {panel.node}
          </div>
        )
      })}
    </div>
  )
}
