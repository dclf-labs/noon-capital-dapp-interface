import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type TokenMarkSize = 'sm' | 'lg'

type TokenSymbolMarkProps = {
  symbol?: string
  iconSrc: string
  /** Optional chain badge overlay (`/assets/chains/…`). */
  chainIconSrc?: string
  /** Optional node between icon and symbol (e.g. success amount). */
  middle?: ReactNode
  size?: TokenMarkSize
  className?: string
}

const SIZE: Record<
  TokenMarkSize,
  {
    icon: string
    iconPx: number
    overlay: string
    overlayPx: number
    type: string
    gutter: string
    iconTone: string
  }
> = {
  sm: {
    gutter: 'mr-1.5',
    icon: 'size-5',
    iconPx: 20,
    overlay: 'size-2.5',
    overlayPx: 10,
    iconTone: 'bg-stone-200',
    type: 'text-xl leading-none tracking-[-1.2px] text-stone-500 md:text-2xl',
  },
  lg: {
    gutter: 'mr-2',
    icon: 'size-8',
    iconPx: 32,
    overlay: 'size-3',
    overlayPx: 12,
    iconTone: 'bg-accent',
    type: 'text-[28px] leading-none tracking-[-1.4px] text-stone-900 md:text-[36px] md:tracking-[-1.8px]',
  },
}

/**
 * Token logo + symbol (optional middle + chain overlay).
 * `inline-block` + `align-middle` keeps the logo on the same band as the glyphs
 * (flex `items-center` was leaving the icon slightly low under Louize).
 */
export function TokenSymbolMark({
  symbol,
  iconSrc,
  chainIconSrc,
  middle,
  size = 'sm',
  className,
}: TokenSymbolMarkProps) {
  const styles = SIZE[size]

  return (
    <span className={cn('leading-none whitespace-nowrap', styles.type, className)}>
      <span
        className={cn(
          // Optical nudge beside Louize display type (`mb-1.5 inline-block align-middle`).
          'relative mb-1.5 inline-block shrink-0 align-middle',
          styles.gutter,
        )}
      >
        <span className={cn('block overflow-hidden rounded-md', styles.icon, styles.iconTone)}>
          <img
            src={iconSrc}
            alt=""
            width={styles.iconPx}
            height={styles.iconPx}
            className="block size-full object-cover"
            draggable={false}
          />
        </span>
        {chainIconSrc ? (
          <span
            className={cn(
              'absolute -right-0.5 -bottom-0.5 overflow-hidden rounded-[2px] border border-white bg-white',
              styles.overlay,
            )}
          >
            <img
              src={chainIconSrc}
              alt=""
              width={styles.overlayPx}
              height={styles.overlayPx}
              className="size-full rounded-[2px] object-cover"
              draggable={false}
            />
          </span>
        ) : null}
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
