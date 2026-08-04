import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'

import {
  normalizePreviewQuote,
  normalizePreviewRoute,
  type PreviewQuoteData,
} from '@/features/_shared/trade-amounts'
import useDebounce from '@/hooks/ui/useDebounce'
import { toNum } from '@/lib/format'

const DEFAULT_DEBOUNCE_MS = 350

type QuoteSourceFields = {
  amountIn?: unknown
  amount?: unknown
  tokenIn?: { contractAddress?: string; symbol?: string }
  tokenOut?: { contractAddress?: string; symbol?: string }
}

/**
 * Identity of fields that drive quote requests. Excludes derived fields like
 * `amountOut` / `route` so preview sync does not look like user input debounce.
 */
export function getQuoteSourceKey(inputs: unknown): string {
  if (!inputs || typeof inputs !== 'object') return ''
  const value = inputs as QuoteSourceFields
  return [
    String(value.amountIn ?? value.amount ?? ''),
    value.tokenIn?.contractAddress ?? value.tokenIn?.symbol ?? '',
    value.tokenOut?.contractAddress ?? value.tokenOut?.symbol ?? '',
  ].join('|')
}

function sameRoute<TRoute>(left: TRoute[] | undefined, right: TRoute[]): boolean {
  if (!left) return right.length === 0
  if (left.length !== right.length) return false
  return left.every((item, index) => item === right[index])
}

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

  // Only amount/token changes should count as debouncing for quote UX.
  // Syncing amountOut into `inputs` must not flip this and blank the receive field.
  const isDebouncing = useMemo(
    () => getQuoteSourceKey(inputs) !== getQuoteSourceKey(debouncedInputs),
    [debouncedInputs, inputs],
  )

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
 * Sync `amountOut` on form inputs from a numeric preview while not debouncing.
 */
export function useSyncAmountOut<TInputs extends { amountOut?: number | undefined }>(
  setInputs: Dispatch<SetStateAction<TInputs>>,
  previewAmount: number | undefined,
  isDebouncing: boolean,
) {
  useEffect(() => {
    if (isDebouncing || previewAmount === undefined) return
    const nextAmountOut = toNum(previewAmount)
    setInputs((prev) => {
      // Treat non-positive quotes as "no quote" so empty amountIn does not stick amountOut=0.
      if (!(nextAmountOut > 0)) {
        return prev.amountOut === undefined ? prev : { ...prev, amountOut: undefined }
      }
      if (toNum(prev.amountOut) === nextAmountOut) return prev
      return {
        ...prev,
        amountOut: nextAmountOut,
      }
    })
  }, [isDebouncing, previewAmount, setInputs])
}

type PreviewOutInputs<TRoute> = {
  amountOut?: number | undefined
  route?: TRoute[]
}

/**
 * Sync `amountOut` + `route` from Starknet `{ quote, route }` (or shapes that include a route).
 * Requires a non-empty `route`; plain numeric EVM quotes must use {@link useSyncAmountOut}.
 */
export function useSyncPreviewOut<TRoute, TInputs extends PreviewOutInputs<TRoute>>(
  setInputs: Dispatch<SetStateAction<TInputs>>,
  preview: { data?: PreviewQuoteData<TRoute>; isLoading?: boolean; isError?: boolean },
  isDebouncing: boolean,
) {
  useEffect(() => {
    if (isDebouncing) return

    if (preview.isError) {
      setInputs((prev) => {
        if (prev.amountOut === undefined && (!prev.route || prev.route.length === 0)) return prev
        return {
          ...prev,
          amountOut: undefined,
          route: [],
        }
      })
      return
    }

    if (preview.isLoading || preview.data === undefined) return
    const amountOut = normalizePreviewQuote(preview.data)
    const route = normalizePreviewRoute(preview.data)
    setInputs((prev) => {
      // Empty route ⇒ clear (Starknet path); EVM numeric quotes use useSyncAmountOut.
      if (amountOut === undefined || !(amountOut > 0) || route.length === 0) {
        if (prev.amountOut === undefined && (!prev.route || prev.route.length === 0)) return prev
        return {
          ...prev,
          amountOut: undefined,
          route: [],
        }
      }
      if (toNum(prev.amountOut) === amountOut && sameRoute(prev.route, route)) return prev
      return {
        ...prev,
        amountOut,
        route,
      }
    })
  }, [isDebouncing, preview.data, preview.isError, preview.isLoading, setInputs])
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

type SeenSessionKey = {
  key: string
  address: string
  chainId: string
  connected: boolean
}

/**
 * Clear amounts / step / txn URL when wallet address or connection drops.
 * Chain-only switches reseed tokens and reset step but keep
 * amounts so the buy card does not flash empty on EVM→EVM network changes.
 *
 * Identity reseeds run during render (not in an effect) so the first paint after a
 * chain switch already has the new tokens — avoids a one-frame “reload” flash.
 */
export function useResetOnSessionChange<TInputs extends object>({
  session,
  setInputs,
  setStep,
  setTxnUrl,
  seedInputs,
}: ResetOnSessionChangeOptions<TInputs>) {
  const address = (session.address ?? '').toLowerCase()
  const chainId = String(session.chainId ?? '')
  const connected = Boolean(session.isConnected)
  const identityKey = `${connected ? '1' : '0'}:${address}:${chainId}`
  const [seen, setSeen] = useState<SeenSessionKey | null>(null)

  if (seen?.key !== identityKey) {
    const isFirst = seen === null
    // Same wallet, still connected, only product chain changed (EVM→EVM).
    const chainOnlyChange = Boolean(
      seen &&
      seen.connected &&
      connected &&
      seen.address !== '' &&
      seen.address === address &&
      seen.chainId !== chainId,
    )

    setSeen({ key: identityKey, address, chainId, connected })
    const seeded = seedInputs?.() ?? {}

    if (isFirst) {
      if (Object.keys(seeded).length > 0) {
        setInputs((prevInputs) => ({ ...prevInputs, ...seeded }))
      }
    } else {
      setInputs((prevInputs) => {
        const next = { ...prevInputs, ...seeded } as TInputs & {
          amountIn?: unknown
          amountOut?: unknown
          amount?: unknown
        }
        if (!chainOnlyChange) {
          if ('amountIn' in next) next.amountIn = undefined
          if ('amountOut' in next) next.amountOut = undefined
          if ('amount' in next) next.amount = undefined
        }
        return next as TInputs
      })
      setStep(0)
      setTxnUrl?.(undefined)
    }
  }

  useEffect(() => {
    if (session.unsupported) {
      setStep(0)
      setTxnUrl?.(undefined)
    }
  }, [session.unsupported, setStep, setTxnUrl])
}

/** True when wallet balance cannot cover the entered pay amount. */
export function getInsufficientBalance(balance: number | undefined, amountIn: number | undefined) {
  return toNum(balance) < toNum(amountIn)
}

/** True when allowance covers the entered pay amount. */
export function getIsApproved(allowance: number | undefined, amountIn: number | undefined) {
  return toNum(allowance) >= toNum(amountIn)
}
