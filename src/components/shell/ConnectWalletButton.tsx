import { WalletIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'

type ConnectWalletButtonProps = {
  onClick?: () => void
  className?: string
  /** Full-width in the mobile drawer; auto width in the desktop header. */
  fullWidth?: boolean
  /** Shorter label for tight header slots (aria-label stays “Connect wallet”). */
  compact?: boolean
}

/** Primary “Connect wallet” CTA — Figma mobile menu / desktop disconnected state. */
export function ConnectWalletButton({
  onClick,
  className,
  fullWidth = false,
  compact = false,
}: ConnectWalletButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Connect wallet"
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-3',
        'text-base leading-6 font-medium whitespace-nowrap text-stone-50',
        'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
        fullWidth ? 'w-full' : 'h-10 shrink-0 py-2',
        compact && 'gap-1 px-2.5 text-sm sm:gap-1.5 sm:px-4 sm:text-base',
        className,
      )}
    >
      <WalletIcon
        width={22}
        height={20}
        className={cn('shrink-0 text-stone-50', compact ? 'size-5 sm:size-6' : 'size-6')}
        aria-hidden
      />
      {compact ? (
        <>
          <span className="sm:hidden">Connect</span>
          <span className="hidden sm:inline">Connect wallet</span>
        </>
      ) : (
        'Connect wallet'
      )}
    </button>
  )
}
