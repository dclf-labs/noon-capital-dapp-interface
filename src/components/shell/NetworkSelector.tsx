import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { ChevronDownIcon } from '@/assets/icons'
import {
  LIST_OPTION_ACTIVE,
  LIST_OPTION_ACTIVE_PILL,
  LIST_OPTION_IDLE,
  LIST_OPTION_STACK,
  NETWORK_SELECTOR_Z_INDEX,
  SHELL_SELECTION_CLOSE_MS,
  SHELL_SELECTION_SPRING,
} from '@/components/shell/constants'
import { chainIconSrc, NETWORK_OPTIONS } from '@/components/shell/network'
import { computeNetworkPanelCoords, isHeaderNetworkChainId } from '@/components/shell/network-panel'
import { useSelectActiveChain } from '@/hooks/connection'
import { cn } from '@/lib/utils'

const chip = 'flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Header network dropdown — panel is portaled to `document.body` so it stacks
 * above shell chrome and below modals (see `NETWORK_SELECTOR_Z_INDEX`).
 */
export function NetworkSelector() {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<ReturnType<typeof computeNetworkPanelCoords> | null>(null)
  const { selectedChainId, selectActiveChain, isSwitchingEvmNetwork } = useSelectActiveChain()

  const activeIconSrc = chainIconSrc(selectedChainId)
  const activeNetwork = NETWORK_OPTIONS.find(
    (network) => Number(network.chainId) === Number(selectedChainId),
  )

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const trigger = rootRef.current
      if (!trigger) return
      setCoords(computeNetworkPanelCoords(trigger.getBoundingClientRect(), window.innerWidth))
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectNetwork = (chainId: (typeof NETWORK_OPTIONS)[number]['chainId']) => {
    if (!isHeaderNetworkChainId(chainId, NETWORK_OPTIONS)) return
    void selectActiveChain(chainId)
    if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, SHELL_SELECTION_CLOSE_MS)
  }

  const panel =
    typeof document !== 'undefined' && coords ? (
      <AnimatePresence onExitComplete={() => setCoords(null)}>
        {open ? (
          <motion.div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label="Networks"
            // `round 12px` matches `rounded-xl` so clip-path doesn’t square the shadow.
            initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0 round 12px)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 round 12px)' }}
            exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0 round 12px)' }}
            transition={{ duration: 0.24, ease: PANEL_EASE }}
            style={{
              position: 'fixed',
              top: coords.top,
              right: coords.right,
              zIndex: NETWORK_SELECTOR_Z_INDEX,
            }}
            className={cn(
              'max-h-[min(420px,70dvh)] w-[220px] overflow-y-auto',
              LIST_OPTION_STACK,
              'rounded-xl border border-stone-200 bg-white shadow-lg',
            )}
          >
            {NETWORK_OPTIONS.map((network) => {
              const selected = Number(network.chainId) === Number(selectedChainId)
              return (
                <button
                  key={network.key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => selectNetwork(network.chainId)}
                  className={cn(
                    'relative flex h-10 w-full items-center gap-2 rounded-lg px-2',
                    'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                    selected ? LIST_OPTION_ACTIVE : LIST_OPTION_IDLE,
                  )}
                >
                  {selected ? (
                    <motion.div
                      layoutId={`network-selector-bg-${menuId}`}
                      className={LIST_OPTION_ACTIVE_PILL}
                      transition={SHELL_SELECTION_SPRING}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 size-5 shrink-0 overflow-hidden rounded-md',
                      selected ? 'bg-white/10' : 'bg-stone-100',
                    )}
                  >
                    <img
                      src={network.iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      className="size-full object-cover"
                    />
                  </span>
                  <span className="relative z-10 truncate text-sm leading-5 font-book">
                    {network.name}
                  </span>
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          chip,
          'group h-10 py-2 pr-2 pl-2 text-stone-500 transition-colors hover:text-primary focus-visible:text-primary',
          open && 'text-primary',
        )}
        aria-label={
          activeNetwork ? `Network: ${activeNetwork.name}. Change network` : 'Select network'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={isSwitchingEvmNetwork}
      >
        <span className="size-6 shrink-0 overflow-hidden rounded-[5px] bg-stone-100">
          <img
            src={activeIconSrc}
            alt=""
            width={24}
            height={24}
            className="size-full object-cover"
          />
        </span>
        <ChevronDownIcon
          width={20}
          height={20}
          className={cn(
            'size-5 shrink-0 transition-transform duration-200 ease-out',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
