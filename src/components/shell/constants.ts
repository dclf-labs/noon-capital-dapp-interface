import type { ShellNavItem } from '@/components/shell/types'

/** Outer content column — keeps the layout centered on wide / zoomed-out screens. */
export const APP_SHELL_MAX_PX = 1600

/** Collapsed sidebar rail — layout always reserves this so expand never reflows. */
export const SIDEBAR_RAIL_PX = 63
/** Expanded overlay width (Motion animates between rail ↔ expanded). */
export const SIDEBAR_EXPANDED_PX = 190

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

export const SHELL_NAV: Omit<ShellNavItem, 'active'>[] = [
  { id: 'home', label: 'Home', iconSrc: '/assets/shell/nav-dashboard.svg', href: '/' },
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconSrc: '/assets/shell/nav-protocol.svg',
    href: '/',
  },
  { id: 'usn', label: 'USN / sUSN', iconSrc: '/assets/shell/nav-governance.svg', href: '/stake' },
  { id: 'vaults', label: 'Vaults', iconSrc: '/assets/shell/nav-vault.svg', href: '/vaults' },
  { id: 'noon', label: '$NOON', iconSrc: '/assets/shell/nav-bridge.svg', href: '/governance' },
  { id: 'points', label: 'Noon Points', iconSrc: '/assets/shell/nav-gift.svg', href: '/points' },
  { id: 'league', label: 'Noon League', iconSrc: '/assets/shell/nav-grid.svg', href: '/league' },
]

export const FOOTER_LEFT_LINKS = [
  { label: 'Solvency', href: 'https://noon.accountable.capital/' },
  { label: 'Docs', href: 'https://docs.noon.capital/' },
  { label: 'Forum', href: 'https://forum.noon.capital/' },
  { label: 'Blog', href: 'https://blog.noon.capital/' },
] as const

export const FOOTER_RIGHT_LINKS = [
  { label: 'Privacy Policy', href: 'https://noon.capital/privacy' },
  { label: 'Cookies', href: 'https://noon.capital/cookies' },
  { label: 'Terms & conditions', href: 'https://noon.capital/terms' },
] as const

export const FOOTER_SOCIALS = [
  { label: 'X', href: 'https://x.com/noon_capital', iconSrc: '/assets/shell/social-x.svg' },
  {
    label: 'Telegram',
    href: 'https://t.me/noon_capital',
    iconSrc: '/assets/shell/social-telegram.svg',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/noon-capital',
    iconSrc: '/assets/shell/social-linkedin.svg',
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/noon',
    iconSrc: '/assets/shell/social-discord.svg',
  },
] as const

/** Mark the nav item that matches the current route. */
export function shellNavForPath(pathname: string): ShellNavItem[] {
  return SHELL_NAV.map((item) => ({
    ...item,
    active: isShellNavActive(item.id, pathname),
  }))
}

function isShellNavActive(id: string, pathname: string): boolean {
  switch (id) {
    case 'vaults':
      return pathname === '/' || pathname.startsWith('/vaults')
    case 'usn':
      return (
        pathname.startsWith('/stake') ||
        pathname.startsWith('/unstake') ||
        pathname.startsWith('/withdraw')
      )
    case 'home':
    case 'dashboard':
      // Placeholder destinations until dedicated pages ship.
      return false
    default:
      return pathname === SHELL_NAV.find((n) => n.id === id)?.href
  }
}
