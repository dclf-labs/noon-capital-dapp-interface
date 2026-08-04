import { useCallback, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { CloseIcon } from '@/assets/icons'
import {
  MODAL_BACKDROP_CLASS,
  MODAL_CLOSE_BUTTON,
  MODAL_PANEL_TRANSITION,
} from '@/components/shell/constants'
import useDebounce from '@/hooks/ui/useDebounce'
import {
  filterReceiverAddressInput,
  getReceiverAddressError,
  type ReceiverAddressFamily,
  type SanitizedReceiverAddress,
  sanitizeReceiverAddress,
} from '@/lib/receiver-address'
import { cn } from '@/lib/utils'
import { StatusCallout } from '@/mock/bridge/StatusCallout'

const focusReset =
  'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none'

export type { ReceiverAddressFamily }

type FamilyCopy = {
  label: string
  placeholder: string
  submitLabel: string
  noticeTitle: string
  noticeDescription: string
}

const FAMILY_COPY: Record<ReceiverAddressFamily, FamilyCopy> = {
  evm: {
    label: 'Enter the EVM address:',
    placeholder: '0x…',
    submitLabel: 'Change address',
    noticeTitle:
      'Before proceeding, please ensure that you can access the entered wallet address on the receiving chain.',
    noticeDescription:
      'This is especially important if you use wallets like Gnosis Safe. If you cannot access this address, please change the receiving wallet address to avoid any issues.',
  },
  starknet: {
    label: 'Enter the Starknet address:',
    placeholder: '0x…',
    submitLabel: 'Set Starknet address',
    noticeTitle:
      'Before proceeding, please ensure that you can access this Starknet wallet on the destination network.',
    noticeDescription:
      'Bridged assets are sent to Starknet only. An Ethereum (EVM) address will not work here. If you use a Starknet wallet such as Argent or Braavos, confirm you control this account before continuing.',
  },
  sui: {
    label: 'Enter the Sui address:',
    placeholder: '0x…',
    submitLabel: 'Set Sui address',
    noticeTitle:
      'Before proceeding, please ensure that you can access this Sui wallet on the destination network.',
    noticeDescription:
      'Bridged assets are sent to Sui only. An Ethereum (EVM) address will not work here. Double-check the address in your Sui wallet before continuing to avoid losing access to your funds.',
  },
}

export type ChangeReceiverAddressModalProps = {
  family: ReceiverAddressFamily
  isOpen?: boolean
  currentAddress?: string
  onOpenChange?: (open: boolean) => void
  onSubmitAddress: (address: SanitizedReceiverAddress) => void
}

/**
 * Bridge destination “Change Address” modal for the Noon Capital shell.
 * Validates strictly by destination family (EVM / Starknet / Sui).
 */
export function ChangeReceiverAddressModal({
  family,
  isOpen = false,
  currentAddress,
  onOpenChange,
  onSubmitAddress,
}: ChangeReceiverAddressModalProps) {
  const titleId = useId()
  const inputId = useId()
  const copy = FAMILY_COPY[family]
  const [draft, setDraft] = useState(currentAddress || '')
  // Reset draft when the modal opens (React “adjust state when prop changes” pattern).
  const [openSnapshot, setOpenSnapshot] = useState(isOpen)
  if (isOpen !== openSnapshot) {
    setOpenSnapshot(isOpen)
    if (isOpen) setDraft(currentAddress || '')
  }

  const debounced = useDebounce(draft, 350)
  const isDebouncing = debounced !== draft
  const validationError = getReceiverAddressError(family, debounced)
  const isValid = Boolean(debounced.trim()) && validationError == null
  const submitDisabled = !isValid || isDebouncing
  const primaryLabel = isDebouncing
    ? 'Validating address'
    : validationError
      ? 'Invalid address'
      : copy.submitLabel

  const close = useCallback(() => onOpenChange?.(false), [onOpenChange])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, isOpen])

  const onSubmit = useCallback(() => {
    if (submitDisabled) return
    if (getReceiverAddressError(family, debounced)) return
    const sanitized = sanitizeReceiverAddress(family, debounced)
    if (!sanitized) return
    onSubmitAddress(sanitized)
    onOpenChange?.(false)
  }, [debounced, family, onOpenChange, onSubmitAddress, submitDisabled])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key={`change-receiver-${family}`}
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
              'relative z-10 flex w-full max-w-lg flex-col gap-5 overflow-hidden',
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
                  Change receiving address
                </h2>
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

            <div className="flex flex-col gap-1">
              <label htmlFor={inputId} className="text-sm leading-5 font-book text-stone-500">
                {copy.label}
              </label>
              <input
                id={inputId}
                type="text"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={draft}
                placeholder={currentAddress || copy.placeholder}
                onChange={(event) =>
                  setDraft(filterReceiverAddressInput(family, event.target.value || ''))
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    onSubmit()
                  }
                }}
                className={cn(
                  'w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3',
                  'font-suisse text-base leading-6 font-book text-stone-900 tabular-nums placeholder:text-stone-400',
                  'hover:border-stone-200 hover:bg-stone-50 focus:border-stone-200 focus:bg-stone-50',
                  'focus-visible:border-stone-200 active:border-stone-200',
                  focusReset,
                )}
              />
            </div>

            <StatusCallout
              type="neutral"
              title={copy.noticeTitle}
              description={copy.noticeDescription}
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={close}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-lg border border-stone-200 bg-white px-4 py-3',
                  'text-base leading-6 font-medium text-stone-700 transition-opacity hover:opacity-90',
                  focusReset,
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitDisabled}
                onClick={onSubmit}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-lg px-4 py-3',
                  'text-base leading-6 font-medium',
                  focusReset,
                  submitDisabled
                    ? 'cursor-not-allowed bg-cta-disabled text-cta-disabled-fg'
                    : 'bg-accent text-stone-50 transition-opacity hover:opacity-90',
                )}
              >
                {primaryLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export default ChangeReceiverAddressModal
