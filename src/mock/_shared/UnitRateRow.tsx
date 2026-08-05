import type { Token } from '@/config/token'
import { tokenIconSrc } from '@/lib/token-icon'
import { cn } from '@/lib/utils'

type UnitRateRowProps = {
  tokenIn?: Token
  tokenOut?: Token
  /** Formatted out-amount for 1 unit of tokenIn (e.g. from `formatUnitRate`). */
  rateLabel?: string
  isLoading?: boolean
}

function TokenGlyph({ token }: { token?: Token }) {
  return (
    <span className="mr-1 inline-block size-5 overflow-hidden rounded-[4px] bg-stone-200 align-middle">
      <img
        src={tokenIconSrc(token)}
        alt=""
        width={20}
        height={20}
        className="block size-full object-cover"
        draggable={false}
      />
    </span>
  )
}

/**
 * Unit quote row under trade inputs:
 * `1 {in logo} SYMBOL equals` → `{out logo} amount SYMBOL`.
 */
export function UnitRateRow({ tokenIn, tokenOut, rateLabel, isLoading = false }: UnitRateRowProps) {
  if (!rateLabel && !isLoading) return null

  return (
    <div className="flex w-full items-center justify-between gap-1">
      <p className="min-w-0 truncate text-sm leading-5 font-book whitespace-nowrap text-stone-500">
        <TokenGlyph token={tokenIn} />
        <span className="inline-block align-middle">1 {tokenIn?.symbol || 'Token'} equals</span>
      </p>
      <p
        className={cn(
          'shrink-0 text-base leading-6 font-semibold whitespace-nowrap text-stone-600 tabular-nums',
          isLoading && 'animate-pulse',
        )}
      >
        <TokenGlyph token={tokenOut} />
        <span className="inline-block align-middle">
          {rateLabel ?? '—'}
          {tokenOut?.symbol ? ` ${tokenOut.symbol}` : ''}
        </span>
      </p>
    </div>
  )
}
