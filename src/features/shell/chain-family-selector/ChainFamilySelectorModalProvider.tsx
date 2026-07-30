import { useEffect, useMemo, useRef, useState } from 'react'

import type { ChainFamily } from '@/chains'
import ChainFamilySelectorModal from '@/components/ChainFamilySelectorModal'
import {
  ChainFamilySelectorModalContext,
  type ChainFamilySelectorModalProviderProps,
} from '@/features/shell/chain-family-selector/context'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

type PendingConnect = {
  family: ChainFamily
  /** Monotonic id so selecting the same family twice still retriggers. */
  id: number
}

/**
 * Effect-only bridge for Starknet / Sui after the family picker closes.
 * EVM opens AppKit inside the modal click handler (user-gesture safe) and never
 * becomes `pending`.
 */
function PendingWalletConnectEffect({ pending }: { pending: PendingConnect | null }) {
  const connectWalletFamily = useConnectWalletFamily()

  useEffect(() => {
    if (!pending) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      void connectWalletFamily(pending.family).catch((error) => {
        if (!cancelled) {
          console.error(`[wallet] failed to open ${pending.family} connect UI`, error)
        }
      })
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // Only re-run when the user picks a network (pending id/family), not when the
    // connect function identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [pending])

  return null
}

export const ChainFamilySelectorModalProvider = ({
  children,
}: ChainFamilySelectorModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [pending, setPending] = useState<PendingConnect | null>(null)
  const pendingId = useRef(0)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((open) => !open)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  const value = useMemo(() => ({ isOpen, onOpen, onClose, onToggle, onOpenChange }), [isOpen])

  function handleSelect(family: ChainFamily) {
    pendingId.current += 1
    setPending({ family, id: pendingId.current })
  }

  return (
    <ChainFamilySelectorModalContext.Provider value={value}>
      {children}
      <PendingWalletConnectEffect pending={pending} />
      <ChainFamilySelectorModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSelect={handleSelect}
      />
    </ChainFamilySelectorModalContext.Provider>
  )
}

export default ChainFamilySelectorModalProvider
