import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { SHELL_SELECTION_CLOSE_MS, SHELL_SELECTION_SPRING } from '@/components/shell/constants'
import { chainIconSrc } from '@/components/shell/network'
import { cn } from '@/lib/utils'
import type { BridgeNetworkOption } from '@/mock/bridge/types'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

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
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  /** Optimistic selection so the pill can animate before the parent re-renders. */
  const [pendingId, setPendingId] = useState<number | null>(null)

  const selected = networks.find((n) => n.id === value)
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

  useEffect(() => {
    if (!open || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    setCoords({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 200) })
  }, [open])

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
          'flex min-w-0 flex-1 items-center gap-2 p-4',
          'ring-0 outline-none focus:outline-none focus-visible:ring-0',
          (disabled || networks.length === 0) && 'cursor-not-allowed opacity-50',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
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
            <AnimatePresence>
              {open && coords ? (
                <motion.div
                  ref={panelRef}
                  id={menuId}
                  role="listbox"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: PANEL_EASE }}
                  style={{ top: coords.top, left: coords.left, width: coords.width }}
                  className="fixed z-[400] max-h-64 overflow-auto rounded-xl border border-stone-200 bg-white p-1 shadow-lg"
                >
                  {networks.map((network) => {
                    const active = network.id === activeId
                    return (
                      <button
                        key={network.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setPendingId(network.id)
                          onChange(network.id)
                          scheduleClose()
                        }}
                        className={cn(
                          'relative flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left',
                          'text-sm leading-5 font-book',
                          'ring-0 outline-none focus:outline-none focus-visible:ring-0',
                          active
                            ? 'text-white'
                            : 'text-stone-700 hover:text-primary focus-visible:text-primary',
                        )}
                      >
                        {active ? (
                          <motion.div
                            layoutId={`bridge-network-picker-bg-${menuId}`}
                            className="absolute inset-0 rounded-lg bg-primary"
                            transition={SHELL_SELECTION_SPRING}
                          />
                        ) : null}
                        <span className="relative z-10 size-5 shrink-0 overflow-hidden rounded-md bg-stone-100">
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
