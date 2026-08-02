import { NetworkSelector } from '@/components/shell/NetworkSelector'
import { cn } from '@/lib/utils'

type AppHeaderProps = {
  walletLabel?: string
  onConnectClick?: () => void
}

const chip = 'flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white'

export function AppHeader({ walletLabel, onConnectClick }: AppHeaderProps) {
  return (
    <header className="flex w-full items-center justify-end gap-2 px-4 py-3 md:gap-[14px] md:px-6 md:py-4">
      <NetworkSelector />

      <button
        type="button"
        onClick={onConnectClick}
        className={cn(
          chip,
          'group overflow-visible py-2 pr-3 pl-2 text-stone-900 transition-colors hover:text-primary focus-visible:text-primary',
        )}
      >
        {/* Outer relative only — overflow on the avatar leaf so the connector badge isn't clipped. */}
        <span className="relative size-6 shrink-0">
          <span className="block size-6 overflow-hidden rounded">
            <img
              src="/assets/shell/wallet-avatar.png"
              alt=""
              width={24}
              height={24}
              className="size-full object-cover"
            />
          </span>
          {/* Figma: 12px badge; fox glyph ~7×6.75 centered (not stretched to fill). */}
          <span className="absolute -right-[3px] -bottom-[2.25px] flex size-3 items-center justify-center overflow-hidden rounded border-[0.75px] border-stone-200 bg-white">
            <img
              src="/assets/shell/metamask.svg"
              alt=""
              width={7}
              height={7}
              className="h-[6.75px] w-[7px] object-contain"
            />
          </span>
        </span>
        <span className="text-base leading-6 font-medium">{walletLabel || 'Connect'}</span>
      </button>
    </header>
  )
}
