import { formatUnits, parseUnits } from 'viem/utils'

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

export const down = (amount: string | number | bigint | undefined, decimals: number) => {
  const value = toSafeNumber(amount)
  const factor = Math.pow(10, decimals)
  return Math.floor(value * factor) / factor
}

export const up = (amount: string | number | bigint | undefined, decimals: number) => {
  const value = toSafeNumber(amount)
  const factor = Math.pow(10, decimals)
  return Math.ceil(value * factor) / factor
}

export const round = (amount: string | number | bigint | undefined) =>
  Math.round(toSafeNumber(amount))

export const bnToStr = (
  amount: number | string | bigint | undefined,
  decimals: number | undefined,
) => {
  try {
    const _decimals = decimals || 18
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
    const _decimals = decimals || 18
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
    const _decimals = decimals || 18
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

export const toAbsNum = (amount: number | string | bigint | undefined) =>
  Math.abs(toSafeNumber(amount))

export const toBn = (amount: number | string | bigint | undefined) => {
  try {
    return BigInt(amount?.toString() || 0)
  } catch {
    return BigInt(0)
  }
}

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
