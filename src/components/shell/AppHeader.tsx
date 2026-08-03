import { MenuIcon } from '@/assets/icons'
import { ConnectWalletButton } from '@/components/shell/ConnectWalletButton'
import { APY_TIP } from '@/components/shell/constants'
import { NetworkSelector } from '@/components/shell/NetworkSelector'
import { WalletAvatarButton } from '@/components/shell/WalletAvatarButton'
import { InfoTipIcon } from '@/components/ui/info-tip-icon'
import { cn } from '@/lib/utils'

type AppHeaderProps = {
  walletLabel?: string
  /** True when a wallet is connected for the selected product network. */
  isConnected?: boolean
  onConnectClick?: () => void
  onMenuClick?: () => void
  apy?: string
  tvl?: string
}

/**
 * Desktop (lg+): network selector + connect CTA or connected wallet chip.
 * Mobile / tablet: hamburger · mark · APY/TVL · network · wallet CTA
 * (drawer still repeats connect / account at the bottom).
 */
export function AppHeader({
  walletLabel,
  isConnected = false,
  onConnectClick,
  onMenuClick,
  apy = '—',
  tvl = '—',
}: AppHeaderProps) {
  const walletControl = isConnected ? (
    <WalletAvatarButton onClick={onConnectClick} label={walletLabel} showLabel />
  ) : (
    <ConnectWalletButton onClick={onConnectClick} />
  )

  return (
    <>
      {/* Mobile + tablet top bar */}
      <header className="px-3 pt-2.5 pb-1 lg:hidden">
        <div
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-[#d4d1cf] bg-[#e9e9e9]/90 p-3 sm:gap-3',
            'backdrop-blur-[11.7px]',
          )}
        >
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className={cn(
              'flex shrink-0 items-center rounded-[5px] border border-stone-200 bg-white p-2 text-primary',
              'shadow-[0_2.67px_1.33px_rgba(111,125,185,0.05)]',
              'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
            )}
          >
            <MenuIcon width={16} height={16} className="size-4" aria-hidden />
          </button>

          <div className="min-w-0 flex-1">
            <img
              src="/assets/shell/sidebar-logo.svg"
              alt="NOON"
              width={35}
              height={24}
              className="h-6 w-auto"
            />
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-stone-200 bg-white px-2 py-1.5 min-[480px]:flex">
            <div className="flex flex-col items-start justify-center">
              <div className="mb-[-2px] flex items-center gap-0.5">
                <span className="text-xs leading-[18px] font-book text-stone-500">APY</span>
                <InfoTipIcon content={APY_TIP} label="About APY" size={16} />
              </div>
              <p className="font-denton text-base leading-5 text-black">{apy}</p>
            </div>
            <div className="flex flex-col items-start justify-center">
              <span className="mb-[-2px] text-xs leading-[18px] font-book text-stone-500">TVL</span>
              <p className="font-denton text-base leading-5 text-black">{tvl}</p>
            </div>
          </div>

          <div
            className="mx-0.5 hidden h-10 w-px shrink-0 bg-[#d4d1cf] min-[480px]:block"
            aria-hidden
          />

          <NetworkSelector />

          {/* Active-family connect / account — updates when switching to Starknet/Sui/etc. */}
          <div className="shrink-0">
            {isConnected ? (
              <WalletAvatarButton onClick={onConnectClick} label={walletLabel} />
            ) : (
              <ConnectWalletButton compact onClick={onConnectClick} />
            )}
          </div>
        </div>
      </header>

      {/* Desktop top bar */}
      <header className="hidden w-full items-center justify-end gap-2 px-4 py-3 lg:flex lg:gap-[14px] lg:px-6 lg:py-4">
        <NetworkSelector />
        {walletControl}
      </header>
    </>
  )
}
