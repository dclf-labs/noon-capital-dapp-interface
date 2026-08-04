import { safeExternalHref } from '@/lib/safe-external-href'
import { cn } from '@/lib/utils'
import { type BuyPoweredBy, DEFAULT_BUY_POWERED_BY } from '@/mock/buy/powered-by'

type PoweredByRowProps = {
  poweredBy?: BuyPoweredBy
}

/** Shared “Powered by” DEX badge under buy step cards. */
export function PoweredByRow({ poweredBy = DEFAULT_BUY_POWERED_BY }: PoweredByRowProps) {
  const href = safeExternalHref(poweredBy.href)
  const badgeClass = cn(
    'flex items-center rounded-full bg-stone-100 transition-colors',
    href && 'hover:bg-stone-200',
    poweredBy.wordmark ? 'pr-2 pl-1.5' : 'gap-1.5 py-0.5 pr-2.5 pl-1.5',
  )

  const badge = (
    <>
      <img
        src={poweredBy.logoSrc}
        alt={poweredBy.wordmark ? poweredBy.name : ''}
        width={poweredBy.wordmark ? 84 : 20}
        height={poweredBy.wordmark ? 24 : 20}
        className={poweredBy.wordmark ? 'h-6 w-[84px]' : 'size-5 rounded-md'}
      />
      {poweredBy.wordmark ? null : (
        <span className="text-sm leading-5 font-book text-stone-600">{poweredBy.name}</span>
      )}
    </>
  )

  return (
    <div className="flex items-center gap-2">
      <span className="text-base leading-6 font-book text-stone-500">Powered by</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${poweredBy.name} home`}
          className={badgeClass}
        >
          {badge}
        </a>
      ) : (
        <div className={badgeClass}>{badge}</div>
      )}
    </div>
  )
}
