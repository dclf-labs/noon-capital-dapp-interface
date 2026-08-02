import { Link, NavLink, Outlet } from 'react-router-dom'

import { useResolvedChain } from '@/hooks/connection'
import { NetworkSwitcher } from '@/mock/swap/NetworkSwitcher'
import * as styles from '@/mock/swap/trade-styles'

export function SwapShell() {
  const { chainFamily, config } = useResolvedChain()

  return (
    <div style={styles.page}>
      <header style={{ display: 'grid', gap: 8 }}>
        <div style={styles.row}>
          <Link to="/" style={styles.link}>
            ← Home
          </Link>
        </div>
        <h1 style={{ margin: 0, fontSize: 22 }}>Buy / Sell</h1>
        <p style={styles.muted}>
          Active network: <strong>{config.name}</strong> ({chainFamily})
        </p>
        <NetworkSwitcher />
        <nav style={styles.row}>
          <NavLink
            to="/swap/buy"
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Buy
          </NavLink>
          <NavLink
            to="/swap/sell"
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Sell
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
