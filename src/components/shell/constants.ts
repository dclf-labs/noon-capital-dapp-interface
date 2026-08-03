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

/** Fixed sidebar insets from the viewport edges. */
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

/**
 * Wait for the selection pill spring to settle before closing a dropdown /
 * mobile menu after a choice (matches `NetworkSelector`).
 */
export const SHELL_SELECTION_CLOSE_MS = 260

/**
 * Network dropdown panel — above shell chrome (sidebar 30, mobile drawer 100),
 * below modals / AppKit (1000).
 */
export const NETWORK_SELECTOR_Z_INDEX = 500

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
