import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { type Connector, useAccount, useConnect } from '@starknet-react/core'
import { AnimatePresence, motion } from 'motion/react'

import { CloseIcon } from '@/assets/icons'
import {
  LIST_OPTION_ACTIVE,
  LIST_OPTION_ACTIVE_PILL,
  LIST_OPTION_IDLE,
  MODAL_BACKDROP_CLASS,
  MODAL_CLOSE_BUTTON,
  MODAL_PANEL_TRANSITION,
  SHELL_SELECTION_SPRING,
} from '@/components/shell/constants'
import { cn } from '@/lib/utils'
import { resolveConnectorIconSrc } from '@/wallet/connector-icon'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

function connectorIconSrc(
  connectorId: string | undefined,
  icon: Connector['icon'] | undefined,
): string {
  return (
    resolveConnectorIconSrc({ id: connectorId, icon }, 'starknet') ?? '/assets/chains/starknet.svg'
  )
}

type StarknetWalletSelectorProps = {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Branded Starknet wallet picker — same role as old-dapp `StarknetWalletSelector`,
 * with the shared black active pill used by shell dropdowns / menubar.
 */
export function StarknetWalletSelector({
  isOpen = false,
  onOpenChange,
}: StarknetWalletSelectorProps) {
  const titleId = useId()
  const listBgId = useId()
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
                className={cn(MODAL_CLOSE_BUTTON, focusReset)}
              >
                <CloseIcon width={16} height={16} className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex w-full flex-col gap-1.5">
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
                      aria-pressed={selected}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => connectWallet(connector)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left',
                        focusReset,
                        selected ? LIST_OPTION_ACTIVE : LIST_OPTION_IDLE,
                        pending && 'cursor-wait opacity-80',
                      )}
                    >
                      {selected ? (
                        <motion.div
                          layoutId={`starknet-wallet-selector-bg-${listBgId}`}
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
                      <span className="relative z-10 min-w-0 flex-1 truncate text-base leading-6 font-medium">
                        {connector.name}
                      </span>
                      {selected ? (
                        <span className="relative z-10 rounded-md bg-white/15 px-1.5 py-0.5 text-xs leading-4 font-medium tracking-wide text-white uppercase">
                          Connected
                        </span>
                      ) : null}
                      {pending ? (
                        <span
                          aria-label="Connecting"
                          className="relative z-10 size-5 shrink-0 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900"
                        />
                      ) : null}
                      {failed ? (
                        <span className="relative z-10 rounded-md bg-red-50 px-1.5 py-0.5 text-xs leading-4 font-medium tracking-wide text-red-700 uppercase">
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
