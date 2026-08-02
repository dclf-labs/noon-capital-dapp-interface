import { useEffect, useId, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { ChevronDownIcon } from '@/assets/icons'
import { SHELL_SELECTION_SPRING } from '@/components/shell/constants'
import { chainIconSrc, NETWORK_OPTIONS } from '@/components/shell/network'
import { useSelectActiveChain } from '@/hooks/connection'
import { cn } from '@/lib/utils'

const chip = 'flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Header network dropdown — panel chrome matches the sidebar card;
 * row icon/text sizes match the trigger (24px icon, base/medium label).
 */
export function NetworkSelector() {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const { selectedChainId, selectActiveChain, isSwitchingEvmNetwork } = useSelectActiveChain()

  const activeIconSrc = chainIconSrc(selectedChainId)
  const activeNetwork = NETWORK_OPTIONS.find(
    (network) => Number(network.chainId) === Number(selectedChainId),
  )

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
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

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Networks"
            initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.24, ease: PANEL_EASE }}
            className={cn(
              // Same card chrome as the sidebar panel.
              'absolute top-[calc(100%+8px)] right-0 z-50 flex max-h-[min(420px,70dvh)] w-[220px]',
              'flex-col gap-1 overflow-y-auto rounded-lg border border-[#d4d1cf] bg-white p-[12px]',
              'shadow-[0_12px_40px_rgba(17,17,17,0.08)]',
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
                  onClick={() => {
                    void selectActiveChain(network.chainId)
                    // Keep the menu open briefly so the selection pill can slide.
                    window.setTimeout(() => setOpen(false), 260)
                  }}
                  className={cn(
                    // Sidebar nav row shape; icon/text sizes match the trigger.
                    'relative flex h-10 w-full items-center gap-1.5 rounded-lg pr-3 pl-2 transition-colors',
                    'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                    selected
                      ? 'text-white'
                      : 'text-stone-500 hover:text-primary focus-visible:text-primary',
                  )}
                >
                  {selected ? (
                    <motion.div
                      layoutId={`network-selector-bg-${menuId}`}
                      className="absolute inset-0 rounded-lg bg-primary"
                      transition={SHELL_SELECTION_SPRING}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 size-6 shrink-0 overflow-hidden rounded-[5px]',
                      selected ? 'bg-white/10' : 'bg-stone-100',
                    )}
                  >
                    <img
                      src={network.iconSrc}
                      alt=""
                      width={24}
                      height={24}
                      className="size-full object-cover"
                    />
                  </span>
                  <span className="relative z-10 truncate text-base leading-6 font-medium">
                    {network.name}
                  </span>
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
