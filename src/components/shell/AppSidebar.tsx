import { useMemo, useState } from 'react'

import { motion } from 'motion/react'

import { SIDEBAR_CONTENT_TRANSITION, SIDEBAR_RAIL_PX } from '@/components/shell/constants'
import type { ShellNavItem, SidebarApyPeriod } from '@/components/shell/types'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { useSidebar } from '@/components/ui/sidebar-context'
import { cn } from '@/lib/utils'

type AppSidebarProps = {
  apy?: string
  tvl?: string
  apyPeriod?: SidebarApyPeriod
  onApyPeriodChange?: (period: SidebarApyPeriod) => void
  navItems: ShellNavItem[]
}

function SidebarLogo() {
  const { open } = useSidebar()

  return (
    <div className="relative h-5 w-full shrink-0 overflow-hidden">
      <motion.img
        src="/assets/shell/sidebar-logo.svg"
        alt="NOON"
        width={30}
        height={20}
        className="absolute top-0 left-1/2 h-5 w-[30px] -translate-x-1/2"
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={SIDEBAR_CONTENT_TRANSITION}
      />
      <motion.img
        src="/assets/shell/sidebar-logo-open.svg"
        alt=""
        width={68}
        height={20}
        aria-hidden
        className="absolute top-0 left-0 h-5 w-[68px]"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={SIDEBAR_CONTENT_TRANSITION}
      />
    </div>
  )
}

function InfoIcon({ size }: { size: 12 | 16 }) {
  return (
    <img
      src="/assets/shell/info.svg"
      alt=""
      width={size}
      height={size}
      className={size === 12 ? 'size-3' : 'size-4'}
    />
  )
}

function Divider() {
  return <img src="/assets/shell/divider.svg" alt="" width={24} height={1} className="h-px w-6" />
}

function SidebarStats({
  apy,
  tvl,
  apyPeriod,
  onApyPeriodChange,
}: {
  apy: string
  tvl: string
  apyPeriod: SidebarApyPeriod
  onApyPeriodChange?: (period: SidebarApyPeriod) => void
}) {
  const { open } = useSidebar()

  // Both layers stay mounted and crossfade — no AnimatePresence unmount flicker.
  return (
    <div className="relative min-h-[148px] w-full">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={SIDEBAR_CONTENT_TRANSITION}
        style={{ pointerEvents: open ? 'none' : 'auto' }}
        aria-hidden={open}
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5">
            <span className="text-xs leading-[18px] font-book text-stone-500">APY</span>
            <InfoIcon size={12} />
          </div>
          <span className="text-base leading-6 font-book text-stone-900">{apy}</span>
        </div>
        <Divider />
        <div className="flex flex-col items-center">
          <span className="text-xs leading-[18px] font-book text-stone-500">TVL</span>
          <span className="text-base leading-6 font-book text-stone-900">{tvl}</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={SIDEBAR_CONTENT_TRANSITION}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <span className="text-xs leading-[18px] font-book text-stone-500">APY</span>
              <InfoIcon size={16} />
            </div>
            <div
              className="flex overflow-hidden rounded-lg border border-[rgba(17,17,17,0.1)] bg-[#f8f8f8]"
              role="group"
              aria-label="APY period"
            >
              {(['7d', '28d'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => onApyPeriodChange?.(period)}
                  className={cn(
                    'rounded-lg px-2 py-1 text-sm leading-5 font-book text-stone-500',
                    apyPeriod === period &&
                      'border border-[rgba(17,17,17,0.1)] bg-[rgba(255,255,255,0.7)]',
                  )}
                >
                  {period === '7d' ? '7D' : '28D'}
                </button>
              ))}
            </div>
          </div>
          <p className="font-denton text-[36px] leading-none whitespace-nowrap text-black">{apy}</p>
        </div>

        <Divider />

        <div className="flex flex-col items-start gap-1">
          <span className="text-xs leading-[18px] font-book text-stone-500">TVL</span>
          <p className="font-denton text-xl leading-none whitespace-nowrap text-black">{tvl}</p>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Noon shell sidebar built on Aceternity UI's hover-expand Sidebar.
 * Rail width stays fixed so the page never reflows.
 */
export function AppSidebar({
  apy = '—',
  tvl = '—',
  apyPeriod = '7d',
  onApyPeriodChange,
  navItems,
}: AppSidebarProps) {
  const [open, setOpen] = useState(false)

  const links = useMemo(
    () =>
      navItems.map((item) => ({
        label: item.label,
        href: item.href,
        active: item.active,
        icon: (
          <span className="size-6 shrink-0 overflow-hidden">
            <img
              src={item.iconSrc}
              alt=""
              width={24}
              height={24}
              className={cn('size-full', item.active && 'brightness-0 invert')}
            />
          </span>
        ),
      })),
    [navItems],
  )

  return (
    <div
      className="sticky top-4 z-30 h-[min(701px,calc(100dvh-2rem))] shrink-0 self-start"
      style={{ width: SIDEBAR_RAIL_PX }}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="gap-6">
          <SidebarLogo />
          <nav className="flex w-full flex-1 flex-col gap-2" aria-label="Primary">
            {links.map((link) => (
              <SidebarLink key={link.href + link.label} link={link} />
            ))}
          </nav>
          <SidebarStats
            apy={apy}
            tvl={tvl}
            apyPeriod={apyPeriod}
            onApyPeriodChange={onApyPeriodChange}
          />
        </SidebarBody>
      </Sidebar>
    </div>
  )
}
