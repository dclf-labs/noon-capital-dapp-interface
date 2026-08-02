import { WalletIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'

type ConnectWalletButtonProps = {
  onClick?: () => void
  className?: string
  /** Full-width in the mobile drawer; auto width in the desktop header. */
  fullWidth?: boolean
}

/** Primary “Connect wallet” CTA — Figma mobile menu / desktop disconnected state. */
export function ConnectWalletButton({
  onClick,
  className,
  fullWidth = false,
}: ConnectWalletButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg bg-[#6c77e9] px-4 py-3',
        'text-base leading-6 font-medium whitespace-nowrap text-stone-50',
        'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
        fullWidth ? 'w-full' : 'h-10 shrink-0 py-2',
        className,
      )}
    >
      <WalletIcon width={22} height={20} className="size-6 shrink-0 text-stone-50" aria-hidden />
      Connect wallet
    </button>
  )
}
