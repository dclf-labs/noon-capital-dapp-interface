import {
  NavBridgeIcon,
  NavDashboardIcon,
  NavGiftIcon,
  NavGovernanceIcon,
  NavGridIcon,
  NavProtocolIcon,
  NavVaultIcon,
  SocialDiscordIcon,
  SocialGithubIcon,
  SocialLinkedInIcon,
  SocialTelegramIcon,
  SocialXIcon,
} from '@/assets/icons'
import type { ShellIcon, ShellNavItem } from '@/components/shell/types'
import { SITE_URLS } from '@/config/site-urls'

/** Outer content column — keeps the layout centered on wide / zoomed-out screens. */
export const APP_SHELL_MAX_PX = 1600

/** Collapsed sidebar rail — layout always reserves this so expand never reflows. */
export const SIDEBAR_RAIL_PX = 63
/** Expanded overlay width (Motion animates between rail ↔ expanded). */
export const SIDEBAR_EXPANDED_PX = 190

/** Fixed sidebar insets from the AppShell column edges (not raw viewport). */
export const SIDEBAR_INSET_TOP_PX = 4
export const SIDEBAR_INSET_LEFT_PX = 5

/** Width tween — springs bounce and can flash with overflow-hidden. */
export const SIDEBAR_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
}

/** Labels / stats fade slightly ahead of the width close. */
export const SIDEBAR_CONTENT_TRANSITION = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1] as const,
}

/** Shared layoutId pill for nav / network / APY segmented controls. */
export const SHELL_SELECTION_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

/** Sidebar / header APY info tip — trailing average, same idea as landing APY chart. */
export const APY_TIP = 'Trailing average daily APY for Noon protocols over the selected period.'

/**
 * Wait for the selection pill spring to settle before closing a dropdown /
 * mobile menu after a choice (matches `NetworkSelector`).
 */
export const SHELL_SELECTION_CLOSE_MS = 260

/**
 * Idle list / dropdown / modal option hover.
 * Soft `stone-100` idle option surface on white panels.
 * Do not apply when the option is selected (selected uses the black pill).
 */
export const LIST_OPTION_IDLE =
  'text-stone-700 transition-colors hover:bg-stone-100 hover:text-primary focus-visible:bg-stone-100 focus-visible:text-primary'

/** Selected option text — sits above the shared black `bg-primary` pill. */
export const LIST_OPTION_ACTIVE = 'text-white'

/** Absolute fill for the single active option (menubar / dropdown / modal). */
export const LIST_OPTION_ACTIVE_PILL = 'absolute inset-0 rounded-lg bg-primary'

/** Vertical rhythm between stacked options inside dropdown / menu panels. */
export const LIST_OPTION_STACK = 'flex flex-col gap-1 p-1.5'

/** Shared modal motion curve (same family as shell / panel springs). */
export const MODAL_EASE = [0.22, 1, 0.36, 1] as const

/** Backdrop — full blur/dim from the first frame (no fade). */
export const MODAL_BACKDROP_CLASS = 'absolute inset-0 bg-black/25 backdrop-blur-[3px]'

/** Dialog panel enter / exit — snappy; backdrop stays static. */
export const MODAL_PANEL_TRANSITION = { duration: 0.18, ease: MODAL_EASE }

/**
 * Chrome icon control (menu open / close) — Figma 4819:57195 / 4819:56931.
 * 32×32 white tile, 5.33px radius, 0.67px #E7E5E4 border, soft indigo shadow.
 */
export const SHELL_ICON_BUTTON =
  'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[5.33px] border-[0.67px] border-[#E7E5E4] bg-white p-2 text-primary shadow-[0_2.67px_1.33px_rgba(111,125,185,0.05)] transition-colors hover:text-primary'

/**
 * Modal / drawer dismiss control — same tile as shell chrome, muted icon that
 * shifts to primary on hover.
 */
export const MODAL_CLOSE_BUTTON =
  'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[5.33px] border-[0.67px] border-[#E7E5E4] bg-white p-2 text-stone-500 shadow-[0_2.67px_1.33px_rgba(111,125,185,0.05)] transition-colors hover:text-primary'

