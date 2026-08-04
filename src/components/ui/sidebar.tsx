/**
 * Aceternity UI Sidebar (hover-expand) — installed via
 * `npx shadcn@latest add @aceternity/sidebar`, adapted for Noon shell widths
 * and react-router links.
 *
 * @see https://ui.aceternity.com/components/sidebar
 */
import {
  type ComponentProps,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'

import {
  SHELL_SELECTION_SPRING,
  SIDEBAR_CONTENT_TRANSITION,
  SIDEBAR_EXPANDED_PX,
  SIDEBAR_RAIL_PX,
  SIDEBAR_TRANSITION,
} from '@/components/shell/constants'
import { SidebarContext, useSidebar } from '@/components/ui/sidebar-context'
import { cn } from '@/lib/utils'

export type SidebarLinkItem = {
  label: string
  href: string
  icon: ReactNode
  active?: boolean
  enabled?: boolean
}

function SidebarProvider({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: ReactNode
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  animate?: boolean
}) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = setOpenProp ?? setOpenState

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>
  )
}

export function Sidebar({
  children,
  open,
  setOpen,
  animate,
}: {
  children: ReactNode
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  animate?: boolean
}) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  )
}

export function SidebarBody(props: ComponentProps<typeof motion.div>) {
  return <DesktopSidebar {...props} />
}

export function DesktopSidebar({
  className,
  children,
  ...props
}: ComponentProps<typeof motion.div>) {
  const { open, setOpen, animate } = useSidebar()

  return (
    <motion.div
      className={cn(
        'absolute top-0 left-0 flex h-full flex-col overflow-hidden',
        // Solid fill — backdrop-blur on a resizing panel causes paint flicker.
        'rounded-lg border border-[#d4d1cf] bg-white p-[12px]',
        className,
      )}
      initial={false}
      animate={{
        width: animate ? (open ? SIDEBAR_EXPANDED_PX : SIDEBAR_RAIL_PX) : SIDEBAR_EXPANDED_PX,
        boxShadow: open ? '0 12px 40px rgba(17, 17, 17, 0.08)' : '0 0 0 rgba(17, 17, 17, 0)',
      }}
      transition={SIDEBAR_TRANSITION}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Optional full-screen mobile drawer (Aceternity default). Unused by AppShell for now. */
export function MobileSidebar({ className, children, ...props }: ComponentProps<'div'>) {
  const { open, setOpen } = useSidebar()

  return (
    <div
      className={cn(
        'flex h-10 w-full flex-row items-center justify-between bg-white px-4 py-4 md:hidden',
      )}
      {...props}
    >
      <div className="z-20 flex w-full justify-end">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(!open)}>
          <span className="text-sm font-medium text-[#111]">Menu</span>
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-white p-10',
              className,
            )}
          >
            <button
              type="button"
              className="absolute top-10 right-10 z-50 text-[#111]"
              aria-label="Close menu"
              onClick={() => setOpen(!open)}
            >
              Close
            </button>
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function SidebarLink({
  link,
  className,
  layoutId = 'shell-sidebar-nav-bg',
  ...props
}: {
  link: SidebarLinkItem
  className?: string
  /** Shared across nav siblings so the active pill slides between items. */
  layoutId?: string
} & Omit<ComponentProps<typeof Link>, 'to'>) {
  const { open, animate } = useSidebar()
  const enabled = link.enabled !== false

  const classNames = cn(
    // Stable layout — never flip justify/padding (that flashes icons on close).
    'group/sidebar relative flex h-10 w-full items-center gap-1 rounded-lg pr-3 pl-2 transition-colors',
    'ring-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
    link.active
      ? 'text-white'
      : enabled
        ? 'text-stone-500 hover:bg-stone-100 hover:text-primary focus-visible:bg-stone-100 focus-visible:text-primary'
        : 'pointer-events-none cursor-not-allowed text-stone-400 opacity-40',
    className,
  )

  const content = (
    <>
      {link.active ? (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-primary"
          transition={SHELL_SELECTION_SPRING}
        />
      ) : null}
      <span className="relative z-10 flex min-w-0 items-center gap-1">
        {link.icon}
        <motion.span
          initial={false}
          animate={
            animate
              ? {
                  opacity: open ? 1 : 0,
                  maxWidth: open ? 140 : 0,
                }
              : { opacity: 1, maxWidth: 140 }
          }
          transition={SIDEBAR_CONTENT_TRANSITION}
          className="overflow-hidden text-base leading-6 font-medium whitespace-nowrap"
          aria-hidden={!open}
        >
          {link.label}
        </motion.span>
      </span>
    </>
  )

  if (!enabled) {
    return (
      <span title={`${link.label} — coming soon`} aria-disabled="true" className={classNames}>
        {content}
      </span>
    )
  }

  return (
    <Link
      to={link.href}
      title={link.label}
      aria-current={link.active ? 'page' : undefined}
      className={classNames}
      {...props}
    >
      {content}
    </Link>
  )
}
