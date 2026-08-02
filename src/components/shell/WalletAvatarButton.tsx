import { cn } from '@/lib/utils'

type WalletAvatarButtonProps = {
  onClick?: () => void
  className?: string
  /** Larger avatar used in the mobile nav drawer. */
  size?: 'sm' | 'md'
  label?: string
  showLabel?: boolean
}

const sizes = {
  sm: {
    button: 'p-2',
    avatar: 'size-6 rounded',
    badge: 'size-3 border-[0.75px]',
    fox: 'h-[6.75px] w-[7px]',
  },
  md: {
    button: 'p-[8.5px]',
    avatar: 'size-[31px] rounded-[5px]',
    badge: 'size-[15px] border',
    fox: 'h-[8.7px] w-[9px]',
  },
} as const

/** Wallet chip — avatar + MetaMask badge; optional text label (desktop). */
export function WalletAvatarButton({
  onClick,
  className,
  size = 'sm',
  label,
  showLabel = false,
}: WalletAvatarButtonProps) {
  const s = sizes[size]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || 'Connect wallet'}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white',
        'text-stone-900 transition-colors hover:text-primary focus-visible:text-primary',
        'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
        showLabel ? 'py-2 pr-3 pl-2' : s.button,
        className,
      )}
    >
      <span
        className={cn(
          'relative shrink-0 overflow-visible',
          size === 'sm' ? 'size-6' : 'size-[31px]',
        )}
      >
        <span className={cn('block overflow-hidden', s.avatar)}>
          <img
            src="/assets/shell/wallet-avatar.png"
            alt=""
            width={size === 'sm' ? 24 : 31}
            height={size === 'sm' ? 24 : 31}
            className="size-full object-cover"
          />
        </span>
        <span
          className={cn(
            'absolute -right-[3px] -bottom-[2px] flex items-center justify-center overflow-hidden rounded border-stone-200 bg-white',
            s.badge,
          )}
        >
          <img
            src="/assets/shell/metamask.svg"
            alt=""
            width={7}
            height={7}
            className={cn('object-contain', s.fox)}
          />
        </span>
      </span>
      {showLabel ? (
        <span className="text-base leading-6 font-medium">{label || 'Connect'}</span>
      ) : null}
    </button>
  )
}
