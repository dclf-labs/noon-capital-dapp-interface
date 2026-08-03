import { safeExternalHref } from '@/lib/safe-external-href'
import { cn } from '@/lib/utils'
import {
  accentCtaClassName,
  preventMouseDownFocus,
  secondaryCtaClassName,
} from '@/mock/_shared/ui-classes'

type ExplorerActionsProps = {
  txnUrl?: string
  moreLabel: string
  onMore?: () => void
  className?: string
}

/**
 * Success-step actions: sanitized explorer link + accent “more” CTA.
 * Unsafe / non-https `txnUrl` values render a disabled explorer control.
 */
export function ExplorerActions({ txnUrl, moreLabel, onMore, className }: ExplorerActionsProps) {
  const explorerHref = safeExternalHref(txnUrl)

  return (
    <div className={cn('flex w-full flex-col gap-3 px-3 sm:flex-row sm:gap-4', className)}>
      {explorerHref ? (
        <a
          href={explorerHref}
          target="_blank"
          rel="noreferrer noopener"
          className={secondaryCtaClassName()}
        >
          View Explorer
        </a>
      ) : (
        <button type="button" disabled className={secondaryCtaClassName({ disabled: true })}>
          View Explorer
        </button>
      )}

      <button
        type="button"
        disabled={!onMore}
        onMouseDown={preventMouseDownFocus}
        onClick={onMore}
        className={accentCtaClassName()}
      >
        {moreLabel}
      </button>
    </div>
  )
}
