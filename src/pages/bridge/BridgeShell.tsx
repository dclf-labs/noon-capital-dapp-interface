import { Outlet } from 'react-router-dom'

import * as styles from '@/mock/bridge/bridge-styles'
import { BridgeNetworkSwitcher } from '@/mock/bridge/BridgeNetworkSwitcher'

export function BridgeShell() {
  return (
    <div style={styles.page}>
      <header style={{ display: 'grid', gap: 8 }}>
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