/**
 * Network dropdown panel — above shell chrome (sidebar 30, mobile drawer 100),
 * below modals / AppKit (1000).
 */
export const NETWORK_SELECTOR_Z_INDEX = 500

/**
 * HoverCard / Popover tips — above shell chrome, network dropdown, and modals
 * so tips remain readable from drawers and dialogs.
 */
export const TIP_Z_INDEX = 1100

/**
 * Tip collision inset from the viewport — matches mobile shell gutters (`px-3`).
 * Without this, Radix clamps tips flush to the screen edge.
 */
export const TIP_COLLISION_PADDING_PX = 12

export const SHELL_NAV: Omit<ShellNavItem, 'active'>[] = [
  { id: 'home', label: 'Home', icon: NavDashboardIcon, href: '/', enabled: true },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: NavProtocolIcon,
    href: '/',
    enabled: false,
  },
  { id: 'usn', label: 'USN / sUSN', icon: NavGovernanceIcon, href: '/stake', enabled: true },
  { id: 'vaults', label: 'Vaults', icon: NavVaultIcon, href: '/vaults', enabled: true },
  { id: 'noon', label: '$NOON', icon: NavBridgeIcon, href: '/governance', enabled: false },
  { id: 'points', label: 'Noon Points', icon: NavGiftIcon, href: '/points', enabled: false },
  { id: 'league', label: 'Noon League', icon: NavGridIcon, href: '/league', enabled: false },
]

/** Left column — same destinations as landing `DesktopFooter`. */
export const FOOTER_LEFT_LINKS = [
  { label: 'Solvency', href: SITE_URLS.community.accountable },
  { label: 'Voting', href: SITE_URLS.community.snapshot },
  { label: 'Docs', href: SITE_URLS.noon.docs },
  { label: 'Forum', href: SITE_URLS.noon.forum },
  { label: 'Blog', href: SITE_URLS.community.paragraph },
] as const

/** Legal links on noon.capital (landing `ROUTES.policy` / cookies / terms). */
export const FOOTER_RIGHT_LINKS = [
  { label: 'Privacy Policy', href: SITE_URLS.marketing.privacy },
  { label: 'Cookies', href: SITE_URLS.marketing.cookies },
  { label: 'Terms & conditions', href: SITE_URLS.marketing.terms },
] as const

/** Social row — same order/URLs as landing `SITE_URLS.social`. */
export const FOOTER_SOCIALS: ReadonlyArray<{
  label: string
  href: string
  icon: ShellIcon
}> = [
  { label: 'X', href: SITE_URLS.social.x, icon: SocialXIcon },
  { label: 'Telegram', href: SITE_URLS.social.telegram, icon: SocialTelegramIcon },
  { label: 'LinkedIn', href: SITE_URLS.social.linkedin, icon: SocialLinkedInIcon },
  { label: 'GitHub', href: SITE_URLS.social.github, icon: SocialGithubIcon },
  { label: 'Discord', href: SITE_URLS.social.discord, icon: SocialDiscordIcon },
]

/** Mark the nav item that matches the current route. */
export function shellNavForPath(pathname: string): ShellNavItem[] {
  return SHELL_NAV.map((item) => ({
    ...item,
    enabled: item.enabled !== false,
    active: item.enabled === false ? false : isShellNavActive(item.id, pathname),
  }))
}

function isShellNavActive(id: string, pathname: string): boolean {
  switch (id) {
    case 'home':
      // Home product surface: landing + Buy (/swap) share the Home rail highlight.
      return pathname === '/' || pathname.startsWith('/swap')
    case 'vaults':
      return pathname === '/vaults' || pathname.startsWith('/vaults/')
    case 'usn':
      return (
        pathname.startsWith('/stake') ||
        pathname.startsWith('/unstake') ||
        pathname.startsWith('/withdraw')
      )
    default:
      return pathname === SHELL_NAV.find((n) => n.id === id)?.href
  }
}
