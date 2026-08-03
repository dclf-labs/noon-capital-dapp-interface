import { useEffect, useId, useRef } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { CloseIcon } from '@/assets/icons'
import { ConnectWalletButton } from '@/components/shell/ConnectWalletButton'
import {
  APY_TIP,
  SHELL_SELECTION_CLOSE_MS,
  SHELL_SELECTION_SPRING,
} from '@/components/shell/constants'
import { NetworkSelector } from '@/components/shell/NetworkSelector'
import type { ShellNavItem } from '@/components/shell/types'
import { WalletAvatarButton } from '@/components/shell/WalletAvatarButton'
import { InfoTipIcon } from '@/components/ui/info-tip-icon'
import { cn } from '@/lib/utils'

type MobileNavDrawerProps = {
  open: boolean
  onClose: () => void
  navItems: ShellNavItem[]
  apy: string
  tvl: string
  isConnected?: boolean
  walletLabel?: string
  onConnectClick?: () => void
}

/**
 * Mobile / tablet menu — Figma “Side Bar Opened”.
 * Connect wallet / connected account sit at the bottom of the card.
 */
export function MobileNavDrawer({
  open,
  onClose,
  navItems,
  apy,
  tvl,
  isConnected = false,
  walletLabel,
  onConnectClick,
}: MobileNavDrawerProps) {
  const titleId = useId()
  const navBgId = useId()
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  /** Let the selection pill spring settle, then dismiss the drawer. */
  const closeAfterSelection = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      onClose()
    }, SHELL_SELECTION_CLOSE_MS)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  useEffect(() => {
    if (!open) {
      clearCloseTimer()
      return
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearCloseTimer()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute top-[13px] right-[9px] left-[9px] flex flex-col gap-3 rounded-lg border border-[#d4d1cf] p-3',
              'bg-white/95 shadow-[0_12px_40px_rgba(17,17,17,0.08)] backdrop-blur-[11.7px]',
            )}
          >
            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className={cn(
                  'flex shrink-0 items-center rounded-[5px] border border-stone-200 bg-white p-2 text-primary',
                  'shadow-[0_2.67px_1.33px_rgba(111,125,185,0.05)]',
                  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                )}
              >
                <CloseIcon width={16} height={16} className="size-4" aria-hidden />
              </button>

              <div className="min-w-0 flex-1">
                <img
                  id={titleId}
                  src="/assets/shell/sidebar-logo-open.svg"
                  alt="NOON"
                  width={68}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <div className="flex flex-col items-start justify-center">
                  <div className="mb-[-2px] flex items-center gap-0.5">
                    <span className="text-xs leading-[18px] font-book text-stone-500">APY</span>
                    <InfoTipIcon content={APY_TIP} label="About APY" size={16} />
                  </div>
                  <p className="font-denton text-base leading-5 text-black">{apy}</p>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="mb-[-2px] text-xs leading-[18px] font-book text-stone-500">
                    TVL
                  </span>
                  <p className="font-denton text-base leading-5 text-black">{tvl}</p>
                </div>
              </div>

              <div className="mx-1 h-10 w-px shrink-0 bg-[#d4d1cf]" aria-hidden />

              <NetworkSelector />
            </div>

            <nav className="flex w-full flex-col gap-2" aria-label="Primary">
              {navItems.map((item) => {
                const Icon = item.icon
                const enabled = item.enabled !== false
                const active = Boolean(item.active)

                const classNames = cn(
                  'relative flex h-10 w-full items-center gap-1 rounded-lg pr-3 pl-2 transition-colors',
                  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                  active
                    ? 'text-white'
                    : enabled
                      ? 'text-[#111] hover:text-primary'
                      : 'cursor-not-allowed text-[#111] opacity-50',
                )

                const content = (
                  <>
                    {active ? (
                      <motion.div
                        layoutId={`mobile-nav-bg-${navBgId}`}
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={SHELL_SELECTION_SPRING}
                      />
                    ) : null}
                    <span className="relative z-10 flex min-w-0 items-center gap-1">
                      <Icon width={24} height={24} className="size-6 shrink-0" aria-hidden />
                      <span className="text-base leading-6 font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    </span>
                  </>
                )

                if (!enabled) {
                  return (
                    <span
                      key={item.id}
                      title={`${item.label} — coming soon`}
                      aria-disabled="true"
                      className={classNames}
                    >
                      {content}
                    </span>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    title={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={classNames}
                    onClick={closeAfterSelection}
                  >
                    {content}
                  </Link>
                )
              })}
            </nav>

            {/* Figma: wallet CTA pinned to the bottom of the menu card. */}
            {isConnected ? (
              <WalletAvatarButton
                size="md"
                showLabel
                label={walletLabel}
                onClick={() => {
                  onConnectClick?.()
                  onClose()
                }}
                className="h-12 w-full justify-center rounded-lg py-3"
              />
            ) : (
              <ConnectWalletButton
                fullWidth
                onClick={() => {
                  onConnectClick?.()
                  onClose()
                }}
              />
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
