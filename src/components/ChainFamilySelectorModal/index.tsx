import { useId } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import type { ChainFamily } from '@/chains'
import {
  LIST_OPTION_ACTIVE,
  LIST_OPTION_ACTIVE_PILL,
  LIST_OPTION_IDLE,
  MODAL_BACKDROP_CLASS,
  MODAL_PANEL_TRANSITION,
  SHELL_SELECTION_SPRING,
} from '@/components/shell/constants'
import { useResolvedChain } from '@/hooks/connection'
import { cn } from '@/lib/utils'
import { openEvmAppKit } from '@/wallet/evm/open-appkit'

const CHAIN_FAMILY_OPTIONS: ReadonlyArray<{
  family: ChainFamily
  title: string
  description: string
}> = [
  {
    family: 'evm',
    title: 'Ethereum (EVM)',
    description: 'Ethereum, Base, zkSync, and other EVM chains',
  },
  {
    family: 'starknet',
    title: 'Starknet',
    description: 'Argent, Braavos, and other Starknet wallets',
  },
  {
    family: 'sui',
    title: 'Sui',
    description: 'Sui Wallet, Slush, and other Sui wallets',
  },
]

/**
 * Chain-family picker shown before a wallet connect UI.
 * EVM opens AppKit directly in the click handler (user-gesture safe).
 * Starknet / Sui are handed to `onSelect` for hook-based connect UIs.
 * Active family uses the same black selection pill as shell dropdowns / menubar.
 */
export default function ChainFamilySelectorModal({
  isOpen = false,
  onOpenChange,
  onSelect,
}: {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (family: ChainFamily) => void
}) {
  const listBgId = useId()
  const titleId = useId()
  const { chainFamily: activeFamily } = useResolvedChain()

  function close() {
    onOpenChange?.(false)
  }

  async function selectFamily(family: ChainFamily) {
    // Dismiss our overlay first so it cannot cover AppKit (z-index 1000).
    // Then open AppKit in the same click-handler task (no useEffect deferral).
    if (family === 'evm') {
      close()
      try {
        await openEvmAppKit()
      } catch (error) {
        console.error('[wallet] failed to open EVM AppKit', error)
      }
      return
    }

    close()
    onSelect?.(family)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="chain-family-selector"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={MODAL_PANEL_TRANSITION}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close()
          }}
        >
          <button
            type="button"
            aria-label="Close"
            className={MODAL_BACKDROP_CLASS}
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={MODAL_PANEL_TRANSITION}
            className={cn(
              'relative z-10 grid w-full max-w-[420px] gap-3 overflow-hidden',
              'rounded-xl border border-stone-200 bg-white p-5 text-stone-900',
              'shadow-[0_16px_48px_rgba(0,0,0,0.2)]',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-1">
              <h2 id={titleId} className="m-0 text-lg leading-7 font-medium text-stone-900">
                Choose a network
              </h2>
              <p className="m-0 text-sm leading-5 text-stone-500">
                Select which network to connect, then pick a wallet.
              </p>
            </div>

            <div className="grid gap-1">
              {CHAIN_FAMILY_OPTIONS.map((option) => {
                const selected = option.family === activeFamily
                return (
                  <button
                    key={option.family}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => void selectFamily(option.family)}
                    className={cn(
                      'relative grid gap-0.5 rounded-lg px-3.5 py-3 text-left',
                      selected ? LIST_OPTION_ACTIVE : LIST_OPTION_IDLE,
                    )}
                  >
                    {selected ? (
                      <motion.div
                        layoutId={`chain-family-selector-bg-${listBgId}`}
                        className={LIST_OPTION_ACTIVE_PILL}
                        transition={SHELL_SELECTION_SPRING}
                      />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-10 font-semibold',
                        selected ? 'text-white' : 'text-stone-900',
                      )}
                    >
                      {option.title}
                    </span>
                    <span
                      className={cn(
                        'relative z-10 text-[13px]',
                        selected ? 'text-white/75' : 'text-stone-500',
                      )}
                    >
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={close}
              className={cn('justify-self-end rounded-lg px-3 py-2', LIST_OPTION_IDLE)}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
