import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type TokenMarkSize = 'sm' | 'lg'

type TokenSymbolMarkProps = {
  symbol?: string
  iconSrc: string
  /** Optional node between icon and symbol (e.g. success amount). */
  middle?: ReactNode
  size?: TokenMarkSize
  className?: string
}

const SIZE: Record<
  TokenMarkSize,
  { icon: string; iconPx: number; type: string; gutter: string; iconTone: string }
> = {
  sm: {
    gutter: 'mr-1.5',
    icon: 'size-5',
    iconPx: 20,
    iconTone: 'bg-stone-200',
    type: 'text-xl leading-none tracking-[-1.2px] text-stone-500 md:text-2xl',
  },
  lg: {
    gutter: 'mr-2',
    icon: 'size-8',
    iconPx: 32,
    iconTone: 'bg-[#6c77e9]',
    type: 'text-[28px] leading-none tracking-[-1.4px] text-stone-900 md:text-[36px] md:tracking-[-1.8px]',
  },
}

/**
 * Token logo + symbol (optional middle).
 * `inline-block` + `align-middle` keeps the logo on the same band as the glyphs
 * (flex `items-center` was leaving the icon slightly low under Louize).
 */
export function TokenSymbolMark({
  symbol,
  iconSrc,
  middle,
  size = 'sm',
  className,
}: TokenSymbolMarkProps) {
  const styles = SIZE[size]

  return (
    <span className={cn('leading-none whitespace-nowrap', styles.type, className)}>
      <span
        className={cn(
          // Same optical nudge as old-dapp avatars beside Louize (`mb-1.5 inline-block align-middle`).
          'mb-1.5 inline-block shrink-0 overflow-hidden rounded-md align-middle',
          styles.icon,
          styles.iconTone,
          styles.gutter,
        )}
      >
        <img
          src={iconSrc}
          alt=""
          width={styles.iconPx}
          height={styles.iconPx}
          className="block size-full object-cover"
          draggable={false}
        />
      </span>

      {middle ? (
        <span className={cn('inline-block align-middle font-denton tabular-nums', styles.gutter)}>
          {middle}
        </span>
      ) : null}

      <span className="inline-block align-middle font-louize">{symbol || '—'}</span>
    </span>
  )
}
