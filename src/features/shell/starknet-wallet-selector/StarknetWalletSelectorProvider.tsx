import { useMemo, useState } from 'react'

import StarknetWalletSelector from '@/components/StarknetWalletSelector/StarknetWalletSelector'
import {
  StarknetWalletSelectorContext,
  type StarknetWalletSelectorProviderProps,
} from '@/features/shell/starknet-wallet-selector/context'

export const StarknetWalletSelectorProvider = ({
  children,
}: StarknetWalletSelectorProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((open) => !open)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  const value = useMemo(() => ({ isOpen, onOpen, onClose, onToggle, onOpenChange }), [isOpen])

  return (
    <StarknetWalletSelectorContext.Provider value={value}>
      {children}
      <StarknetWalletSelector isOpen={isOpen} onOpenChange={onOpenChange} />
    </StarknetWalletSelectorContext.Provider>
  )
}

export default StarknetWalletSelectorProvider
