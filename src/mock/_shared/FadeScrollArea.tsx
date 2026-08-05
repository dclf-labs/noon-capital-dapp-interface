import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react'

import { ChevronDownIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'

type FadeScrollAreaProps = {
  children: ReactNode
  /** Fixed viewport height (default matches withdraw list). */
  heightPx?: number
  className?: string
  /** Accessible name for the scroll region. */
  'aria-label'?: string
}

type ScrollEdges = {
  canScrollUp: boolean
  canScrollDown: boolean
}

/**
 * Fixed-height vertical scroll region.
 *
 * Overflow cues (no blur): soft panel-matching fades, a thin scrollbar, and a
 * small chevron when more content sits below the fold.
 */
export function FadeScrollArea({
  children,
  heightPx = 666,
  className,
  'aria-label': ariaLabel = 'Scrollable content',
}: FadeScrollAreaProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState<ScrollEdges>({ canScrollUp: false, canScrollDown: false })

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const maxScroll = scrollHeight - clientHeight
    setEdges({
      canScrollUp: scrollTop > 1,
      canScrollDown: maxScroll > 1 && scrollTop < maxScroll - 1,
    })
  }, [])

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    updateEdges()

    const onScroll = () => updateEdges()
    el.addEventListener('scroll', onScroll, { passive: true })

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateEdges()) : null
    resizeObserver?.observe(el)
    const inner = el.firstElementChild
    if (inner) resizeObserver?.observe(inner)

    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObserver?.disconnect()
    }
  }, [updateEdges])

  const hasOverflow = edges.canScrollUp || edges.canScrollDown

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        // Soft inset when the list overflows — reads as a clipped viewport.
        hasOverflow &&
          'shadow-[inset_0_1px_0_rgba(28,25,23,0.04),inset_0_-1px_0_rgba(28,25,23,0.04)]',
        className,
      )}
      style={{ height: heightPx, maxHeight: `min(${heightPx}px, 70dvh)` }}
    >
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={cn(
          'h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain',
          '[scrollbar-gutter:stable]',
          // Thin vertical scrollbar — primary, always-legible affordance.
          '[&::-webkit-scrollbar]:w-1.5',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-stone-300/80',
          '[&::-webkit-scrollbar-thumb:hover]:bg-stone-400',
          '[scrollbar-width:thin]',
          '[scrollbar-color:rgb(214_211_209_/_0.9)_transparent]',
        )}
      >
        {/* Extra bottom padding so the last row clears the fade + chevron. */}
        <div className={cn(edges.canScrollDown && 'pb-8')}>{children}</div>
      </div>

      {/* Top: content dissolves into the panel — only when scrolled past the start. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-10',
          'bg-gradient-to-b from-white from-20% to-transparent',
          'transition-opacity duration-200 ease-out',
          edges.canScrollUp ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Bottom: dissolve + chevron = clear “more below” cue without blur. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-14 flex-col items-center justify-end gap-0.5',
          'bg-gradient-to-t from-white from-40% via-white/90 to-transparent',
          'transition-opacity duration-200 ease-out',
          edges.canScrollDown ? 'opacity-100' : 'opacity-0',
        )}
      >
        <ChevronDownIcon width={16} height={16} className="mb-1.5 size-4 text-stone-400" />
      </div>
    </div>
  )
}
