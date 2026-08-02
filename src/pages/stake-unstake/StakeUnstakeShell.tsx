import { Link, NavLink, Outlet } from 'react-router-dom'

import * as styles from '@/pages/stake-unstake/stake-unstake-styles'

export function StakeUnstakeShell() {
  return (
    <div style={styles.page}>
      <header style={{ display: 'grid', gap: 8 }}>
        <div style={styles.row}>
          <Link to="/" style={styles.link}>
            ← Home
          </Link>
        </div>
        <h1 style={{ margin: 0, fontSize: 22 }}>Stake / Unstake</h1>
        <p style={styles.muted}>
          Ethereum mainnet USN ↔ sUSN vault. Unstake starts a cooldown; claim matured requests on
          Withdraw.
        </p>
        <nav style={styles.row}>
          <NavLink
            to="/stake"
            end
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Stake
          </NavLink>
          <NavLink
            to="/unstake"
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Unstake
          </NavLink>
          <NavLink
            to="/withdraw"
            style={({ isActive }) => ({
              ...styles.buttonSecondary,
              ...(isActive ? { background: '#111', color: '#fff' } : null),
            })}
          >
            Withdraw
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
