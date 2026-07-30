import { useMemo, useState } from 'react'

import SuiWalletSelector from '@/components/SuiWalletSelector'
import {
  SuiWalletSelectorContext,
  type SuiWalletSelectorProviderProps,
} from '@/features/shell/sui-wallet-selector/context'

export const SuiWalletSelectorProvider = ({ children }: SuiWalletSelectorProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((open) => !open)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  const value = useMemo(() => ({ isOpen, onOpen, onClose, onToggle, onOpenChange }), [isOpen])

  return (
    <SuiWalletSelectorContext.Provider value={value}>
      {children}
      <SuiWalletSelector isOpen={isOpen} onOpenChange={onOpenChange} />
    </SuiWalletSelectorContext.Provider>
  )
}

export default SuiWalletSelectorProvider
