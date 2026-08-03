/** Compact USD amount for the buy card (presets / pay field). */
export function formatBuyUsdAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

/** Balance chip: `Bal: $100,000`. */
export function formatBuyBalanceLabel(balanceUsd: number): string {
  if (!Number.isFinite(balanceUsd)) return 'Bal: —'
  return `Bal: $${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(balanceUsd)}`
}
