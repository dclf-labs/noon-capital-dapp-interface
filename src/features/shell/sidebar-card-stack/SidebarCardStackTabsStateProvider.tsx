import { useState } from 'react'

import type {
  SidebarCardStackTabsItem,
  SidebarCardStackTabsProps,
} from '@/features/shell/sidebar-card-stack/context'
import { SidebarCardStackTabsStateProviderContext } from '@/features/shell/sidebar-card-stack/context'

export function SidebarCardStackTabsStateProvider({
  children,
  ...props
}: SidebarCardStackTabsProps) {
  const [activeCardId, setActiveCardId] = useState<SidebarCardStackTabsItem>('tvl')

  return (
    <SidebarCardStackTabsStateProviderContext.Provider
      {...props}
      value={{
        activeCardId,
        setActiveCardId: setActiveCardId,
      }}
    >
      {children}
    </SidebarCardStackTabsStateProviderContext.Provider>
  )
}

export default SidebarCardStackTabsStateProvider
