import { Link, NavLink, Outlet } from 'react-router-dom'

import * as styles from '@/mock/mint-redeem/mint-redeem-styles'

export function MintRedeemShell() {
  return (
    <div style={styles.page}>
      <header style={{ display: 'grid', gap: 8 }}>
        <div style={styles.row}>
          <Link to="/" style={styles.link}>
            ← Home
          </Link>
        </div>
        <h1 style={{ margin: 0, fontSize: 22 }}>Mint / Redeem</h1>
        <p style={styles.muted}>
          Separate from Buy / Sell. Ethereum mainnet direct mint & redeem — whitelisted wallets
          only.
        </p>
        <nav style={styles.row}>
          <NavLink
            to="/mint"
            end
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Mint
          </NavLink>
          <NavLink
            to="/redeem"
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Redeem
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
