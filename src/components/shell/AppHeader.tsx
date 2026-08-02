import { cn } from '@/lib/utils'

type AppHeaderProps = {
  walletLabel?: string
  networkIconSrc?: string
  onNetworkClick?: () => void
  onConnectClick?: () => void
}

const chip = 'flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white'

export function AppHeader({
  walletLabel,
  networkIconSrc = '/assets/shell/ethereum.png',
  onNetworkClick,
  onConnectClick,
}: AppHeaderProps) {
  return (
    <header className="flex w-full items-center justify-end gap-3.5 px-6 py-4">
      <button
        type="button"
        onClick={onNetworkClick}
        className={cn(chip, 'h-10 py-2 pr-2 pl-2')}
        aria-label="Select network"
      >
        <span className="size-6 overflow-hidden rounded-[5px] bg-[#627eea]">
          <img
            src={networkIconSrc}
            alt=""
            width={24}
            height={24}
            className="size-full object-cover"
          />
        </span>
        <img
          src="/assets/shell/chevron-down.svg"
          alt=""
          width={20}
          height={20}
          className="size-5"
        />
      </button>

      <button type="button" onClick={onConnectClick} className={cn(chip, 'py-2 pr-3 pl-2')}>
        <span className="relative size-6 overflow-hidden rounded">
          <img
            src="/assets/shell/wallet-avatar.png"
            alt=""
            width={24}
            height={24}
            className="size-full object-cover"
          />
          <span className="absolute -right-[3px] -bottom-[2.25px] size-3 overflow-hidden border-[0.75px] border-stone-200 bg-white">
            <img
              src="/assets/shell/metamask.svg"
              alt=""
              width={12}
              height={12}
              className="size-full object-cover"
            />
          </span>
        </span>
        <span className="text-base leading-6 font-medium text-stone-900">
          {walletLabel || 'Connect'}
        </span>
      </button>
    </header>
  )
}
