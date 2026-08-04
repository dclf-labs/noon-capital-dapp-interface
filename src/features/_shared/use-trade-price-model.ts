import { useMemo } from 'react'

import {
  getAmountUsd,
  normalizePreviewQuote,
  type PreviewQuoteData,
} from '@/features/_shared/trade-amounts'
import { formatSubmitFeeLabels, formatUnitRate, formatUsd } from '@/features/_shared/trade-display'

type PriceEnvelope = {
  data?: number
  isLoading?: boolean
  isError?: boolean
}

type FeeEnvelope = {
  data?: number
  native?: number
  isReady?: boolean
  isLoading?: boolean
  isError?: boolean
}

type TradePriceModelParams = {
  amount?: number
  tokenPrice?: PriceEnvelope
  /** Unit-rate preview (1 token in → out) — number or Starknet `{ quote, route }`. */
  unitPreview?: { data?: PreviewQuoteData; isLoading?: boolean; isError?: boolean }
  submitFee?: FeeEnvelope
  feeSymbol?: string
  isFetchingQuote?: boolean
}

/**
 * UI-ready price / fee / unit-rate labels for trade screens.
 * Optional helper when a provider does not already expose these fields.
 * Fee labels use the same USD + native contract as buy / bridge (`formatSubmitFeeLabels`).
 */
export function useTradePriceModel({
  amount,
  tokenPrice,
  unitPreview,
  submitFee,
  feeSymbol = 'ETH',
  isFetchingQuote = false,
}: TradePriceModelParams) {
  return useMemo(() => {
    const amountUsd = getAmountUsd(amount, tokenPrice)
    const unitRate = normalizePreviewQuote(unitPreview?.data)
    const { feeLabel, feeNativeLabel } = formatSubmitFeeLabels(submitFee, feeSymbol)

    return {
      amountUsd,
      amountUsdLabel: formatUsd(amountUsd),
      unitRate,
      unitRateLabel: unitRate === undefined ? undefined : formatUnitRate(unitRate),
      fee: submitFee?.isReady ? submitFee.data : undefined,
      feeLabel,
      feeNativeLabel,
      isFetchingQuote: Boolean(isFetchingQuote || unitPreview?.isLoading),
      isFeeLoading: Boolean(submitFee?.isLoading),
    }
  }, [
    amount,
    feeSymbol,
    isFetchingQuote,
    submitFee,
    tokenPrice,
    unitPreview?.data,
    unitPreview?.isLoading,
  ])
}
