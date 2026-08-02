import { Link } from 'react-router-dom'

import { WalletStatusPanel } from '@/components/wallet/WalletStatusPanel'

export function HomePage() {
  return (
    <div>
      <div style={{ padding: '16px 24px 0', fontFamily: 'system-ui, sans-serif' }}>
        <Link to="/swap/buy" style={{ color: '#111', fontSize: 14 }}>
          Open Buy / Sell →
        </Link>
      </div>
      <WalletStatusPanel />
    </div>
  )
}
