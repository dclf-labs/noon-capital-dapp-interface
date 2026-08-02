import { formatUnits, parseUnits } from 'viem/utils'

/**
 * Numeric helpers for UI display and submit boundaries.
 *
 * - `down` / `up` clip fractional digits without `Math.pow` overflow.
 * - Intl helpers (`toIntlStr*`) take a `precision` used with `down()` first;
 *   displayed fraction digits are then capped by Intl (`2` or `4`), not by `precision`.
 * - Prefer keeping `bigint` through submit paths; convert with these helpers only
 *   at display or calldata-encoding edges.
 */

function toSafeNumber(amount: string | number | bigint | undefined): number {
  try {
    const value = Number(amount?.toString() || 0)
    return Number.isNaN(value) ? 0 : value
  } catch {
    return 0
  }
}

export const ceil = (amount: string | number | bigint | undefined) =>
  Math.ceil(toSafeNumber(amount))

export const floor = (amount: string | number | bigint | undefined) =>
  Math.floor(toSafeNumber(amount))

/**
 * Truncate toward zero to `decimals` fractional digits without `Math.pow`
 * float overflow (unsafe for large decimal counts).
 */
export const down = (amount: string | number | bigint | undefined, decimals: number) => {
  const value = toSafeNumber(amount)
  if (!Number.isFinite(value) || decimals < 0) return 0
  const sign = value < 0 ? -1 : 1
  const [intPart, fracPart = ''] = Math.abs(value).toString().split('.')
  if (decimals === 0) return sign * Math.floor(Math.abs(value))
  const clippedFrac = fracPart.slice(0, decimals)
  return sign * Number(`${intPart}.${clippedFrac}`)
}

/** Round away from zero up to `decimals` fractional digits (string-safe). */
export const up = (amount: string | number | bigint | undefined, decimals: number) => {
  const value = toSafeNumber(amount)
  if (!Number.isFinite(value) || decimals < 0) return 0
  const sign = value < 0 ? -1 : 1
  const abs = Math.abs(value)
  const [intPart, fracPart = ''] = abs.toString().split('.')
  if (decimals === 0) return sign * Math.ceil(abs)
  const keep = fracPart.slice(0, decimals)
  const rest = fracPart.slice(decimals)
  const needsBump = /[1-9]/.test(rest)
  if (!needsBump) return sign * Number(`${intPart}.${keep}`)
  // Bump the truncated fractional part by one unit in the last place.
  const unit = Number(`1e-${decimals}`)
  return sign * (Number(`${intPart}.${keep.padEnd(decimals, '0')}`) + unit)
}

export const round = (amount: string | number | bigint | undefined) =>
  Math.round(toSafeNumber(amount))

export const bnToStr = (
  amount: number | string | bigint | undefined,
  decimals: number | undefined,
) => {
  try {
    const _decimals = decimals ?? 18
    const _amount = BigInt(amount?.toString() || 0)
    return formatUnits(_amount, _decimals) || '0'
  } catch {
    return '0'
  }
}

export const bnToInt = (
  amount: number | string | bigint | undefined,
  decimals: number | undefined,
) => {
  try {
    const _decimals = decimals ?? 18
    const _amount = BigInt(amount?.toString() || 0)
    return round(formatUnits(_amount, _decimals)) || 0
  } catch {
    return 0
  }
}

export const strToBn = (
  amount: bigint | string | number | undefined,
  decimals: number | undefined,
) => {
  try {
    const _decimals = decimals ?? 18
    const _amount = amount?.toString() || '0'
    return parseUnits(_amount, _decimals) || BigInt(0)
  } catch {
    return BigInt(0)
  }
}

export const toStr = (amount: number | string | bigint | undefined) => {
  try {
    return amount?.toString() || ''
  } catch {
    return '0'
  }
}

export const toNum = (amount: number | string | bigint | undefined) => toSafeNumber(amount)

/**
 * Convert on-chain raw units to a JS number for UI display.
 * Prefer keeping `bigint` through submit paths; use this only at the display boundary.
 */
export const rawUnitsToNumber = (
  amount: number | string | bigint | undefined,
  decimals: number | undefined,
) => toNum(bnToStr(amount, decimals)) || 0

export const toAbsNum = (amount: number | string | bigint | undefined) =>
  Math.abs(toSafeNumber(amount))

export const toBn = (amount: number | string | bigint | undefined) => {
  try {
    return BigInt(amount?.toString() || 0)
  } catch {
    return BigInt(0)
  }
}

