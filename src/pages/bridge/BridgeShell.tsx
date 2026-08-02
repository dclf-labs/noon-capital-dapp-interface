import { Link, Outlet } from 'react-router-dom'

import * as styles from '@/pages/bridge/bridge-styles'
import { BridgeNetworkSwitcher } from '@/pages/bridge/BridgeNetworkSwitcher'

export function BridgeShell() {
  return (
    <div style={styles.page}>
      <header style={{ display: 'grid', gap: 8 }}>
        <div style={styles.row}>
          <Link to="/" style={styles.link}>
            ← Home
          </Link>
        </div>
        <h1 style={{ margin: 0, fontSize: 22 }}>Bridge</h1>
        <p style={styles.muted}>
          Move USN / sUSN across Noon networks. Arrival usually takes 15–20 minutes.
        </p>
        <BridgeNetworkSwitcher />
      </header>

      <Outlet />
    </div>
  )
}
