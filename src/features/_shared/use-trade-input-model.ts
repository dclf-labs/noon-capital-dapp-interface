import { useMemo } from 'react'

import {
  getAmountUsd,
  getPresetAmount,
  isBalancePresetDisabled,
  normalizeTradeAmount,
  TRADE_INPUT_DECIMALS,
} from '@/features/_shared/trade-amounts'
import { formatBalanceLabel, formatTokenAmount, formatUsd } from '@/features/_shared/trade-display'

type PriceEnvelope = {
  data?: number
  isLoading?: boolean
  isError?: boolean
}

type BalanceEnvelope = {
  data?: number
  isLoading?: boolean
  isError?: boolean
}

type TradeInputModelParams = {
  amount?: number
  tokenPrice?: PriceEnvelope
  balance?: BalanceEnvelope
  tokenSymbol?: string
  tokenDecimals?: number
}

/**
 * UI-ready trade input model. Components should only bind these values —
 * no amount×price, half/max, or Intl formatting in the view.
 */
export function useTradeInputModel({
  amount,
  tokenPrice,
  balance,
  tokenSymbol,
  tokenDecimals = 18,
}: TradeInputModelParams) {
  return useMemo(() => {
    const amountUsd = getAmountUsd(amount, tokenPrice)
    const inputValue =
      amount === undefined || amount === null || Number(amount) === 0
        ? ''
        : String(normalizeTradeAmount(amount, TRADE_INPUT_DECIMALS))

    return {
      /** Controlled input string (empty when amount is unset/zero). */
      inputValue,
      amountUsd,
      amountUsdLabel: formatUsd(amountUsd),
      balanceLabel: balance
        ? formatBalanceLabel(balance.data, tokenSymbol, tokenDecimals)
        : undefined,
      formattedBalance: balance
        ? formatTokenAmount(balance.data, tokenSymbol, tokenDecimals)
        : undefined,
      isPresetDisabled: balance ? isBalancePresetDisabled(balance) : true,
      halfAmount: getPresetAmount(balance?.data, 'half'),
      maxAmount: getPresetAmount(balance?.data, 'max'),
      normalizeAmount: (value: number | undefined) =>
        normalizeTradeAmount(value, TRADE_INPUT_DECIMALS),
    }
  }, [amount, balance, tokenDecimals, tokenPrice, tokenSymbol])
}