/**
 * JS number → token units for calldata, truncating toward zero.
 * Caps fractional digits at 12 so IEEE float dust cannot inflate mins/amounts.
 */
export const toTruncatedTokenUnits = (
  amount: number | undefined,
  decimals: number | undefined,
): bigint => {
  if (amount == null || decimals == null || !Number.isFinite(amount)) return 0n
  const negative = amount < 0
  const abs = Math.abs(amount).toString()
  if (abs.includes('e') || abs.includes('E')) {
    // Rare huge/tiny values — fall back without extra truncation.
    return strToBn(amount, decimals)
  }
  const [intPart, fracPart = ''] = abs.split('.')
  const precision = Math.min(decimals, 12)
  const clipped = fracPart ? `${intPart}.${fracPart.slice(0, precision)}` : intPart
  return strToBn(negative ? `-${clipped}` : clipped, decimals)
}

/** Fixed 2-fraction-digit Intl string after `down(amount, precision)`. */
export const toIntlStr = (
  amount: number | string | bigint | undefined,
  precision: number = 2,
  minimumPrecision: number = 2,
  prefix: string = '',
  suffix: string = '',
) => {
  const _amount = down(toNum(amount), precision)
  return _amount < 0.01 && _amount > 0
    ? `<${prefix}0.01${suffix}`.replace('<~', '<')
    : `${prefix}${new Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 1,
        minimumFractionDigits: minimumPrecision || 2,
        maximumFractionDigits: 2,
      }).format(_amount)}${suffix}`
}

export const toIntlStrWithMaxFractionDigits4 = (
  amount: number | string | bigint | undefined,
  precision: number = 2,
  minimumPrecision: number = 2,
  prefix: string = '',
  suffix: string = '',
) => {
  const _amount = down(toNum(amount), precision)
  return _amount < 0.01 && _amount > 0
    ? `<${prefix}0.01${suffix}`.replace('<~', '<')
    : `${prefix}${new Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 1,
        minimumFractionDigits: minimumPrecision || 2,
        maximumFractionDigits: 4,
      }).format(_amount)}${suffix}`
}

export const toIntlCompactStr = (
  amount: number | string | bigint | undefined,
  precision: number = 2,
  useConditionalCompact: boolean = true,
  minimumFractionDigits: number = 0,
  prefix: string = '',
  suffix: string = '',
) => {
  const _amount = down(toNum(amount), precision)
  return _amount < 0.01 && _amount > 0
    ? `<${prefix}0.01${suffix}`.replace('<~', '<')
    : useConditionalCompact && _amount < 100_000
      ? toIntlStr(amount, precision, minimumFractionDigits, prefix, suffix)
      : `${prefix}${new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          minimumIntegerDigits: 1,
          maximumFractionDigits: 2,
          minimumFractionDigits: minimumFractionDigits || 0,
        }).format(_amount)}${suffix}`
}

export const toIntlCompactStrWithMaxFractionDigits4 = (
  amount: number | string | bigint | undefined,
  precision: number = 2,
  useConditionalCompact: boolean = true,
  minimumFractionDigits: number = 0,
  prefix: string = '',
  suffix: string = '',
) => {
  const _amount = down(toNum(amount), precision)
  return _amount < 0.01 && _amount > 0
    ? `<${prefix}0.01${suffix}`.replace('<~', '<')
    : useConditionalCompact && _amount < 100_000
      ? toIntlStrWithMaxFractionDigits4(amount, precision, minimumFractionDigits, prefix, suffix)
      : `${prefix}${new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          minimumIntegerDigits: 1,
          maximumFractionDigits: 4,
          minimumFractionDigits: minimumFractionDigits || 0,
        }).format(_amount)}${suffix}`
}

export const toIntlInt = (
  amount: number | string | bigint | undefined,
  prefix: string = '',
  suffix: string = '',
) => {
  const _amount = round(toNum(amount))
  return _amount < 0.01 && _amount > 0
    ? `<${prefix}0.01${suffix}`.replace('<~', '<')
    : `${prefix}${new Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(_amount)}${suffix}`
}

export const toIntlCompactInt = (
  amount: number | string | bigint | undefined,
  prefix: string = '',
  suffix: string = '',
) => {
  const _amount = round(toNum(amount))
  return _amount < 0.01 && _amount > 0
    ? `<${prefix}0.01${suffix}`.replace('<~', '<')
    : `${prefix}${new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(_amount)}${suffix}`
}
