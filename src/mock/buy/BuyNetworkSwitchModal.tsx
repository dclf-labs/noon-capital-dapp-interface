import { useCallback, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { CloseIcon } from '@/assets/icons'
import {
  LIST_OPTION_ACTIVE,
  LIST_OPTION_ACTIVE_PILL,
  LIST_OPTION_IDLE,
  MODAL_BACKDROP_CLASS,
  MODAL_CLOSE_BUTTON,
  MODAL_PANEL_TRANSITION,
  SHELL_SELECTION_CLOSE_MS,
  SHELL_SELECTION_SPRING,
} from '@/components/shell/constants'
import type { NetworkOption } from '@/components/shell/network'
import {
  BUY_SUPPORTED_NETWORK_OPTIONS,
  BUY_SUPPORTED_NETWORKS_COPY,
} from '@/features/buy/supported-networks'
import { useSelectActiveChain } from '@/hooks/connection'
import type { ChainId } from '@/lib/chain'
import { cn } from '@/lib/utils'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

type BuyNetworkSwitchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  networks?: NetworkOption[]
}

/**
 * Buy-supported network picker — same shell modal chrome as Starknet wallet /
 * Change Address (Louize title, close tile, black selection pill).
 */
export function BuyNetworkSwitchModal({
  open,
  onOpenChange,
  networks = BUY_SUPPORTED_NETWORK_OPTIONS,
}: BuyNetworkSwitchModalProps) {
  const listBgId = useId()
  const titleId = useId()
  const { selectedChainId, selectActiveChain, isSwitchingEvmNetwork } = useSelectActiveChain()

  const close = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, open])

  function selectNetwork(chainId: ChainId) {
    void selectActiveChain(chainId)
    window.setTimeout(() => {
      close()
    }, SHELL_SELECTION_CLOSE_MS)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="buy-network-switch"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={MODAL_PANEL_TRANSITION}
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
              'relative z-10 flex w-full max-w-md flex-col gap-6 overflow-hidden',
              'rounded-xl border border-stone-200 bg-white p-6',
              'shadow-[0_12px_40px_rgba(17,17,17,0.08)]',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2
                  id={titleId}
                  className="font-louize text-[28px] leading-9 tracking-[-1.4px] text-stone-900 md:text-[32px] md:leading-10 md:tracking-[-1.6px]"
                >
                  Switch network
                </h2>
                <p className="mt-1 text-sm leading-5 font-book text-stone-500">
                  {BUY_SUPPORTED_NETWORKS_COPY}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className={cn(MODAL_CLOSE_BUTTON, focusReset)}
              >
                <CloseIcon width={16} height={16} className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex w-full flex-col gap-1">
              {networks.map((network) => {
                const selected = Number(network.chainId) === Number(selectedChainId)
                return (
                  <button
                    key={network.key}
                    type="button"
                    aria-pressed={selected}
                    disabled={isSwitchingEvmNetwork}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectNetwork(network.chainId)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left',
                      focusReset,
                      selected ? LIST_OPTION_ACTIVE : LIST_OPTION_IDLE,
                      isSwitchingEvmNetwork && 'cursor-wait opacity-80',
                    )}
                  >
                    {selected ? (
                      <motion.div
                        layoutId={`buy-network-switch-bg-${listBgId}`}
                        className={LIST_OPTION_ACTIVE_PILL}
                        transition={SHELL_SELECTION_SPRING}
                      />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-10 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md',
                        selected ? 'bg-white/10' : 'bg-stone-100',
                      )}
                    >
                      <img
                        src={network.iconSrc}
                        alt=""
                        width={32}
                        height={32}
                        className="size-full object-cover"
                        draggable={false}
                      />
                    </span>
                    <span className="relative z-10 min-w-0 flex-1 truncate text-base leading-6 font-medium">
                      {network.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
