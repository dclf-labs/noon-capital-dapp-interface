import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { NoonLogo } from '@/assets/svgs'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/button'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { APP_NAME, ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSidebarOpen } from '@/store/slices/uiSlice'

const navItems = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.markets, label: 'Markets' },
  { to: ROUTES.portfolio, label: 'Portfolio' },
]

export function Header() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen)

  const closeMobileNav = () => dispatch(setSidebarOpen(false))

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <NavLink
            to={ROUTES.home}
            className="flex items-center gap-2 font-semibold tracking-tight"
            onClick={closeMobileNav}
          >
            <NoonLogo className="size-7" />
            <span>{APP_NAME}</span>
          </NavLink>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-accent text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>

      {sidebarOpen ? (
        <nav
          className="border-t border-border/60 bg-background px-4 py-3 sm:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === ROUTES.home}
                  onClick={closeMobileNav}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
                      isActive && 'bg-accent text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
