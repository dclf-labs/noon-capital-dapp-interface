import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { ChevronDownIcon } from '@/assets/icons'
import { SHELL_SELECTION_CLOSE_MS, SHELL_SELECTION_SPRING } from '@/components/shell/constants'
import type { Token } from '@/config/token'
import { tokenIconSrc, tokenOptionKey } from '@/lib/token-icon'
import { cn } from '@/lib/utils'
import {
  computeTokenDropdownCoords,
  type TokenDropdownCoords,
} from '@/mock/buy/token-dropdown-panel'

const MENU_Z = 400
const PANEL_EASE = [0.22, 1, 0.36, 1] as const

type TokenDropdownProps = {
  token?: Token
  tokens?: Token[]
  onChange?: (token: Token) => void
  size?: 'lg' | 'sm'
  label: string
}

function TokenGlyph({
  token,
  size,
  selected = false,
}: {
  token?: Token
  size: 'lg' | 'sm'
  selected?: boolean
}) {
  const px = size === 'lg' ? 32 : 22
  return (
    <span
      className={cn(
        'relative z-10 shrink-0 overflow-hidden',
        // Buy-token trigger (lg, under the amount) is circular; everywhere else stays rounded-square.
        size === 'lg' ? 'size-8 rounded-full' : 'size-[22px] rounded-md',
        selected ? 'bg-white/10' : 'bg-stone-200',
      )}
    >
      <img
        src={tokenIconSrc(token)}
        alt=""
        width={px}
        height={px}
        className="size-full object-cover"
      />
    </span>
  )
}

/** Compact token picker — selection pill matches shell network / nav animation. */
export function TokenDropdown({
  token,
  tokens = [],
  onChange,
  size = 'lg',
  label,
}: TokenDropdownProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<TokenDropdownCoords | null>(null)
  /** Optimistic selection so the pill can animate before the parent re-renders. */
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const options = tokens.filter((t) => t.contractAddress && t.symbol && t.decimals != null)
  const selectedKey = pendingKey ?? (token ? tokenOptionKey(token) : null)

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
      setPendingKey(null)
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
      const panelRect = panelRef.current?.getBoundingClientRect()
      setCoords(
        computeTokenDropdownCoords(
          triggerRect,
          { width: window.innerWidth, height: window.innerHeight },
          panelRect ? { width: panelRect.width, height: panelRect.height } : undefined,
        ),
      )
    }

    update()
    // Remeasure after paint so max-height / content size are accurate.
    const raf = window.requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      clearCloseTimer()
      setOpen(false)
      setPendingKey(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearCloseTimer()
        setOpen(false)
        setPendingKey(null)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const panel =
    typeof document !== 'undefined' && coords ? (
      <AnimatePresence onExitComplete={() => setCoords(null)}>
        {open ? (
          <motion.div
            ref={panelRef}
            id={menuId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.24, ease: PANEL_EASE }}
            className={cn(
              'fixed flex min-w-[180px] flex-col overflow-y-auto overscroll-contain p-1',
              'rounded-xl border border-stone-200 bg-white shadow-lg',
            )}
            style={{
              top: coords.top,
              left: coords.left,
              maxHeight: coords.maxHeight,
              zIndex: MENU_Z,
            }}
          >
            {options.length ? (
              options.map((option) => {
                const optionKey = tokenOptionKey(option)
                const selected = selectedKey === optionKey
                return (
                  <button
                    key={optionKey}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setPendingKey(optionKey)
                      onChange?.(option)
                      scheduleClose()
                    }}
                    className={cn(
                      'relative flex h-10 w-full shrink-0 items-center gap-2 rounded-lg px-2 text-left transition-colors',
                      'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                      selected
                        ? 'text-white'
                        : 'text-stone-700 hover:text-primary focus-visible:text-primary',
                    )}
                  >
                    {selected ? (
                      <motion.div
                        layoutId={`token-dropdown-bg-${menuId}`}
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={SHELL_SELECTION_SPRING}
                      />
                    ) : null}
                    <TokenGlyph token={option} size="sm" selected={selected} />
                    <span className="relative z-10 truncate text-sm leading-5 font-book">
                      {option.symbol}
                    </span>
                  </button>
                )
              })
            ) : (
              <p className="max-w-[220px] px-2 py-2 text-sm text-stone-500">
                No tokens found. Try switching networks.
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          clearCloseTimer()
          setPendingKey(null)
          setOpen((value) => !value)
        }}
        className={cn(
          'flex items-center text-stone-500 transition-colors hover:text-primary',
          'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
          open && 'text-primary',
          size === 'lg'
            ? 'gap-2 rounded-full bg-stone-100 py-1.5 pr-2.5 pl-2 text-sm leading-5 font-book'
            : 'gap-1 rounded-lg bg-stone-100 px-2 py-1 text-base leading-6 font-medium text-stone-600',
        )}
      >
        <TokenGlyph token={token} size={size} />
        <span>{token?.symbol || 'Select'}</span>
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
