import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { SHELL_SELECTION_CLOSE_MS, SHELL_SELECTION_SPRING } from '@/components/shell/constants'
import { chainIconSrc } from '@/components/shell/network'
import { getChainConfig } from '@/lib/chain'
import { cn } from '@/lib/utils'
import type { BridgeNetworkOption } from '@/mock/bridge/types'
import {
  computeTokenDropdownCoords,
  type TokenDropdownCoords,
} from '@/mock/buy/token-dropdown-panel'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const
const MENU_Z = 400

type BridgeNetworkPickerProps = {
  label: string
  networks: BridgeNetworkOption[]
  value?: number
  placeholder?: string
  onChange: (chainId: number) => void
  disabled?: boolean
}

/** Sending / Receiving network trigger — compact dropdown used in the bridge card header. */
export function BridgeNetworkPicker({
  label,
  networks,
  value,
  placeholder = 'Select',
  onChange,
  disabled = false,
}: BridgeNetworkPickerProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<(TokenDropdownCoords & { width: number }) | null>(null)
  /** Optimistic selection so the pill can animate before the parent re-renders. */
  const [pendingId, setPendingId] = useState<number | null>(null)

  // Keep showing the selected chain even if it's briefly absent from `networks`
  // (e.g. mid-flip while source/dest filters catch up).
  const selected =
    networks.find((n) => n.id === value) ??
    (value != null ? { id: value, name: getChainConfig(value).name } : undefined)
  const activeId = pendingId ?? value

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
      setPendingId(null)
    }, SHELL_SELECTION_CLOSE_MS)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const trigger = rootRef.current
      if (!trigger) return
      const triggerRect = trigger.getBoundingClientRect()
      const width = Math.max(triggerRect.width, 200)
      const panelRect = panelRef.current?.getBoundingClientRect()
      const next = computeTokenDropdownCoords(
        triggerRect,
        { width: window.innerWidth, height: window.innerHeight },
        panelRect
          ? { width, height: panelRect.height }
          : { width, height: Math.min(networks.length * 40 + 8, 360) },
      )
      setCoords({ ...next, width })
    }

    update()
    const raf = window.requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, networks.length])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      clearCloseTimer()
      setOpen(false)
      setPendingId(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearCloseTimer()
        setOpen(false)
        setPendingId(null)
      }
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={rootRef}
        type="button"
        disabled={disabled || networks.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          clearCloseTimer()
          setPendingId(null)
          setOpen((prev) => !prev)
        }}
        className={cn(
          'flex w-full min-w-0 items-center justify-between gap-2 p-4',
          'ring-0 outline-none focus:outline-none focus-visible:ring-0',
          (disabled || networks.length === 0) && 'cursor-not-allowed opacity-50',
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-stone-200">
            {selected ? (
              <img
                src={chainIconSrc(selected.id)}
                alt=""
                width={32}
                height={32}
                className="size-full object-cover"
              />
            ) : null}
          </span>
          <span className="flex min-w-0 flex-col items-start">
            <span className="text-xs leading-4 font-book text-stone-400 uppercase">{label}</span>
            <span className="truncate text-base leading-6 font-book text-stone-900">
              {selected?.name ?? placeholder}
            </span>
          </span>
        </div>
        <img
          src="/assets/shell/chevron-down.svg"
          alt=""
          width={24}
          height={24}
          className={cn('size-6 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence onExitComplete={() => setCoords(null)}>
              {open && coords ? (
                <motion.div
                  ref={panelRef}
                  id={menuId}
                  role="listbox"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: PANEL_EASE }}
                  style={{
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    maxHeight: coords.maxHeight,
                    zIndex: MENU_Z,
                  }}
                  className="fixed overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white p-1 shadow-lg"
                >
                  {networks.map((network) => {
                    const active = network.id === activeId
                    const unavailable = Boolean(network.disabled)
                    return (
                      <button
                        key={`${network.id}:${network.name}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        aria-disabled={unavailable}
                        disabled={unavailable}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          if (unavailable) return
                          setPendingId(network.id)
                          onChange(network.id)
                          scheduleClose()
                        }}
                        className={cn(
                          'relative flex h-10 w-full shrink-0 items-center gap-2 rounded-lg px-2 text-left',
                          'text-sm leading-5 font-book',
                          'ring-0 outline-none focus:outline-none focus-visible:ring-0',
                          unavailable
                            ? 'cursor-not-allowed text-stone-400'
                            : active
                              ? 'text-white'
                              : 'text-stone-700 hover:text-primary focus-visible:text-primary',
                        )}
                      >
                        {active && !unavailable ? (
                          <motion.div
                            layoutId={`bridge-network-picker-bg-${menuId}`}
                            className="absolute inset-0 rounded-lg bg-primary"
                            transition={SHELL_SELECTION_SPRING}
                          />
                        ) : null}
                        <span
                          className={cn(
                            'relative z-10 size-5 shrink-0 overflow-hidden rounded-md bg-stone-100',
                            unavailable && 'opacity-50',
                          )}
                        >
                          <img
                            src={chainIconSrc(network.id)}
                            alt=""
                            width={20}
                            height={20}
                            className="size-full object-cover"
                          />
                        </span>
                        <span className="relative z-10 truncate">{network.name}</span>
                      </button>
                    )
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  )
}
