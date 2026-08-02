import { useMemo } from 'react'

import {
  getAmountUsd,
  normalizePreviewQuote,
  type PreviewQuoteData,
} from '@/features/_shared/trade-amounts'
import { formatNativeFee, formatUnitRate, formatUsd } from '@/features/_shared/trade-display'

type PriceEnvelope = {
  data?: number
  isLoading?: boolean
  isError?: boolean
}

type FeeEnvelope = {
  data?: number
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
  feeDecimals?: number
  isFetchingQuote?: boolean
}

/**
 * UI-ready price / fee / unit-rate labels for trade screens.
 * Optional helper when a provider does not already expose these fields.
 */
export function useTradePriceModel({
  amount,
  tokenPrice,
  unitPreview,
  submitFee,
  feeSymbol = 'ETH',
  feeDecimals = 18,
  isFetchingQuote = false,
}: TradePriceModelParams) {
  return useMemo(() => {
    const amountUsd = getAmountUsd(amount, tokenPrice)
    const unitRate = normalizePreviewQuote(unitPreview?.data)

    return {
      amountUsd,
      amountUsdLabel: formatUsd(amountUsd),
      unitRate,
      unitRateLabel: unitRate === undefined ? undefined : formatUnitRate(unitRate),
      fee: submitFee?.data,
      feeLabel:
        submitFee?.data === undefined
          ? undefined
          : formatNativeFee(submitFee.data, feeSymbol, feeDecimals),
      isFetchingQuote: Boolean(isFetchingQuote || unitPreview?.isLoading),
      isFeeLoading: Boolean(submitFee?.isLoading),
    }
  }, [
    amount,
    feeDecimals,
    feeSymbol,
    isFetchingQuote,
    submitFee?.data,
    submitFee?.isLoading,
    tokenPrice,
    unitPreview?.data,
    unitPreview?.isLoading,
  ])
}
