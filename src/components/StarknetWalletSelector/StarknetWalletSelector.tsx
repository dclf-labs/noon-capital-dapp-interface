import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { type Connector, useAccount, useConnect } from '@starknet-react/core'
import { AnimatePresence, motion } from 'motion/react'

import { CloseIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const
const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

/** Official brand marks — starknet-react still ships the old Argent wings for Ready. */
const WALLET_ICON_BY_ID: Record<string, string> = {
  argentX: '/assets/wallets/ready.png',
  ready: '/assets/wallets/ready.png',
}

function connectorIconSrc(
  connectorId: string | undefined,
  icon: Connector['icon'] | undefined,
): string {
  if (connectorId && WALLET_ICON_BY_ID[connectorId]) {
    return WALLET_ICON_BY_ID[connectorId]
  }
  if (!icon) return '/assets/chains/starknet.svg'
  if (typeof icon === 'string') return icon
  return icon.light || icon.dark || '/assets/chains/starknet.svg'
}

type StarknetWalletSelectorProps = {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Branded Starknet wallet picker — same role as old-dapp `StarknetWalletSelector`,
 * restyled for the Noon Capital shell (Louize title, stone borders, indigo accents).
 */
export function StarknetWalletSelector({
  isOpen = false,
  onOpenChange,
}: StarknetWalletSelectorProps) {
  const titleId = useId()
  const attemptedConnect = useRef(false)
  const { connector: connectedConnector, isConnected } = useAccount()
  const { connect, connectors, isPending, pendingConnector, isError, variables, reset } =
    useConnect()

  const close = useCallback(() => {
    attemptedConnect.current = false
    onOpenChange?.(false)
    reset()
  }, [onOpenChange, reset])

  useEffect(() => {
    if (!isOpen) {
      attemptedConnect.current = false
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, isOpen])

  // Close once a connect started from this open succeeds (keep open while pending).
  useEffect(() => {
    if (!isOpen || !attemptedConnect.current || !isConnected || isPending) return
    attemptedConnect.current = false
    onOpenChange?.(false)
    reset()
  }, [isConnected, isOpen, isPending, onOpenChange, reset])

  const connectWallet = useCallback(
    (connector: Connector) => {
      try {
        attemptedConnect.current = true
        connect({ connector })
      } catch (error) {
        attemptedConnect.current = false
        console.error('[wallet] failed to connect Starknet wallet', error)
      }
    },
    [connect],
  )

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="starknet-wallet-selector"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: PANEL_EASE }}
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
                  Connect Starknet wallet
                </h2>
                <p className="mt-1 text-sm leading-5 font-book text-stone-500">
                  Choose a wallet to continue on Starknet.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className={cn(
                  'flex shrink-0 items-center rounded-md border border-stone-200 bg-white p-2 text-primary',
                  'shadow-[0_2.67px_1.33px_rgba(111,125,185,0.05)] transition-opacity hover:opacity-80',
                  focusReset,
                )}
              >
                <CloseIcon width={16} height={16} className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex w-full flex-col gap-2">
              {connectors.length ? (
                connectors.map((connector) => {
                  const selected = Boolean(isConnected && connectedConnector?.id === connector.id)
                  const pending =
                    isPending &&
                    (pendingConnector?.id === connector.id ||
                      variables?.connector?.id === connector.id)
                  const failed = isError && variables?.connector?.id === connector.id

                  return (
                    <button
                      key={connector.id}
                      type="button"
                      disabled={pending}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => connectWallet(connector)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left',
                        'transition-colors',
                        focusReset,
                        selected
                          ? 'border-[#c7d2fe] bg-[#e0eaff] text-[#6c77e9]'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900',
                        pending && 'cursor-wait opacity-80',
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-100">
                        <img
                          src={connectorIconSrc(connector.id, connector.icon)}
                          alt=""
                          width={32}
                          height={32}
                          className={cn(
                            'object-contain',
                            // Ready PNG fills the canvas; inset so it matches Braavos visual weight.
                            connector.id === 'argentX' || connector.id === 'ready'
                              ? 'size-[22px] rounded-sm'
                              : 'size-full',
                          )}
                          draggable={false}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-base leading-6 font-medium">
                        {connector.name}
                      </span>
                      {selected ? (
                        <span className="rounded-md bg-[#6c77e9] px-1.5 py-0.5 text-xs leading-4 font-medium tracking-wide text-white uppercase">
                          Connected
                        </span>
                      ) : null}
                      {pending ? (
                        <span
                          aria-label="Connecting"
                          className="size-5 shrink-0 animate-spin rounded-full border-2 border-stone-200 border-t-[#6c77e9]"
                        />
                      ) : null}
                      {failed ? (
                        <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-xs leading-4 font-medium tracking-wide text-red-700 uppercase">
                          Failed
                        </span>
                      ) : null}
                    </button>
                  )
                })
              ) : (
                <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-4 text-sm leading-5 text-stone-500">
                  No Starknet wallets detected. Install Argent or Braavos, then try again.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export default StarknetWalletSelector
