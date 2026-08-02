import type { ComponentType, SVGProps } from 'react'

export type ShellIcon = ComponentType<SVGProps<SVGSVGElement>>

export type ShellNavItem = {
  id: string
  label: string
  icon: ShellIcon
  href: string
  active?: boolean
  /** When false, render as non-navigating (route not shipped yet). */
  enabled?: boolean
}

export type SidebarApyPeriod = '7d' | '28d'
