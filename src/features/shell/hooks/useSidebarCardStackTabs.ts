import { useContext } from 'react'

import { SidebarCardStackTabsStateProviderContext } from '@/features/shell/sidebar-card-stack/context'

const useSidebarCardStackTabs = () => {
  const context = useContext(SidebarCardStackTabsStateProviderContext)

  if (!context) {
    throw new Error('No desktop sidebar stack card tab context provider')
  }

  return context
}

export default useSidebarCardStackTabs
