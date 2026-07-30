import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import useDebounce from '@/hooks/ui/useDebounce'
import { toNum } from '@/lib/format'

const DEFAULT_DEBOUNCE_MS = 350

/**
 * Shared trade-form controller: step, inputs, debounced inputs, txn URL.
 */
export function useTradeFormController<TInputs>(
  initialInputs: TInputs,
  debounceMs: number = DEFAULT_DEBOUNCE_MS,
) {
  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState<TInputs>(initialInputs)
  const [txnUrl, setTxnUrl] = useState<string | undefined>(undefined)
  const debouncedInputs = useDebounce(inputs, debounceMs)

  const isDebouncing = useMemo(() => debouncedInputs !== inputs, [debouncedInputs, inputs])

  return {
    step,
    setStep,
    inputs,
    setInputs,
    debouncedInputs,
    txnUrl,
    setTxnUrl,
    isDebouncing,
  }
}

/**
 * Sync `amountOut` on form inputs from a preview quote while not debouncing.
 */
export function useSyncAmountOut<TInputs extends { amountOut?: number | undefined }>(
  setInputs: Dispatch<SetStateAction<TInputs>>,
  previewAmount: number | undefined,
  isDebouncing: boolean,
) {
  useEffect(() => {
    if (isDebouncing || previewAmount === undefined) return
    setInputs((prev) => ({
      ...prev,
      amountOut: toNum(previewAmount),
    }))
  }, [isDebouncing, previewAmount, setInputs])
}

export type SessionIdentity = {
  address?: string | undefined
  chainId?: number | string | undefined
  unsupported?: boolean
  isConnected?: boolean
}

export type ResetOnSessionChangeOptions<TInputs> = {
  session: SessionIdentity
  setInputs: Dispatch<SetStateAction<TInputs>>
  setStep: Dispatch<SetStateAction<number>>
  setTxnUrl?: Dispatch<SetStateAction<string | undefined>>
  /**
   * Rebuild default tokens / fields when the session identity changes.
   * Kept in a ref so inline lambdas do not re-trigger the effect.
   */
  seedInputs?: () => Partial<TInputs>
}

/**
 * Clear amounts / step / txn URL when wallet address, chain, or connection drops.
 * Also resets step + txn when the session becomes unsupported.
 */
export function useResetOnSessionChange<TInputs extends object>({
  session,
  setInputs,
  setStep,
  setTxnUrl,
  seedInputs,
}: ResetOnSessionChangeOptions<TInputs>) {
  const seedRef = useRef(seedInputs)

  useEffect(() => {
    seedRef.current = seedInputs
  })

  const identityKey = `${session.isConnected ? '1' : '0'}:${(session.address ?? '').toLowerCase()}:${String(session.chainId ?? '')}`
  const prevIdentityRef = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevIdentityRef.current
    if (prev === identityKey) return

    const isFirst = prev === null
    prevIdentityRef.current = identityKey

    const seeded = seedRef.current?.() ?? {}

    if (isFirst) {
      if (Object.keys(seeded).length > 0) {
        setInputs((prevInputs) => ({ ...prevInputs, ...seeded }))
      }
      return
    }

    setInputs((prevInputs) => {
      const next = { ...prevInputs, ...seeded } as TInputs & {
        amountIn?: unknown
        amountOut?: unknown
        amount?: unknown
      }
      if ('amountIn' in next) next.amountIn = undefined
      if ('amountOut' in next) next.amountOut = undefined
      if ('amount' in next) next.amount = undefined
      return next as TInputs
    })
    setStep(0)
    setTxnUrl?.(undefined)
  }, [identityKey, setInputs, setStep, setTxnUrl])

  useEffect(() => {
    if (session.unsupported) {
      setStep(0)
      setTxnUrl?.(undefined)
    }
  }, [session.unsupported, setStep, setTxnUrl])
}

export function getInsufficientBalance(balance: number | undefined, amountIn: number | undefined) {
  return toNum(balance) < toNum(amountIn)
}

export function getIsApproved(allowance: number | undefined, amountIn: number | undefined) {
  return toNum(allowance) >= toNum(amountIn)
}
