import { useId, useMemo, useState } from 'react'

import { motion } from 'motion/react'

import { DividerIcon } from '@/assets/icons'
import {
  APY_TIP,
  SHELL_SELECTION_SPRING,
  SIDEBAR_CONTENT_TRANSITION,
  SIDEBAR_INSET_LEFT_PX,
  SIDEBAR_INSET_TOP_PX,
  SIDEBAR_RAIL_PX,
} from '@/components/shell/constants'
import type { ShellNavItem, SidebarApyPeriod } from '@/components/shell/types'
import { InfoTipIcon } from '@/components/ui/info-tip-icon'
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

function Divider() {
  return <DividerIcon width={24} height={1} className="h-px w-6 text-black/10" aria-hidden />
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
  const apyPeriodBgId = useId()

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
            <InfoTipIcon content={APY_TIP} label="About APY" size={12} />
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
              <InfoTipIcon content={APY_TIP} label="About APY" size={16} />
            </div>
            <div
              className="flex rounded-lg border border-[rgba(17,17,17,0.1)] bg-[#f8f8f8] p-px"
              role="group"
              aria-label="APY period"
            >
              {(['7d', '28d'] as const).map((period) => {
                const selected = apyPeriod === period
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => onApyPeriodChange?.(period)}
                    aria-pressed={selected}
                    className={cn(
                      'relative inline-flex rounded-lg px-2 py-1 text-sm leading-5 font-book transition-colors',
                      'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                      selected ? 'text-primary' : 'text-stone-500 hover:text-primary',
                    )}
                  >
                    {selected ? (
                      <motion.div
                        layoutId={`apy-period-bg-${apyPeriodBgId}`}
                        className="absolute inset-0 rounded-lg border border-[rgba(17,17,17,0.1)] bg-[rgba(255,255,255,0.7)]"
                        transition={SHELL_SELECTION_SPRING}
                      />
                    ) : null}
                    <span className="relative z-10">{period === '7d' ? '7D' : '28D'}</span>
                  </button>
                )
              })}
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
      navItems.map((item) => {
        const Icon = item.icon
        return {
          label: item.label,
          href: item.href,
          active: item.active,
          enabled: item.enabled !== false,
          icon: (
            <Icon
              width={24}
              height={24}
              className="size-6 shrink-0 transition-colors"
              aria-hidden
            />
          ),
        }
      }),
    [navItems],
  )

  return (
    <>
      {/* In-flow spacer — keeps main content clear of the fixed rail. */}
      <div className="shrink-0" style={{ width: SIDEBAR_RAIL_PX }} aria-hidden />
      <div
        className="fixed z-30 h-[min(701px,calc(100dvh-8px))]"
        style={{
          top: SIDEBAR_INSET_TOP_PX,
          left: SIDEBAR_INSET_LEFT_PX,
          width: SIDEBAR_RAIL_PX,
        }}
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
    </>
  )
}
